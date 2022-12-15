import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, JoinColumn, OneToMany, ManyToOne} from "typeorm";
import { Chats } from "./chats.entity";


@Entity()
export class Messages extends BaseEntity {
  @PrimaryGeneratedColumn()
  id : number

  @Column()
  content : string

  @Column()
  sender : number

  @Column()
  recipient : number

  @Column({type : 'timestamp', default : new Date()})
  created_at : Date

  @ManyToOne(() => Chats, chats=> chats.messages, {onDelete : 'CASCADE'})
  chats : Chats
  
}

