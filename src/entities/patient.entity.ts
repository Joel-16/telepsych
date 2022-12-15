import { Entity, Column, JoinColumn, OneToMany} from "typeorm";
import { Role } from "../types/dto";
import { Account, Complaints } from "./index";

@Entity()
export class Patient extends Account {
  
    @OneToMany(() => Complaints, (complaints) => complaints.patient, { nullable: true, eager: true })
    @JoinColumn()
    complaints: Complaints[];

 
}
