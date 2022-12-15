import { Entity, Column, ManyToOne, BaseEntity, PrimaryGeneratedColumn} from "typeorm";
import { Doctor, Patient } from "./index";


@Entity()
export class Complaints extends BaseEntity {
  
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    complaint : string

    @ManyToOne(() => Doctor, (doctor) => doctor.complaints)
    doctor: Doctor;
  
    @ManyToOne(() => Patient, (patient) => patient.complaints)
    patient: Patient;

    @Column({default : false})
    status : boolean
   
    @Column({type : 'timestamp', default : new Date()})
    created_at : Date
}
