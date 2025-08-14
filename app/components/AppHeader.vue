<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { navLinks } from '~/utils/links'

const localePath = useLocalePath()
const { t } = useI18n()

const translatedLinks = computed(() => {
  return navLinks.map(link => ({
    ...link,
    label: t(link.label),
    to: localePath(link.to)
  }))
})
</script>

<template>
  <div class="fixed top-2 sm:top-4 mx-auto left-1/2 transform -translate-x-1/2 z-10">
    <UNavigationMenu
      :items="translatedLinks"
      variant="link"
      color="neutral"
      class="bg-muted/80 backdrop-blur-sm rounded-full px-2 sm:px-4 border border-muted/50 shadow-lg shadow-neutral-950/5"
      :ui="{
        link: 'px-2 py-1',
        linkLeadingIcon: 'hidden'
      }"
    >
      <template #list-trailing>
        <LanguageSwitcherButton />
        <ColorModeButton />
      </template>
    </UNavigationMenu>
  </div>
</template>
