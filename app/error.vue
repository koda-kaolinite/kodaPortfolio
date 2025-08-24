<script setup lang="ts">
import type { NuxtError } from '#app'
import { useI18n, useLocalePath } from '#imports'
import { computed } from 'vue'
import { navLinks } from '~/utils/links'
import type { NavigationMenuItem } from '@nuxt/ui'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

const { locale, t } = useI18n()
const localePath = useLocalePath()

useHead({
  htmlAttrs: {
    lang: locale.value
  }
})

useSeoMeta({
  title: t('error.pageNotFound'),
  description: t('error.pageNotFoundDescription')
})

const translatedLinks = computed<NavigationMenuItem[]>(() => {
  return navLinks.map(link => ({
    ...link,
    label: t(link.label) ?? link.label,
    to: localePath(link.to) ?? link.to
  }))
})
</script>

<template>
  <div>
    <AppHeader :links="translatedLinks" />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />
  </div>
</template>