import { Router } from 'express';

import { createAdminModule } from '../modules/admin/index.js';
import { createAuthModule } from '../modules/auth/index.js';
import { createCertificationsModule } from '../modules/certifications/index.js';
import { createHealthModule } from '../modules/health/index.js';
import { createMessagesModule } from '../modules/messages/index.js';
import { createProjectsModule } from '../modules/projects/index.js';
import { createSiteSettingsModule } from '../modules/site-settings/index.js';
import { createSkillsModule } from '../modules/skills/index.js';
import { createSocialLinksModule } from '../modules/social-links/index.js';
import type { AppDependencies } from '../types/app.types.js';

export function createV1Router(dependencies: AppDependencies): Router {
  const router = Router();

  const healthModule = createHealthModule(dependencies.prisma);
  const authModule = createAuthModule(dependencies.prisma, dependencies.config);
  const adminModule = createAdminModule(dependencies.config);
  const projectsModule = createProjectsModule(dependencies.prisma, dependencies.config);
  const skillsModule = createSkillsModule(dependencies.prisma, dependencies.config);
  const certificationsModule = createCertificationsModule(
    dependencies.prisma,
    dependencies.config,
  );
  const messagesModule = createMessagesModule(dependencies.prisma, dependencies.config);
  const socialLinksModule = createSocialLinksModule(dependencies.prisma, dependencies.config);
  const siteSettingsModule = createSiteSettingsModule(dependencies.prisma, dependencies.config);

  router.use('/health', healthModule.router);
  router.use('/auth', authModule.router);
  router.use('/admin', adminModule.router);

  const projectsPublicRouter = Router();
  projectsModule.mountPublicRoutes(projectsPublicRouter);
  router.use('/projects', projectsPublicRouter);

  const skillsPublicRouter = Router();
  skillsModule.mountPublicRoutes(skillsPublicRouter);
  router.use('/skills', skillsPublicRouter);

  const certificationsPublicRouter = Router();
  certificationsModule.mountPublicRoutes(certificationsPublicRouter);
  router.use('/certifications', certificationsPublicRouter);

  const messagesPublicRouter = Router();
  messagesModule.mountPublicRoutes(messagesPublicRouter);
  router.use('/messages', messagesPublicRouter);

  const socialLinksPublicRouter = Router();
  socialLinksModule.mountPublicRoutes(socialLinksPublicRouter);
  router.use('/social-links', socialLinksPublicRouter);

  const siteSettingsPublicRouter = Router();
  siteSettingsModule.mountPublicRoutes(siteSettingsPublicRouter);
  router.use('/site-settings', siteSettingsPublicRouter);

  const projectsAdminRouter = Router();
  projectsModule.mountAdminRoutes(projectsAdminRouter);
  router.use('/admin/projects', projectsAdminRouter);

  const skillsAdminRouter = Router();
  skillsModule.mountAdminRoutes(skillsAdminRouter);
  router.use('/admin/skills', skillsAdminRouter);

  const certificationsAdminRouter = Router();
  certificationsModule.mountAdminRoutes(certificationsAdminRouter);
  router.use('/admin/certifications', certificationsAdminRouter);

  const messagesAdminRouter = Router();
  messagesModule.mountAdminRoutes(messagesAdminRouter);
  router.use('/admin/messages', messagesAdminRouter);

  const socialLinksAdminRouter = Router();
  socialLinksModule.mountAdminRoutes(socialLinksAdminRouter);
  router.use('/admin/social-links', socialLinksAdminRouter);

  const siteSettingsAdminRouter = Router();
  siteSettingsModule.mountAdminRoutes(siteSettingsAdminRouter);
  router.use('/admin/site-settings', siteSettingsAdminRouter);

  return router;
}
