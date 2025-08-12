import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const createBaseSchema = () => z.object({
  title: z.string(),
  description: z.string()
})

const createButtonSchema = () => z.object({
  label: z.string(),
  icon: z.string().optional(),
  to: z.string().optional(),
  color: z.enum(['primary', 'neutral', 'success', 'warning', 'error', 'info']).optional(),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  variant: z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional(),
  target: z.enum(['_blank', '_self']).optional()
})

const createImageSchema = () => z.object({
  src: z.string().editor({ input: 'media' }),
  alt: z.string()
})

const createAuthorSchema = () => z.object({
  name: z.string(),
  description: z.string().optional(),
  username: z.string().optional(),
  twitter: z.string().optional(),
  to: z.string().optional(),
  avatar: createImageSchema().optional()
})

const createTestimonialSchema = () => z.object({
  quote: z.string(),
  author: createAuthorSchema()
})

const indexSchema = z.object({
  hero: z.object({ links: z.array(createButtonSchema()), images: z.array(createImageSchema()) }),
  about: createBaseSchema(),
  experience: createBaseSchema().extend({ items: z.array(z.object({ date: z.date(), position: z.string(), company: z.object({ name: z.string(), url: z.string(), logo: z.string().editor({ input: 'icon' }), color: z.string() }) })) }),
  testimonials: z.array(createTestimonialSchema()),
  blog: createBaseSchema(),
  faq: createBaseSchema().extend({ categories: z.array(z.object({ title: z.string().nonempty(), questions: z.array(z.object({ label: z.string().nonempty(), content: z.string().nonempty() })) })) })
})
const projectsSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  image: z.string().nonempty().editor({ input: 'media' }),
  url: z.string().nonempty(),
  tags: z.array(z.string()),
  date: z.date()
})
const blogSchema = z.object({
  minRead: z.number(),
  date: z.date(),
  image: z.string().nonempty().editor({ input: 'media' }),
  author: createAuthorSchema()
})
const pagesSchema = z.object({
  links: z.array(createButtonSchema())
})
const speakingSchema = z.object({
  links: z.array(createButtonSchema()),
  events: z.array(z.object({ category: z.enum(['Live talk', 'Podcast', 'Conference']), title: z.string(), date: z.date(), location: z.string(), url: z.string().optional() }))
})
const aboutSchema = z.object({
  content: z.object({}),
  images: z.array(createImageSchema())
})

// --- 3. Configuração Final das Coleções (Com a correção na coleção 'pages') ---
export default defineContentConfig({
  collections: {
    // --- Index ---
    index_en: defineCollection({ type: 'page', source: { include: 'en/index.yml' }, schema: indexSchema }),
    index_pt_BR: defineCollection({ type: 'page', source: { include: 'pt_BR/index.yml' }, schema: indexSchema }),

    // --- Projects ---
    projects_en: defineCollection({ type: 'data', source: { include: 'en/projects/*.yml' }, schema: projectsSchema }),
    projects_pt_BR: defineCollection({ type: 'data', source: { include: 'pt_BR/projects/*.yml' }, schema: projectsSchema }),

    // --- Blog ---
    blog_en: defineCollection({ type: 'page', source: { include: 'en/blog/*.md' }, schema: blogSchema }),
    blog_pt_BR: defineCollection({ type: 'page', source: { include: 'pt_BR/blog/*.md' }, schema: blogSchema }),

    // --- Speaking ---
    speaking_en: defineCollection({ type: 'page', source: { include: 'en/speaking.yml' }, schema: speakingSchema }),
    speaking_pt_BR: defineCollection({ type: 'page', source: { include: 'pt_BR/speaking.yml' }, schema: speakingSchema }),

    // --- About ---
    about_en: defineCollection({ type: 'page', source: { include: 'en/about.yml' }, schema: aboutSchema }),
    about_pt_BR: defineCollection({ type: 'page', source: { include: 'pt_BR/about.yml' }, schema: aboutSchema }),

    // --- PÁGINAS DE LISTAGEM (a coleção 'pages' foi dividida) ---
    projectsPage_en: defineCollection({ type: 'page', source: { include: 'en/projects.yml' }, schema: pagesSchema }),
    projectsPage_pt_BR: defineCollection({ type: 'page', source: { include: 'pt_BR/projects.yml' }, schema: pagesSchema }),

    blogPage_en: defineCollection({ type: 'page', source: { include: 'en/blog.yml' }, schema: pagesSchema }),
    blogPage_pt_BR: defineCollection({ type: 'page', source: { include: 'pt_BR/blog.yml' }, schema: pagesSchema })
  }
})
