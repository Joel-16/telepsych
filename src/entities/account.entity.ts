import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, JoinColumn, OneToMany} from "typeorm";
import { History } from './history.entity';
import { Photo,  Role } from '../types/dto';
import { Chats } from "./chats.entity";

@Entity()
export abstract class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id : number

  @Column()
  role : Role

  @Column({nullable : true})
  firstname: string;

  @Column({nullable : true})
  lastname: string;

  @Column({nullable : true})
  age: number;

  @Column({nullable : true})
  state: string;

  @Column({nullable : true})
  lga: string;

  @Column({nullable : true})
  phoneNumber: string;

  @Column({select : false})
  password : string

  @Column({unique : true})
  email : string

  @Column({type : 'json',nullable : true})
  image : Photo

  @Column({type : 'timestamp', default : new Date()})
  created_at : Date
 
}

