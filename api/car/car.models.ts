import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn} from "typeorm";
import { Length, IsNotEmpty} from "class-validator";
import {User} from "../user/user.models";

@Entity('car')
@Unique(["number"])
export class Car {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @Length(3, 10)
  number: string;

  @Column()
  @Length(3, 15)
  brand: string;

  @Column()
  @Length(1, 15)
  name: string;

  @Column()
  owner_id: number;

  @ManyToOne(
    () => User,
    (user) => user.id,
    {
        onDelete: 'CASCADE',
    })
   @JoinColumn({
		name: 'owner_id',
	})
	user: User;
}