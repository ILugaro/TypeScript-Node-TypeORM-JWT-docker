import { Entity, PrimaryGeneratedColumn, Column, Unique} from "typeorm";
import { Length, IsNotEmpty} from "class-validator";
import * as bcrypt from "bcryptjs";

@Entity('user')
@Unique(["login", "phone"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(3, 20)
  login: string;

  @Column()
  @Length(6, 11)
  phone: string;

  @Column()
  @Length(4, 100)
  password: string;

  @Column({default:'c'})
  @IsNotEmpty()
  @Length(1)
  role: 'c'|'a' //c - клиент, a - админ

  hashPassword = async (): Promise<void> => {
    this.password = bcrypt.hashSync(this.password, 10);
  };

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string): boolean {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}