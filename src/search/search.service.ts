import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Conversation } from "src/conversations/entities/conversation.entity";
import { User } from "src/users/entities/user.entity";
import { Brackets, ILike, Repository } from "typeorm";

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
  ) {}


   async searchUsers(term: string) {
    return this.userRepo.find({
      where: { nickname: ILike(`%${term}%`) },
      select: ['id', 'username', 'nickname', 'avatar'],
      take: 10,
    });
  }

   async searchGroups(term: string) {
    return this.convRepo
      .createQueryBuilder('conversation')
      .where('conversation.isGroup = :isGroup', { isGroup: true })
      .andWhere(
        new Brackets((qb) => {
          qb.where('conversation.groupName ILIKE :term', {
            term: `%${term}%`,
          }).orWhere('conversation.group_nickname ILIKE :term', {
            term: `%${term}%`,
          });
        }),
      )
      .select([
        'conversation.id',
        'conversation.group_nickname',
        'conversation.groupName',
        'conversation.groupAvatar',
      ])
      .limit(10)
      .getMany();
  }
}
