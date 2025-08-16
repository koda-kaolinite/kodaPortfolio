<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, useRouter, useSwitchLocalePath } from '#imports'

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

const nextLanguage = () => (locale.value === 'en' ? 'pt-br' : 'en')

const buttonIcon = computed(() => {
  const nextLangCode = nextLanguage()
  const targetLocale = locales.value.find(l => l.code === nextLangCode)
  return targetLocale?.icon as string || 'i-lucide-languages'
})

const changeLanguage = () => {
  const nextLangCode = nextLanguage()
  const newPath = switchLocalePath(nextLangCode)
  router.push(newPath)
}
</script>

<template>
  <ClientOnly>
    <UButton
      :aria-label="$t('languageChanger.ariaLabel')"
      :icon="buttonIcon"
      color="neutral"
      variant="ghost"
      size="sm"
      class="rounded-full"
      @click="changeLanguage"
    />
    <template #fallback>
      <div class="h-8 w-8" />
    </template>
  </ClientOnly>
</template>
