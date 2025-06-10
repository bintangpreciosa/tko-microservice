// src/payment/entity/payment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('Payment') 
export class Payment {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column()
  order_id: number; 

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 50 })
  payment_method: string; 

  @Column({ length: 20 })
  payment_status: string; 

  @CreateDateColumn() 
  payment_date: Date;
}