// dto/create-group.dto.ts
export class CreateGroupConversationDto {
  groupName: string;
  groupNickname: string
  groupAvatar?: Buffer;
  participantIds?: string[]; // можно пустой []
}
