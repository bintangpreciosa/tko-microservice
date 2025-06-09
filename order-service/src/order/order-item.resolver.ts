// src/order/order-item.resolver.ts
import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { OrderItemDTO, ProductReference } from './dto/order.dto';

@Resolver(() => OrderItemDTO)
export class OrderItemResolver {
  // Field Resolver untuk Product di dalam OrderItemDTO
  // Ini tetap dibutuhkan untuk memberi tahu Gateway bagaimana me-resolve ProductReference
  // dari OrderItemDTO, bahkan jika product_id saja yang kita punya.
  @ResolveField('product', () => ProductReference)
  async getProduct(@Parent() orderItem: OrderItemDTO): Promise<ProductReference> {
    return { product_id: orderItem.product_id };
  }

  // Resolver untuk productDisplayInfo yang membutuhkan name, price, dan stock
  @ResolveField(() => String, { nullable: true })
  productDisplayInfo(@Parent() orderItem: OrderItemDTO): string | null {
    // Karena `@requires(fields: "product { name price stock }")`,
    // Apollo Gateway akan memastikan `orderItem.product` sudah terisi dengan `name`, `price`, dan `stock`
    // sebelum resolver ini dijalankan.
    if (!orderItem.product) {
      return null;
    }
    const { name, price, stock } = orderItem.product;
    return `${name || 'N/A'} (Harga: ${price !== undefined ? price : 'N/A'}, Stok: ${stock !== undefined ? stock : 'N/A'})`;
  }

  // Resolver untuk stockStatusMessage yang membutuhkan stock
  @ResolveField(() => String, { nullable: true })
  stockStatusMessage(@Parent() orderItem: OrderItemDTO): string | null {
    if (!orderItem.product || orderItem.product.stock === undefined || orderItem.product.stock === null) {
      return "Informasi stok tidak tersedia.";
    }
    return orderItem.product.stock > 0 ? `Tersedia ${orderItem.product.stock} unit.` : 'Stok habis.';
  }
}