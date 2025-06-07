    // src/product/product.resolver.ts
    // Pastikan ResolveField, Parent, Directive, Float, Int, ResolveReference diimpor
    import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Directive, Float, Int, ResolveReference } from '@nestjs/graphql';
    import { ProductService } from './product.service';
    import { ProductDTO, CreateProductInput, UpdateProductInput, ProductFilters } from './dto/product.dto';
    import { Product } from './entity/product.entity';

    @Resolver(() => ProductDTO)
    export class ProductResolver {
      constructor(private readonly productService: ProductService) {}

      @Query(() => ProductDTO, { nullable: true, description: 'Mengambil detail produk berdasarkan ID.' })
      async product(@Args('product_id', { type: () => ID }) product_id: number): Promise<ProductDTO | null> {
        const product = await this.productService.findOneById(product_id);
        return this.mapProductToDTO(product);
      }

      @Query(() => [ProductDTO], { description: 'Mengambil daftar semua produk, bisa difilter.' })
      async allProducts(@Args('filters', { type: () => ProductFilters, nullable: true }) filters?: ProductFilters): Promise<ProductDTO[]> {
        const products = await this.productService.findAll(filters);
        return products.map(p => this.mapProductToDTO(p)).filter((p): p is ProductDTO => p !== null);
      }

      @Mutation(() => ProductDTO, { description: 'Membuat produk baru.' })
      async createProduct(@Args('input') input: CreateProductInput): Promise<ProductDTO> {
        const newProduct = await this.productService.create(input);
        return this.mapProductToDTO(newProduct)!;
      }

      @Mutation(() => ProductDTO, { description: 'Memperbarui produk yang sudah ada.' })
      async updateProduct(
        @Args('product_id', { type: () => ID }) product_id: number,
        @Args('input') input: UpdateProductInput,
      ): Promise<ProductDTO> {
        const updatedProduct = await this.productService.update(product_id, input);
        return this.mapProductToDTO(updatedProduct)!;
      }

      @Mutation(() => Boolean, { description: 'Menghapus produk berdasarkan ID.' })
      async deleteProduct(@Args('product_id', { type: () => ID }) product_id: number): Promise<boolean> {
        return this.productService.delete(product_id);
      }

      @ResolveReference() // <-- PASTIKAN INI ADA
      async resolveReference(reference: { __typename: string; product_id: string }): Promise<ProductDTO> {
        const product = await this.productService.findOneById(parseInt(reference.product_id, 10));
        return this.mapProductToDTO(product)!;
      }

      private mapProductToDTO(product: Product): ProductDTO | null {
        if (!product) return null;

        const productDTO = new ProductDTO();
        productDTO.product_id = product.product_id;
        productDTO.name = product.name;
        productDTO.description = product.description;
        productDTO.price = product.price;
        productDTO.stock = product.stock;
        productDTO.image_url = product.image_url;
        productDTO.status = product.status;
        productDTO.created_at = product.created_at?.toISOString() ?? '';
        productDTO.updated_at = product.updated_at?.toISOString() ?? '';

        return productDTO;
      }
    }
    