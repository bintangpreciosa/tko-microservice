import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { CartItemDTO, ProductReference } from './dto/cart.dto';

@Resolver(() => CartItemDTO)
export class CartItemResolver {
  @ResolveField('product', () => ProductReference)
  async getProduct(@Parent() cartItem: CartItemDTO): Promise<ProductReference> {
    return { product_id: cartItem.product_id };
  }

  @ResolveField(() => String, { nullable: true })
  productDetailSummary(@Parent() cartItem: CartItemDTO): string | null {
    if (!cartItem.product) {
      return null;
    }
    const { name, price, stock } = cartItem.product;
    const productName = name || 'N/A';
    const productPrice = price !== undefined && price !== null ? `Rp${price.toFixed(2)}` : 'N/A';
    const productStock = stock !== undefined && stock !== null ? `${stock} unit` : 'N/A';
    return `Produk: ${productName} - Harga: ${productPrice} - Stok: ${productStock}`;
  }
}