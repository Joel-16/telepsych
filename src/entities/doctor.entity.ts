import { Entity, Column, JoinColumn, OneToMany} from "typeorm";
import { Account , Complaints} from "./index";

@Entity()
export class Doctor extends Account {
  
    @Column({nullable : true})
    officeAddress : string

    @Column({default : false})
    suspended : boolean
   
    @OneToMany(() => Complaints, (complaints) => complaints.doctor, { nullable: true, eager: false })
    @JoinColumn()
    complaints: Complaints[];

}
