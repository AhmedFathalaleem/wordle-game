import type { SiteSettings, Prisma } from '@prisma/client';

import { AppError } from '../../common/errors/app-error.js';
import type {
  CreateSiteSettingsInput,
  UpdateSiteSettingsInput,
} from './site-settings.schema.js';
import type { SiteSettingsRepository } from './site-settings.repository.js';

export class SiteSettingsService {
  constructor(private readonly siteSettingsRepository: SiteSettingsRepository) {}

  async getPublicSettings(): Promise<unknown> {
    const settings = await this.siteSettingsRepository.findFirst();

    if (!settings) {
      throw AppError.notFound('Site settings not found');
    }

    return this.mapPublicSettings(settings);
  }

  async getAdminSettings(): Promise<unknown> {
    const settings = await this.siteSettingsRepository.findFirst();

    if (!settings) {
      throw AppError.notFound('Site settings not found');
    }

    return this.mapAdminSettings(settings);
  }

  async create(input: CreateSiteSettingsInput, actorId: string): Promise<unknown> {
    const existing = await this.siteSettingsRepository.findFirst();

    if (existing) {
      throw AppError.conflict('Site settings already exist');
    }

    const settings = await this.siteSettingsRepository.create({
      siteTitle: input.siteTitle,
      siteDescription: input.siteDescription ?? null,
      ownerName: input.ownerName,
      logoUrl: input.logoUrl ?? null,
      faviconUrl: input.faviconUrl ?? null,
      theme: (input.theme ?? {}) as Prisma.InputJsonValue,
      analytics: (input.analytics ?? {}) as Prisma.InputJsonValue,
      updatedBy: { connect: { id: actorId } },
    });

    return this.mapAdminSettings(settings);
  }

  async update(input: UpdateSiteSettingsInput, actorId: string): Promise<unknown> {
    const existing = await this.siteSettingsRepository.findFirst();

    if (!existing) {
      throw AppError.notFound('Site settings not found');
    }

    const settings = await this.siteSettingsRepository.update(existing.id, {
      ...(input.siteTitle !== undefined ? { siteTitle: input.siteTitle } : {}),
      ...(input.siteDescription !== undefined ? { siteDescription: input.siteDescription } : {}),
      ...(input.ownerName !== undefined ? { ownerName: input.ownerName } : {}),
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
      ...(input.faviconUrl !== undefined ? { faviconUrl: input.faviconUrl } : {}),
      ...(input.theme !== undefined ? { theme: input.theme as Prisma.InputJsonValue } : {}),
      ...(input.analytics !== undefined ? { analytics: input.analytics as Prisma.InputJsonValue } : {}),
      updatedBy: { connect: { id: actorId } },
    });

    return this.mapAdminSettings(settings);
  }

  private mapPublicSettings(settings: SiteSettings) {
    return {
      id: settings.id,
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      ownerName: settings.ownerName,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      theme: settings.theme,
      updatedAt: settings.updatedAt,
    };
  }

  private mapAdminSettings(settings: SiteSettings) {
    return {
      ...this.mapPublicSettings(settings),
      analytics: settings.analytics,
      updatedById: settings.updatedById,
    };
  }
}
