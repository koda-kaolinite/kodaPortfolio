<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'

const { locale } = useI18n()

defineProps<{
  page: IndexCollectionItem
}>()

const { data: posts } = await useAsyncData('landing_blog_posts_' + locale.value, async () => {
  let posts = await queryCollection('blog')
    .select('title', 'description', 'date', 'path')
    .where('path', 'LIKE', `/${locale.value}/blog%`)
    .order('date', 'DESC')
    .limit(3)
    .all()

  if (posts.length === 0 && locale.value !== 'en') {
    posts = await queryCollection('blog')
      .select('title', 'description', 'date', 'path')
      .where('path', 'LIKE', `/en/blog%`)
      .order('date', 'DESC')
      .limit(3)
      .all()
  }

  return posts
}, {
  watch: [locale]
})

if (!posts.value) {
  throw createError(
    { statusCode: 404,
      statusMessage: 'blogs posts not found',
      fatal: false
    })
}
</script>

<template>
  <UPageSection
    :title="page.blog.title"
    :description="page.blog.description"
    :ui="{
      container: 'px-0 !pt-0 sm:gap-6 lg:gap-8',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-2 text-sm sm:text-md lg:text-sm text-muted'
    }"
  >
    <UBlogPosts
      orientation="vertical"
      class="gap-4 lg:gap-y-4"
    >
      <UBlogPost
        v-for="(post, index) in posts"
        :key="index"
        orientation="horizontal"
        variant="naked"
        v-bind="post"
        :to="post.path"
        :ui="{
          root: 'group relative lg:items-start lg:flex ring-0 hover:ring-0',
          body: '!px-0',
          header: 'hidden'
        }"
      >
        <template #footer>
          <UButton
            size="xs"
            variant="link"
            class="px-0 gap-0"
            :label="$t('blogComponent.readArticle')"
          >
            <template #trailing>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </template>
          </UButton>
        </template>
      </UBlogPost>
    </UBlogPosts>
  </UPageSection>
</template>
