import { Entity, Column, JoinColumn, OneToMany} from "typeorm";
import { Account, Complaints,History } from "./index";

@Entity()
export class Patient extends Account {
  
    @OneToMany(() => Complaints, (complaints) => complaints.patient, { nullable: true, eager: false })
    @JoinColumn()
    complaints: Complaints[];

    @OneToMany(() => History, (history) => history.patient, { nullable: true, eager: false })
    @JoinColumn()
    history: History[];

}
