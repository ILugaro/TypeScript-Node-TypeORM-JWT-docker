import { Entity, PrimaryColumn, Unique, OneToMany, OneToOne, JoinColumn} from "typeorm";
import { Length, IsNotEmpty} from "class-validator";
import { Visit } from "../visit/visit.models";


@Entity('box')
@Unique(["name"])
export class Box {
    //использую имя бокса вместо id, так как его длина до 4 символов
    @PrimaryColumn()
    @IsNotEmpty()
    @Length(2, 4)
    name: string;

    @OneToOne(() => Visit, (visit) => visit.box)
    visit: Visit
}


