import { Entity, PrimaryGeneratedColumn, Column, Unique, JoinColumn, OneToOne, UpdateDateColumn} from "typeorm";
import {Box} from "../box/box.models";
import {Car} from "../car/car.models";
import { User } from "../user/user.models";

@Entity('visit')
@Unique(["id"])
export class Visit {
  @PrimaryGeneratedColumn() 
  id: number;

  @OneToOne(() => Car, (car) => car.id,
  {
    onDelete: 'CASCADE',
  }) 
  @JoinColumn()
  car: string;

  @Column('boolean', {default: false}) 
  iscanseled: boolean;

  @Column()
  @UpdateDateColumn() 
  updatedAt: Date;

  @OneToOne(() => Box, (box) => box.name)
  @JoinColumn()
  box: Box

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user:number
} 