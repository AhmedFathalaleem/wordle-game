import { MessageStatus } from '@prisma/client';
import type { Message } from '@prisma/client';

import { BaseResourceService } from '../../common/services/base-resource.service.js';
import type { ListContext, PaginatedResult } from '../../types/pagination.types.js';
import type { MessagesRepository } from './messages.repository.js';
import type {
  CreateMessageInput,
  MessageListQuery,
  UpdateMessageInput,
} from './messages.schema.js';

export class MessagesService extends BaseResourceService<Message, MessageListQuery> {
  protected readonly resourceLabel = 'Message';
  protected readonly defaultSort = '-createdAt';
  protected readonly sortableFields = {
    createdAt: 'createdAt',
    status: 'status',
    email: 'email',
    name: 'name',
  };
  protected readonly searchableFields = ['name', 'email', 'subject', 'body'];

  constructor(private readonly messagesRepository: MessagesRepository) {
    super();
  }

  list(query: MessageListQuery, context: ListContext = {}): Promise<PaginatedResult<unknown>> {
    void context;
    return this.listRecords(query, context, {
      buildWhere: (listQuery) => this.buildWhere(listQuery),
      findMany: (args) => this.messagesRepository.findMany(args),
      mapRecord: (record) => this.mapMessage(record as Message, false),
    });
  }

  async getById(id: string, context: ListContext = {}): Promise<unknown> {
    void context;
    return this.mapMessage(this.ensureFound(await this.messagesRepository.findById(id)), true);
  }

  async create(
    input: CreateMessageInput,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<unknown> {
    const message = await this.messagesRepository.create({
      name: input.name,
      email: input.email,
      subject: input.subject,
      body: input.message,
      status: MessageStatus.NEW,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return this.mapMessage(message, false);
  }

  async update(id: string, input: UpdateMessageInput): Promise<unknown> {
    this.ensureFound(await this.messagesRepository.findById(id));

    const readAt =
      input.readAt !== undefined
        ? input.readAt
        : input.status === MessageStatus.READ
          ? new Date()
          : undefined;

    const message = await this.messagesRepository.update(id, {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(readAt !== undefined ? { readAt } : {}),
    });

    return this.mapMessage(message, true);
  }

  async remove(id: string): Promise<void> {
    this.ensureFound(await this.messagesRepository.findById(id));
    await this.messagesRepository.update(id, {
      status: MessageStatus.ARCHIVED,
      readAt: new Date(),
    });
  }

  private buildWhere(query: MessageListQuery): Record<string, unknown> {
    const where: Record<string, unknown> = {
      status: query.status ?? { not: MessageStatus.ARCHIVED },
    };

    if (query.email) {
      where.email = { equals: query.email, mode: 'insensitive' };
    }

    return where;
  }

  private mapMessage(message: Message, includeInternalFields: boolean) {
    const base = {
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.body,
      createdAt: message.createdAt,
    };

    if (!includeInternalFields) {
      return base;
    }

    return {
      ...base,
      status: message.status,
      readAt: message.readAt,
      ipAddress: message.ipAddress,
      userAgent: message.userAgent,
    };
  }
}
