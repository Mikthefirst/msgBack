//conv-to-user.entity.ts
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
@Entity({ name: 'conversations_to_user' })
export class ConversationToUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Conversation)
  @JoinColumn()
  conversation: Conversation;

  @Column({ nullable: true })
  isBlocked?: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;

  @Column({ nullable: true })
  isAdmin?: boolean;
}
