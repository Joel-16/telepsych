import { Entity, Column, BaseEntity, PrimaryGeneratedColumn} from "typeorm";
import { Photo,  Role } from '../types/dto';

@Entity()
export abstract class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id : number
  
  @Column({unique : true})
  email : string
  
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


  @Column({type : 'json', default : {filename : null, path : null}})
  image : Photo

  @Column({type : 'timestamp', default : new Date()})
  created_at : Date
 
}

