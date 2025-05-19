import { Conversation } from 'src/conversations/entities/conversation.entity';
import { User } from 'src/users/entities/user.entity';
import { msgType } from 'src/enums/msg.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';


@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @ManyToOne(() => Conversation)
  @JoinColumn()
  conversation: Conversation;

  @Column('text')
  content: string;

  //files
  @Column({
    type: 'enum',
    enum: msgType,
    default: msgType.TEXT,
  })
  type: msgType;

  @Column({ nullable: true })
  fileUrl?: string;

  @Column({ nullable: true, default: false })
  read?: boolean;

  @Column({ nullable: true })
  imageUrl?: string;

  //time
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  UpdatedAt: Date;

}


