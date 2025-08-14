<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

const credits = computed(() => `${t('footer.copyright')} ${new Date().getFullYear()}`)

const links = computed(() => [
  {
    icon: 'basil:whatsapp-solid',
    to: 'https://api.whatsapp.com/send?phone=5511945975898&text=Ol%C3%A1%20Koda!%20%F0%9F%98%81',
    target: '_blank',
    'aria-label': t('footer.whatsappAriaLabel')
  },
  {
    icon: 'mdi:linkedin',
    to: 'https://www.linkedin.com/in/kodat/',
    target: '_blank',
    'aria-label': t('footer.linkedinAriaLabel')
  },
  {
    icon: 'i-simple-icons-github',
    to: 'https://github.com/koda-kaolinite',
    target: '_blank',
    'aria-label': t('footer.githubAriaLabel')
  }
])
</script>

<template>
  <UFooter
    class="z-10 bg-default"
    :ui="{ left: 'text-xs' }"
  >
    <template #left>
      {{ credits }}
    </template>

    <template #right>
      <template v-if="links">
        <UButton
          v-for="(link, index) of links"
          :key="index"
          v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
