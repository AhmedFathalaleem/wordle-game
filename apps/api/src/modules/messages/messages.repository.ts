import type { Message, Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from '../../common/repositories/base.repository.js';

export class MessagesRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findMany(args: Prisma.MessageFindManyArgs): Promise<Message[]> {
    return this.prisma.message.findMany(args);
  }

  findById(id: string): Promise<Message | null> {
    return this.prisma.message.findUnique({ where: { id } });
  }

  create(data: Prisma.MessageCreateInput): Promise<Message> {
    return this.prisma.message.create({ data });
  }

  update(id: string, data: Prisma.MessageUpdateInput): Promise<Message> {
    return this.prisma.message.update({ where: { id }, data });
  }
}
