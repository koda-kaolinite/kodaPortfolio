<script setup lang="ts">
const { locale } = useI18n()

const { data: page } = await useAsyncData('blog-page' + locale.value, async () => {
  let content = await queryCollection('pages').where('path', '=', `/${locale.value}/blog`).first()

  if (!content) {
    content = await queryCollection('pages').where('path', '=', '/en/blog').first()
  }

  return content
}, {
  watch: [locale]
})

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Blog page not found',
    fatal: true
  })
}

const { data: posts } = await useAsyncData('blogs-posts', async () => {
  let posts = await queryCollection('blog').where('stem', 'LIKE', `${locale.value}/blog%`).order('date', 'DESC').all()

  if (posts.length === 0 && locale.value !== 'en') {
    posts = await queryCollection('blog').where('stem', 'LIKE', 'en/blog%').order('date', 'DESC').all()
  }

  return posts
}, {
  watch: [locale]
})

if (!posts.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Blog posts not found',
    fatal: true
  })
}

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  ogTitle: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.links"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    />
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <UBlogPosts orientation="vertical">
        <Motion
          v-for="(post, index) in posts"
          :key="index"
          :initial="{ opacity: 0, transform: 'translateY(10px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.2 * index }"
          :in-view-options="{ once: true }"
        >
          <UBlogPost
            variant="naked"
            orientation="horizontal"
            :to="post.path"
            v-bind="post"
            :ui="{
              root: 'md:grid md:grid-cols-2 group overflow-visible transition-all duration-300',
              image:
                'group-hover/blog-post:scale-105 rounded-lg shadow-lg border-4 border-muted ring-2 ring-default',
              header:
                index % 2 === 0
                  ? 'sm:-rotate-1 overflow-visible'
                  : 'sm:rotate-1 overflow-visible'
            }"
          />
        </Motion>
      </UBlogPosts>
    </UPageSection>
  </UPage>
</template>
