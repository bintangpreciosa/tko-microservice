// src/cart/cart.service.ts
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; 
import axios from 'axios';

// Tambahkan import untuk entitas Cart dan CartItem
import { Cart } from './entity/cart.entity'; 
import { CartItem } from './entity/cart-item.entity';

import { CartDTO, CartItemDTO, AddToCartInput, UpdateCartItemInput, RemoveFromCartInput, GetCartInput, ProductReference, CustomerReference } from './dto/cart.dto';

@Injectable()
export class CartService {
  private readonly PRODUCT_SERVICE_URL = 'http://localhost:4001/graphql';
  private readonly CUSTOMER_SERVICE_URL = 'http://localhost:4006/graphql'; 

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private dataSource: DataSource,
  ) {}

  // Helper untuk menghitung total harga keranjang
  private calculateCartTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => total + (item.quantity * item.price), 0);
  }

  // Helper untuk memetakan Cart Entity ke CartDTO
  private mapCartToDTO(cart: Cart | null): CartDTO | null {
    if (!cart) return null;

    const cartDTO = new CartDTO();
    cartDTO.cart_id = cart.cart_id;
    cartDTO.customer_crm_id = cart.customer_crm_id ?? null;
    cartDTO.customer = cart.customer_crm_id ? { id: String(cart.customer_crm_id) } : null; 
    cartDTO.session_id = cart.session_id ?? null;
    cartDTO.created_at = cart.created_at ? cart.created_at.toISOString() : '';
    cartDTO.updated_at = cart.updated_at ? cart.updated_at.toISOString() : '';
    
    cartDTO.cart_items = cart.cart_items ? cart.cart_items.map(item => ({
      cart_item_id: item.cart_item_id,
      cart_id: item.cart_id,
      product_id: item.product_id, 
      product: { product_id: item.product_id },
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
    })) : [];

    cartDTO.total_price = this.calculateCartTotal(cart.cart_items || []);

    return cartDTO;
  }

  // Method untuk mendapatkan keranjang (berdasarkan customer_crm_id atau session_id)
  async getCart(input: GetCartInput): Promise<CartDTO | null> {
    let cart: Cart | null = null;
    if (input.cart_id) {
      cart = await this.cartRepository.findOne({ 
        where: { cart_id: input.cart_id },
        relations: ['cart_items']
      });
    } else if (input.customer_crm_id) {
      cart = await this.cartRepository.findOne({ 
        where: { customer_crm_id: input.customer_crm_id },
        relations: ['cart_items']
      });
    } else if (input.session_id) {
      cart = await this.cartRepository.findOne({
        where: { session_id: input.session_id },
        relations: ['cart_items']
      });
    }

    if (!cart) {
        return null;
    }
    cart.cart_items = cart.cart_items || []; 
    return this.mapCartToDTO(cart);
  }

  // Method untuk menambahkan item ke keranjang
  async addToCart(input: AddToCartInput): Promise<CartDTO> {
    let customer: any = null;
    if (input.customer_crm_id) {
        const customerQuery = `
            query GetCustomerFromAdapter($id: ID!) {
                customer(id: $id) {
                    id
                }
            }
        `;
        try {
            const response = await axios.post(this.CUSTOMER_SERVICE_URL, {
                query: customerQuery,
                variables: { id: input.customer_crm_id }
            });
            if (response.data.errors) {
                console.error('Customer Adapter Errors:', response.data.errors);
                throw new InternalServerErrorException('Customer Adapter returned errors.');
            }
            customer = response.data.data.customer;
            if (!customer) {
                throw new BadRequestException(`Customer with ID ${input.customer_crm_id} not found via adapter.`);
            }
        } catch (error) {
            console.error('Error calling Customer Adapter from Cart Service:', error.message);
            throw new InternalServerErrorException(`Failed to connect to Customer Adapter: ${error.message}`);
        }
    } else if (!input.session_id) {
        throw new BadRequestException('Either customer_crm_id or session_id must be provided to add to cart.');
    }

    // Cari atau buat keranjang baru
    let cart = await this.cartRepository.findOne({
      where: input.customer_crm_id ? { customer_crm_id: input.customer_crm_id } : { session_id: input.session_id },
      relations: ['cart_items']
    });

    if (!cart) {
      cart = this.cartRepository.create({
        customer_crm_id: input.customer_crm_id ?? null,
        session_id: input.session_id ?? null,
      });
      cart.cart_items = []; 
      cart = await this.cartRepository.save(cart);
    }
    cart.cart_items = cart.cart_items || []; 
    
    // Validasi produk dari Product Service (via HTTP/GraphQL)
    const productQuery = `
        query GetProduct($productId: ID!) {
            product(product_id: $productId) {
                product_id
                name
                price
                stock
            }
        }
    `;
    let product: any;
    try {
        const response = await axios.post(this.PRODUCT_SERVICE_URL, {
            query: productQuery,
            variables: { productId: input.product_id }
        });
        if (response.data.errors) {
            console.error('Product Service Errors:', response.data.errors);
            throw new InternalServerErrorException('Product Service returned errors.');
        }
        product = response.data.data.product;
        if (!product || product.stock < input.quantity) {
            throw new BadRequestException(`Product (ID: ${input.product_id}) is out of stock or not found.`);
        }
    } catch (error) {
        console.error('Error calling Product Service from Cart Service:', error.message);
        throw new InternalServerErrorException(`Failed to connect to Product Service: ${error.message}`);
    }

    let cartItem = cart.cart_items.find(item => item.product_id === input.product_id);

    if (cartItem) {
      // Update kuantitas jika sudah ada
      cartItem.quantity += input.quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      // Tambahkan item baru jika belum ada
      cartItem = this.cartItemRepository.create({
        cart_id: cart.cart_id,
        product_id: input.product_id,
        product_name: product.name, 
        quantity: input.quantity,
        price: product.price, 
      });
      await this.cartItemRepository.save(cartItem);
      cart.cart_items.push(cartItem);
    }
    
    cart.updated_at = new Date();
    await this.cartRepository.save(cart);

    return this.mapCartToDTO(cart)!;
  }

  // Method untuk memperbarui kuantitas item di keranjang
  async updateCartItemQuantity(input: UpdateCartItemInput): Promise<CartDTO> {
    const cartItem = await this.cartItemRepository.findOne({ where: { cart_item_id: input.cart_item_id }, relations: ['cart'] });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${input.cart_item_id} not found.`);
    }
    
    // Validasi stok ulang jika kuantitas meningkat
    const productQuery = `
        query GetProduct($productId: ID!) {
            product(product_id: $productId) {
                product_id
                name
                stock
            }
        }
    `;
    let product: any;
    try {
        const response = await axios.post(this.PRODUCT_SERVICE_URL, {
            query: productQuery,
            variables: { productId: cartItem.product_id }
        });
        if (response.data.errors) {
            console.error('Product Service Errors:', response.data.errors);
            throw new InternalServerErrorException('Product Service returned errors.');
        }
        product = response.data.data.product;
        if (!product || product.stock < input.quantity) {
            throw new BadRequestException(`Product ${product.name} (ID: ${product.product_id}) is out of stock for quantity ${input.quantity}.`);
        }
    } catch (error) {
        console.error('Error calling Product Service from Cart Service:', error.message);
        throw new InternalServerErrorException(`Failed to connect to Product Service: ${error.message}`);
    }

    cartItem.quantity = input.quantity;
    await this.cartItemRepository.save(cartItem);

    const cart = await this.cartRepository.findOne({ where: { cart_id: cartItem.cart_id }, relations: ['cart_items'] });
    if (!cart) {
        throw new NotFoundException(`Cart not found for item ID ${input.cart_item_id}.`);
    }
    cart.updated_at = new Date();
    await this.cartRepository.save(cart);

    return this.mapCartToDTO(cart)!;
  }

  // Method untuk menghapus item dari keranjang
  async removeCartItem(input: RemoveFromCartInput): Promise<CartDTO> {
  const cartItemToRemove = await this.cartItemRepository.findOne({ where: { cart_item_id: input.cart_item_id }, relations: ['cart'] });
  if (!cartItemToRemove) {
    throw new NotFoundException(`Cart item with ID ${input.cart_item_id} not found.`);
  }

  // Ambil cart_id sebelum itemnya dihapus
  const cartId = cartItemToRemove.cart_id;

  // Hapus item dari database
  await this.cartItemRepository.remove(cartItemToRemove); 
  
  const updatedCart = await this.cartRepository.findOne({ 
      where: { cart_id: cartId }, 
      relations: ['cart_items'] 
  });

  if (!updatedCart) {
      throw new NotFoundException(`Cart not found after removing item ID ${input.cart_item_id}.`);
  }

  // Perbarui updated_at dan total_price
  updatedCart.updated_at = new Date();
  updatedCart.total_price = this.calculateCartTotal(updatedCart.cart_items || []); 
  await this.cartRepository.save(updatedCart);

  return this.mapCartToDTO(updatedCart)!; 
}

  // Method untuk mengosongkan seluruh keranjang
  async clearCart(input: GetCartInput): Promise<boolean> {
    const cart = await this.cartRepository.findOne({
        where: input.customer_crm_id ? { customer_crm_id: input.customer_crm_id } : { session_id: input.session_id }
    });

    if (!cart) {
      return false;
    }
    
    await this.cartItemRepository.delete({ cart_id: cart.cart_id });
    await this.cartRepository.update(cart.cart_id, { updated_at: new Date() });
    console.log(`[MOCK] Cleared cart with ID: ${cart.cart_id}`);
    return true;
  }

  // Method untuk menghapus keranjang (dan itemnya karena cascade)
  async deleteCart(cart_id: number): Promise<boolean> {
    const result = await this.cartRepository.delete(cart_id);
    return (result.affected ?? 0) > 0;
  }
}