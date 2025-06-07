// src/cart/cart.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CartService } from './cart.service';
import { CartDTO, AddToCartInput, UpdateCartItemInput, RemoveFromCartInput, GetCartInput } from './dto/cart.dto';
import { BadRequestException } from '@nestjs/common';

@Resolver(() => CartDTO)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  // Query untuk mendapatkan keranjang belanja
  @Query(() => CartDTO, { nullable: true, description: 'Mendapatkan keranjang belanja berdasarkan customer_crm_id atau session_id.' })
  async cart(@Args('input') input: GetCartInput): Promise<CartDTO | null> {
    // Pastikan salah satu ID diberikan
    if (!input.customer_crm_id && !input.session_id) {
        throw new BadRequestException('Either customer_crm_id or session_id must be provided to get a cart.');
    }
    return this.cartService.getCart(input);
  }

  // Mutation untuk menambahkan produk ke keranjang
  @Mutation(() => CartDTO, { description: 'Menambahkan produk ke keranjang belanja.' })
  async addToCart(@Args('input') input: AddToCartInput): Promise<CartDTO> {
    // Pastikan salah satu ID diberikan
    if (!input.customer_crm_id && !input.session_id) {
        throw new BadRequestException('Either customer_crm_id or session_id must be provided to add to cart.');
    }
    return this.cartService.addToCart(input);
  }

  // Mutation untuk memperbarui kuantitas item di keranjang
  @Mutation(() => CartDTO, { description: 'Memperbarui kuantitas item di keranjang belanja.' })
  async updateCartItemQuantity(@Args('input') input: UpdateCartItemInput): Promise<CartDTO> {
    return this.cartService.updateCartItemQuantity(input);
  }

  // Mutation untuk menghapus item dari keranjang
  @Mutation(() => CartDTO, { description: 'Menghapus item dari keranjang belanja.' })
  async removeCartItem(@Args('input') input: RemoveFromCartInput): Promise<CartDTO> {
    return this.cartService.removeCartItem(input);
  }

  // Mutation untuk mengosongkan seluruh keranjang
  @Mutation(() => Boolean, { description: 'Mengosongkan seluruh keranjang belanja.' })
  async clearCart(@Args('input') input: GetCartInput): Promise<boolean> {
    // Pastikan salah satu ID diberikan
    if (!input.customer_crm_id && !input.session_id) {
        throw new BadRequestException('Either customer_crm_id or session_id must be provided to clear cart.');
    }
    return this.cartService.clearCart(input);
  }

  // Mutation untuk menghapus keranjang sepenuhnya
  @Mutation(() => Boolean, { description: 'Menghapus keranjang belanja sepenuhnya berdasarkan ID.' })
  async deleteCart(@Args('cart_id', { type: () => ID }) cart_id: number): Promise<boolean> {
    return this.cartService.deleteCart(cart_id);
  }
}