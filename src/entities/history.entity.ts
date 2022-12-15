import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne} from "typeorm"
import { Account } from "./account.entity"

@Entity()
export class History extends BaseEntity{

   @PrimaryGeneratedColumn()
   id : number

   @ManyToOne(()=> Account, account=>account.address)
   account : Account
   
   @Column({type : 'timestamp', default : new Date()})
   date : Date
}