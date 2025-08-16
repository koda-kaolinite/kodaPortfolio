<script setup lang="ts">
const { locale } = useI18n()
const { global } = useAppConfig()

const { data: page } = await useAsyncData('project-page' + locale.value, async () => {
  let content = await queryCollection('pages').where('path', '=', `/${locale.value}/projects`).first()

  if (!content) {
    content = await queryCollection('pages').where('path', '=', '/en/projects').first()
  }

  return content
}, {
  watch: [locale]
})

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Projects page not found',
    fatal: true
  })
}

const { data: projects } = await useAsyncData('projects', async () => {
  let projects = await queryCollection('projects').where('stem', 'LIKE', `${locale.value}/projects%`).all()

  if (projects.length === 0 && locale.value !== 'en') {
    projects = await queryCollection('projects').where('stem', 'LIKE', `en/projects%`).all()
  }

  return projects
}, {
  watch: [locale]
})

if (!projects.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Projects not found',
    fatal: false
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
    >
      <template #links>
        <div
          v-if="page.links"
          class="flex items-center gap-2"
        >
          <UButton
            :label="page.links[0]?.label"
            :to="global.meetingLink"
            v-bind="page.links[0]"
            target="_blank"
          />
          <UButton
            :to="`mailto:${global.email}`"
            v-bind="page.links[1]"
          />
        </div>
      </template>
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <Motion
        v-for="(project, index) in projects"
        :key="project.title"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.2 * index }"
        :in-view-options="{ once: true }"
      >
        <UPageCard
          :title="project.title"
          :description="project.description"
          :to="project.url"
          orientation="horizontal"
          variant="naked"
          :reverse="index % 2 === 1"
          class="group"
          :ui="{
            wrapper: 'max-sm:order-last'
          }"
        >
          <template #leading>
            <span class="text-sm text-muted">
              {{ new Date(project.date).getFullYear() }}
            </span>
          </template>
          <!--          <template #footer> -->
          <!--            <ULink -->
          <!--              :to="project.url" -->
          <!--              class="text-sm text-primary flex items-center" -->
          <!--            > -->
          <!--              View Project -->
          <!--              <UIcon -->
          <!--                name="i-lucide-arrow-right" -->
          <!--                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100" -->
          <!--              /> -->
          <!--            </ULink> -->
          <!--          </template> -->
          <img
            :src="project.image"
            :alt="project.title"
            class="object-cover w-full h-48 rounded-lg"
            loading="lazy"
          >
        </UPageCard>
      </Motion>
    </UPageSection>
  </UPage>
</template>
