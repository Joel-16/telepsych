import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, JoinColumn, OneToMany} from "typeorm";
import { Role } from "../types/dto";
import { Account } from "./index";

@Entity()
export class Doctor extends Account {
  
    @Column({nullable : true})
    officeAddress : string
   
 
}
