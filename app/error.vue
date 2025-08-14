<script setup lang="ts">
import type { NuxtError } from '#app'
import { useI18n } from '#imports'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

const { locale, t } = useI18n()

useHead({
  htmlAttrs: {
    lang: locale.value
  }
})

useSeoMeta({
  title: t('error.pageNotFound'),
  description: t('error.pageNotFoundDescription')
})

const [{ data: navigation }, { data: files }] = await Promise.all([
  useAsyncData('navigation', () => {
    return Promise.all([
      queryCollectionNavigation('blog')
    ])
  }, {
    transform: data => data.flat()
  }),
  useLazyAsyncData('search', () => {
    return Promise.all([
      queryCollectionSearchSections('blog')
    ])
  }, {
    server: false,
    transform: data => data.flat()
  })
])
</script>

<template>
  <div>
    <AppHeader :links="navLinks" />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="navLinks"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <UToaster />
  </div>
</template>
