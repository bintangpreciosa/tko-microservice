// src/product/product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; 
import { Repository, Like } from 'typeorm'; 
import { Product } from './entity/product.entity'; 
import { CreateProductInput, UpdateProductInput, ProductFilters } from './dto/product.dto'; 

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product, 'productConnection')
    private productRepository: Repository<Product>,
  ) {}

  /**
   * @param filters
   * @returns 
   */
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const where: any = {}; 

    if (filters) {
      if (filters.search) {
        where.name = Like(`%${filters.search}%`);
      }
      if (filters.minPrice) {
        // Menambahkan kondisi harga minimum (price >= minPrice)
        where.price = { ...where.price, ...{ gte: filters.minPrice } };
      }
      if (filters.maxPrice) {
        // Menambahkan kondisi harga maksimum (price <= maxPrice)
        where.price = { ...where.price, ...{ lte: filters.maxPrice } };
      }
      if (filters.minStock) {
        // Menambahkan kondisi stok minimum (stock >= minStock)
        where.stock = { ...where.stock, ...{ gte: filters.minStock } };
      }
      if (filters.maxStock) {
        // Menambahkan kondisi stok maksimum (stock <= maxStock)
        where.stock = { ...where.stock, ...{ lte: filters.maxStock } };
      }
      if (filters.status) {
        // Menambahkan kondisi status produk (misalnya 'active', 'inactive')
        where.status = filters.status;
      }
    }

    return this.productRepository.find({ where });
  }

  /**
   * @param product_id ID dari produk yang akan diambil.
   * @returns Promise yang resolve ke objek Product.
   * @throws NotFoundException jika produk tidak ditemukan.
   */
  async findOneById(product_id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { product_id } });
    if (!product) {
      // Melemparkan exception jika produk tidak ditemukan
      throw new NotFoundException(`Product with ID ${product_id} not found.`);
    }
    return product;
  }

  /**
   * Membuat produk baru.
   * @param input Data input untuk produk baru.
   * @returns Promise yang resolve ke objek Product yang baru dibuat.
   */
  async create(input: CreateProductInput): Promise<Product> {
    // Membuat instance Product dari input
    const newProduct = this.productRepository.create(input);
    // Menyimpan produk baru ke database
    return this.productRepository.save(newProduct);
  }

  /**
   * Memperbarui produk yang sudah ada.
   * @param product_id ID dari produk yang akan diperbarui.
   * @param input Data input untuk pembaruan produk.
   * @returns Promise yang resolve ke objek Product yang diperbarui.
   * @throws NotFoundException jika produk tidak ditemukan.
   */
  async update(product_id: number, input: UpdateProductInput): Promise<Product> {
    // Mencari produk yang sudah ada
    const product = await this.findOneById(product_id); // Menggunakan findOneById untuk memastikan produk ada

    // Memperbarui properti produk dengan nilai dari input
    Object.assign(product, input);

    // Menyimpan perubahan ke database
    return this.productRepository.save(product);
  }

  /**
   * Menghapus produk berdasarkan ID-nya.
   * @param product_id ID dari produk yang akan dihapus.
   * @returns Promise yang resolve ke boolean (true jika berhasil dihapus, false jika tidak).
   */
  async delete(product_id: number): Promise<boolean> {
    // Menghapus produk dari database
    const result = await this.productRepository.delete(product_id);
    // Mengembalikan true jika ada baris yang terpengaruh (berarti berhasil dihapus), jika tidak false
    return (result.affected ?? 0) > 0;
  }
}
