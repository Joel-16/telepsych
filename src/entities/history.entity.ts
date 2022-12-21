import { Patient,Account,Doctor } from "./index";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne} from "typeorm"

@Entity()
export class History extends BaseEntity{

   @PrimaryGeneratedColumn()
   id : number
   
   @ManyToOne(() => Doctor, (doctor) => doctor.history)
   doctor: Doctor;
 
   @ManyToOne(() => Patient, (patient) => patient.history)
   patient: Patient;
   
   @Column({type : 'timestamp', default : new Date()})
   date : Date
}