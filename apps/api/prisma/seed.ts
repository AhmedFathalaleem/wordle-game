import { PrismaClient, ContentStatus, ProficiencyLevel, SocialPlatform, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@portfolio.local';
const ADMIN_PASSWORD = 'Admin123!';

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: ADMIN_EMAIL,
      deletedAt: null,
    },
  });

  const admin = existingAdmin
    ? await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          passwordHash,
          name: 'Portfolio Admin',
          role: UserRole.SUPER_ADMIN,
          emailVerifiedAt: new Date(),
        },
      })
    : await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          passwordHash,
          name: 'Portfolio Admin',
          role: UserRole.SUPER_ADMIN,
          emailVerifiedAt: new Date(),
        },
      });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'web-applications' },
      update: {},
      create: {
        name: 'Web Applications',
        slug: 'web-applications',
        description: 'Full-stack web application projects',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'open-source' },
      update: {},
      create: {
        name: 'Open Source',
        slug: 'open-source',
        description: 'Contributions and open-source tools',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cloud-devops' },
      update: {},
      create: {
        name: 'Cloud & DevOps',
        slug: 'cloud-devops',
        description: 'Infrastructure and deployment projects',
        sortOrder: 3,
      },
    }),
  ]);

  const technologies = await Promise.all([
    prisma.technology.upsert({
      where: { slug: 'react' },
      update: {},
      create: { name: 'React', slug: 'react', websiteUrl: 'https://react.dev' },
    }),
    prisma.technology.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: { name: 'TypeScript', slug: 'typescript', websiteUrl: 'https://www.typescriptlang.org' },
    }),
    prisma.technology.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: { name: 'Node.js', slug: 'nodejs', websiteUrl: 'https://nodejs.org' },
    }),
    prisma.technology.upsert({
      where: { slug: 'postgresql' },
      update: {},
      create: { name: 'PostgreSQL', slug: 'postgresql', websiteUrl: 'https://www.postgresql.org' },
    }),
    prisma.technology.upsert({
      where: { slug: 'aws' },
      update: {},
      create: { name: 'AWS', slug: 'aws', websiteUrl: 'https://aws.amazon.com' },
    }),
    prisma.technology.upsert({
      where: { slug: 'docker' },
      update: {},
      create: { name: 'Docker', slug: 'docker', websiteUrl: 'https://www.docker.com' },
    }),
  ]);

  const skillCategories = await Promise.all([
    prisma.skillCategory.upsert({
      where: { slug: 'frontend' },
      update: {},
      create: { name: 'Frontend', slug: 'frontend', sortOrder: 1 },
    }),
    prisma.skillCategory.upsert({
      where: { slug: 'backend' },
      update: {},
      create: { name: 'Backend', slug: 'backend', sortOrder: 2 },
    }),
    prisma.skillCategory.upsert({
      where: { slug: 'devops' },
      update: {},
      create: { name: 'DevOps', slug: 'devops', sortOrder: 3 },
    }),
  ]);

  const frontendCategory = skillCategories[0];
  const backendCategory = skillCategories[1];
  const devopsCategory = skillCategories[2];

  if (!frontendCategory || !backendCategory || !devopsCategory) {
    throw new Error('Failed to seed skill categories');
  }

  await Promise.all([
    prisma.skill.upsert({
      where: { id: '00000000-0000-4000-8000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000001',
        name: 'React',
        skillCategoryId: frontendCategory.id,
        proficiencyLevel: ProficiencyLevel.EXPERT,
        sortOrder: 1,
      },
    }),
    prisma.skill.upsert({
      where: { id: '00000000-0000-4000-8000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000002',
        name: 'TypeScript',
        skillCategoryId: frontendCategory.id,
        proficiencyLevel: ProficiencyLevel.EXPERT,
        sortOrder: 2,
      },
    }),
    prisma.skill.upsert({
      where: { id: '00000000-0000-4000-8000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000003',
        name: 'Node.js',
        skillCategoryId: backendCategory.id,
        proficiencyLevel: ProficiencyLevel.ADVANCED,
        sortOrder: 1,
      },
    }),
    prisma.skill.upsert({
      where: { id: '00000000-0000-4000-8000-000000000004' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000004',
        name: 'PostgreSQL',
        skillCategoryId: backendCategory.id,
        proficiencyLevel: ProficiencyLevel.ADVANCED,
        sortOrder: 2,
      },
    }),
    prisma.skill.upsert({
      where: { id: '00000000-0000-4000-8000-000000000005' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000005',
        name: 'AWS',
        skillCategoryId: devopsCategory.id,
        proficiencyLevel: ProficiencyLevel.ADVANCED,
        sortOrder: 1,
      },
    }),
    prisma.skill.upsert({
      where: { id: '00000000-0000-4000-8000-000000000006' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000006',
        name: 'Terraform',
        skillCategoryId: devopsCategory.id,
        proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
        sortOrder: 2,
      },
    }),
  ]);

  await Promise.all([
    prisma.certification.upsert({
      where: { id: '00000000-0000-4000-8000-000000000010' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000010',
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2024-06-15'),
        credentialUrl: 'https://aws.amazon.com/certification/',
        sortOrder: 1,
      },
    }),
    prisma.certification.upsert({
      where: { id: '00000000-0000-4000-8000-000000000011' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000011',
        name: 'Professional Scrum Master I',
        issuer: 'Scrum.org',
        issueDate: new Date('2023-11-01'),
        sortOrder: 2,
      },
    }),
  ]);

  const webAppsCategory = categories[0];
  if (!webAppsCategory) {
    throw new Error('Failed to seed categories');
  }

  const portfolioProject = await prisma.project.upsert({
    where: { id: '00000000-0000-4000-8000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000020',
      title: 'Portfolio Platform',
      slug: 'portfolio-platform',
      summary: 'Cloud-native portfolio platform built with React, Node.js, and AWS.',
      content:
        'A production-ready portfolio CMS featuring project management, skills showcase, and contact messaging.',
      categoryId: webAppsCategory.id,
      createdById: admin.id,
      updatedById: admin.id,
      status: ContentStatus.PUBLISHED,
      featured: true,
      sortOrder: 1,
      publishedAt: new Date(),
      seo: {
        title: 'Portfolio Platform',
        description: 'Cloud-native portfolio platform project',
      },
      metadata: {
        repositoryUrl: 'https://github.com/example/portfolio-platform',
        liveUrl: 'https://portfolio.example.com',
      },
    },
  });

  await prisma.projectImage.upsert({
    where: { id: '00000000-0000-4000-8000-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000021',
      projectId: portfolioProject.id,
      storageKey: 'projects/portfolio-platform/cover.png',
      url: 'https://assets.portfolio.example.com/projects/portfolio-platform/cover.png',
      altText: 'Portfolio Platform dashboard screenshot',
      sortOrder: 1,
      isCover: true,
    },
  });

  const reactTech = technologies.find((t) => t.slug === 'react');
  const tsTech = technologies.find((t) => t.slug === 'typescript');
  const nodeTech = technologies.find((t) => t.slug === 'nodejs');
  const pgTech = technologies.find((t) => t.slug === 'postgresql');
  const awsTech = technologies.find((t) => t.slug === 'aws');

  if (reactTech && tsTech && nodeTech && pgTech && awsTech) {
    await Promise.all([
      prisma.projectTechnology.upsert({
        where: {
          projectId_technologyId: {
            projectId: portfolioProject.id,
            technologyId: reactTech.id,
          },
        },
        update: {},
        create: { projectId: portfolioProject.id, technologyId: reactTech.id },
      }),
      prisma.projectTechnology.upsert({
        where: {
          projectId_technologyId: {
            projectId: portfolioProject.id,
            technologyId: tsTech.id,
          },
        },
        update: {},
        create: { projectId: portfolioProject.id, technologyId: tsTech.id },
      }),
      prisma.projectTechnology.upsert({
        where: {
          projectId_technologyId: {
            projectId: portfolioProject.id,
            technologyId: nodeTech.id,
          },
        },
        update: {},
        create: { projectId: portfolioProject.id, technologyId: nodeTech.id },
      }),
      prisma.projectTechnology.upsert({
        where: {
          projectId_technologyId: {
            projectId: portfolioProject.id,
            technologyId: pgTech.id,
          },
        },
        update: {},
        create: { projectId: portfolioProject.id, technologyId: pgTech.id },
      }),
      prisma.projectTechnology.upsert({
        where: {
          projectId_technologyId: {
            projectId: portfolioProject.id,
            technologyId: awsTech.id,
          },
        },
        update: {},
        create: { projectId: portfolioProject.id, technologyId: awsTech.id },
      }),
    ]);
  }

  await Promise.all([
    prisma.socialLink.upsert({
      where: { id: '00000000-0000-4000-8000-000000000030' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000030',
        platform: SocialPlatform.GITHUB,
        url: 'https://github.com/example',
        label: 'GitHub',
        sortOrder: 1,
      },
    }),
    prisma.socialLink.upsert({
      where: { id: '00000000-0000-4000-8000-000000000031' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000031',
        platform: SocialPlatform.LINKEDIN,
        url: 'https://linkedin.com/in/example',
        label: 'LinkedIn',
        sortOrder: 2,
      },
    }),
    prisma.socialLink.upsert({
      where: { id: '00000000-0000-4000-8000-000000000032' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000032',
        platform: SocialPlatform.EMAIL,
        url: 'mailto:hello@portfolio.example.com',
        label: 'Email',
        sortOrder: 3,
      },
    }),
  ]);

  await prisma.siteSettings.upsert({
    where: { id: '00000000-0000-4000-8000-000000000040' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000040',
      siteTitle: 'Portfolio Platform',
      siteDescription: 'Showcasing projects, skills, and professional experience.',
      ownerName: 'Portfolio Admin',
      logoUrl: 'https://assets.portfolio.example.com/logo.svg',
      faviconUrl: 'https://assets.portfolio.example.com/favicon.ico',
      theme: {
        primaryColor: '#0f172a',
        accentColor: '#3b82f6',
      },
      analytics: {
        enabled: false,
      },
      updatedById: admin.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SEED_DATABASE',
      entityType: 'system',
      entityId: admin.id,
      changes: { message: 'Initial database seed completed' },
      ipAddress: '127.0.0.1',
    },
  });

  console.log('Seed completed successfully.');
  console.log(`Admin user: ${ADMIN_EMAIL}`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
