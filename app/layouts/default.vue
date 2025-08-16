<script setup lang="ts">
import { navLinks } from '~/utils/links'
import type { NavigationMenuItem } from '@nuxt/ui'

const localePath = useLocalePath()
const { t } = useI18n()

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
    <UContainer class="sm:border-x border-default pt-10">
      <AppHeader :links="translatedLinks" />
      <slot />
      <AppFooter />
    </UContainer>
  </div>
</template>
