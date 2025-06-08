    // src/cart/cart.module.ts
    import { Module } from '@nestjs/common';
    import { TypeOrmModule } from '@nestjs/typeorm';

    import { CartService } from './cart.service';
    import { CartResolver } from './cart.resolver';
    import { Cart } from './entity/cart.entity';
    import { CartItem } from './entity/cart-item.entity';

    @Module({
      imports: [
        TypeOrmModule.forFeature([Cart, CartItem], 'cartConnection'),
      ],
      providers: [CartService, CartResolver],
      exports: [CartService]
    })
    export class CartModule {}
    