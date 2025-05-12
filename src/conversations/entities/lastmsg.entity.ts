import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
        SELECT 
            m.conversation_id as "conversationId",
            m.id as "messageId",
            m.content,
            m.timestamp,
            m.sender_id as "senderId"
        FROM message m
        INNER JOIN (
            SELECT 
                conversation_id, 
                MAX(timestamp) AS max_timestamp
            FROM message
            GROUP BY conversation_id
        ) latest ON m.conversation_id = latest.conversation_id 
                 AND m.timestamp = latest.max_timestamp
    `,
})
export class ConversationLastMessage {
  @ViewColumn()
  conversationId: string;

  @ViewColumn()
  messageId: string;

  @ViewColumn()
  content: string;

  @ViewColumn()
  timestamp: Date;

  @ViewColumn()
  senderId: string;
}

/*
const lastMessages = await dataSource
  .getRepository(ConversationLastMessage)
  .find();*/