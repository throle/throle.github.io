import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const evidenceSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  type: z.enum(['论文', '代码', '机构', '数据', '报告', '演示']),
  verifiedAt: z.string()
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    shortTitle: z.string(),
    summary: z.string(),
    projectType: z.string(),
    organizationPublic: z.string(),
    period: z.string().optional(),
    status: z.enum(['已完成', '进行中', '持续维护']),
    publicLevel: z.enum(['完整公开', '有限公开', '仅概要']),
    domains: z.array(z.string()),
    methods: z.array(z.string()),
    objects: z.array(z.string()),
    problem: z.string(),
    objectives: z.array(z.string()),
    personalRole: z.string(),
    collaborationBoundary: z.string(),
    inputs: z.array(z.string()),
    workflow: z.array(z.string()),
    validation: z.array(z.string()),
    results: z.array(z.string()),
    limitations: z.array(z.string()),
    deliverables: z.array(z.string()),
    transferableCapabilities: z.array(z.string()),
    discussionQuestions: z.array(z.string()),
    evidenceLinks: z.array(evidenceSchema).default([]),
    relatedPublications: z.array(z.string()).default([]),
    featured: z.boolean(),
    featuredOrder: z.number().optional(),
    visual: z.enum(['geothermal', 'solar', 'rock', 'oil-opt', 'gas-leak', 'gas-forecast', 'liquid-pipe']),
    visualCaption: z.string(),
    updatedAt: z.string()
  })
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publications' }),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    personalAuthorPosition: z.string(),
    venue: z.string(),
    year: z.number(),
    status: z.enum(['已发表', '已接收', '在投']),
    categories: z.array(z.string()),
    abstractPublic: z.string(),
    personalContribution: z.string(),
    citationDetails: z.string().optional(),
    doi: z.string().optional(),
    officialUrl: z.string().url().optional(),
    relatedProjects: z.array(z.string()).default([]),
    featured: z.boolean(),
    publicLevel: z.enum(['完整公开', '有限公开', '仅概要']),
    updatedAt: z.string()
  })
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/research' }),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    question: z.string(),
    scope: z.string(),
    objects: z.array(z.string()),
    mechanisms: z.array(z.string()),
    methods: z.array(z.string()),
    relatedProjects: z.array(z.string()),
    relatedPublications: z.array(z.string()).default([]),
    openQuestions: z.array(z.string()),
    publicLevel: z.enum(['完整公开', '有限公开', '仅概要']),
    updatedAt: z.string()
  })
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tools' }),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    toolType: z.string(),
    status: z.enum(['可公开使用', '可公开说明', '内部使用']),
    publicLevel: z.enum(['完整公开', '有限公开', '仅概要']),
    problem: z.string(),
    personalRole: z.string(),
    inputs: z.array(z.string()),
    process: z.array(z.string()),
    outputs: z.array(z.string()),
    verification: z.array(z.string()),
    limitations: z.array(z.string()),
    technologies: z.array(z.string()).default([]),
    relatedProjects: z.array(z.string()).default([]),
    featured: z.boolean(),
    updatedAt: z.string()
  })
});

const about = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/about' }),
  schema: z.object({ title: z.string(), updatedAt: z.string() })
});

export const collections = { projects, publications, research, tools, about };
