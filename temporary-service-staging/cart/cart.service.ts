// src/cart/cart.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { ProductService } from '../product/product.service';
import { CustomerService } from '../customer/customer.service';
import { CartDTO, CartItemDTO, AddToCartInput, UpdateCartItemInput, RemoveFromCartInput, GetCartInput } from './dto/cart.dto';
import { ProductDTO } from '../product/dto/product.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart, 'cartConnection')
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem, 'cartConnection')
    private cartItemRepository: Repository<CartItem>,
    private productService: ProductService,
    private customerService: CustomerService,
  ) {}

  // Helper untuk menghitung total harga keranjang
  private calculateCartTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => total + (item.quantity * item.price), 0);
  }

  // Helper untuk memetakan Cart Entity ke CartDTO
  private mapCartToDTO(cart: Cart | null): CartDTO | null { // Mengizinkan null sebagai input
    if (!cart) return null;

    const cartDTO = new CartDTO();
    cartDTO.cart_id = cart.cart_id;
    cartDTO.customer_crm_id = cart.customer_crm_id ?? null;
    cartDTO.session_id = cart.session_id ?? null;
    cartDTO.created_at = cart.created_at ? cart.created_at.toISOString() : '';
    cartDTO.updated_at = cart.updated_at ? cart.updated_at.toISOString() : '';

    cartDTO.cart_items = cart.cart_items ? cart.cart_items.map(item => ({
        cart_item_id: item.cart_item_id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
    })) : [];

    cartDTO.total_price = this.calculateCartTotal(cart.cart_items || []);

    return cartDTO;
  }

  // Method untuk mendapatkan keranjang (berdasarkan customer_crm_id atau session_id)
  async getCart(input: GetCartInput): Promise<CartDTO | null> {
    let cart: Cart | null = null; // Izinkan null
    if (input.customer_crm_id) {
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
    return this.mapCartToDTO(cart);
  }

  // Method untuk menambahkan item ke keranjang
  async addToCart(input: AddToCartInput): Promise<CartDTO> {
    let cart: Cart | null = null; // Izinkan null
    // Cari atau buat keranjang baru
    if (input.customer_crm_id) {
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
      cart = this.cartRepository.create({
        customer_crm_id: input.customer_crm_id ?? null,
        session_id: input.session_id ?? null,
      });
      cart = await this.cartRepository.save(cart);
    }

    // Validasi produk dari ProductService
    const product = await this.productService.findOneById(input.product_id);
    if (!product || product.stock < input.quantity) {
      throw new BadRequestException(`Product ${input.product_id} is out of stock or not found.`);
    }

    // Periksa apakah item sudah ada di keranjang
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

    const product = await this.productService.findOneById(cartItem.product_id);
    if (!product || product.stock < input.quantity) {
        throw new BadRequestException(`Product ${product.name} (ID: ${product.product_id}) is out of stock for quantity ${input.quantity}.`);
    }

    cartItem.quantity = input.quantity;
    await this.cartItemRepository.save(cartItem);

    const cart = await this.cartRepository.findOne({ where: { cart_id: cartItem.cart_id }, relations: ['cart_items'] });
    if (!cart) { // Pastikan cart tidak null
        throw new NotFoundException(`Cart not found for item ID ${input.cart_item_id}.`);
    }
    cart.updated_at = new Date();
    await this.cartRepository.save(cart);

    return this.mapCartToDTO(cart)!;
  }

  // Method untuk menghapus item dari keranjang
  async removeCartItem(input: RemoveFromCartInput): Promise<CartDTO> {
    const cartItem = await this.cartItemRepository.findOne({ where: { cart_item_id: input.cart_item_id }, relations: ['cart'] });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${input.cart_item_id} not found.`);
    }

    const cart = await this.cartRepository.findOne({ where: { cart_id: cartItem.cart_id }, relations: ['cart_items'] });
    if (!cart) { // Pastikan cart tidak null
        throw new NotFoundException(`Cart not found for item ID ${input.cart_item_id}.`);
    }

    await this.cartItemRepository.remove(cartItem);

    cart.cart_items = cart.cart_items.filter(item => item.cart_item_id !== input.cart_item_id);

    cart.updated_at = new Date();
    await this.cartRepository.save(cart);

    return this.mapCartToDTO(cart)!;
  }

  // Method untuk mengosongkan seluruh keranjang
  async clearCart(input: GetCartInput): Promise<boolean> {
    const cart = await this.cartRepository.findOne({
       where: input.customer_crm_id ? { customer_crm_id: input.customer_crm_id } : { session_id: input.session_id }
    });

    if (!cart) {
      return false; // Keranjang tidak ditemukan
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