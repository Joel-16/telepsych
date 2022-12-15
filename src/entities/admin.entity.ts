import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, JoinColumn, OneToMany} from "typeorm";
import { Role } from "../types/dto";

@Entity()
export class Admin extends BaseEntity {
   @PrimaryGeneratedColumn()
   id: number

   @Column({default: "ADMIN"})
   role : Role

   @Column({ unique : true})
   email : string

   @Column({select : false})
   password : string
   
 
}
