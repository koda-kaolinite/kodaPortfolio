<script setup lang="ts">
const { locale } = useI18n()
const { global } = useAppConfig()

const { data: page } = await useAsyncData('about_' + locale.value, async () => {
  let content = await queryCollection('about').where('path', '=', `/${locale.value}/about`).first()
  if (!content) {
    content = await queryCollection('about').where('path', '=', '/en/about').first()
  }
  return content
}, {
  watch: [locale]
})

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'About page not found',
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
      orientation="horizontal"
      :ui="{
        container: 'lg:flex sm:flex-row items-center',
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    >
      <video
        class="scale-100 overflow-hidden object-cover items-center justify-center shrink-0 select-none rounded-full align-middle bg-elevated text-base hidden dark:block size-18 ring ring-default ring-offset-3 ring-offset-(--ui-bg)"
        :src="global.picture?.src!"
        autoplay
        loop
        muted
        playsinline
      />
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <MDC
        :value="page.content"
        unwrap="p"
        style="div {white-space: pre-wrap;}"
      />
      <div class="flex flex-row justify-center items-center py-10 space-x-[-2rem]">
        <PolaroidItem
          v-for="(image, index) in page.images"
          :key="index"
          :image="image"
          :index
        />
      </div>
    </UPageSection>
  </UPage>
</template>
