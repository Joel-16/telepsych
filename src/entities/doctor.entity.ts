import { Entity, Column, JoinColumn, OneToMany} from "typeorm";
import { Photo } from "../types/dto";
import { Account , Complaints} from "./index";

@Entity()
export class Doctor extends Account {
  
    @Column({nullable : true})
    officeAddress : string

    @Column({default : false})
    suspended : boolean

    @Column({type : 'json', default : {filename : null, path : null}, select : false})
    uniCert : Photo

    @Column({type : 'json', default : {filename : null, path : null}, select : false})
    doctorCert : Photo
   
    @OneToMany(() => Complaints, (complaints) => complaints.doctor, { nullable: true, eager: false })
    @JoinColumn()
    complaints: Complaints[];

}
