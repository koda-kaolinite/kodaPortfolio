<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const { footer } = useAppConfig()

const credits = computed(() => `${t('footer.copyright')} ${new Date().getFullYear()}`)

const links = computed(() =>
  footer?.links!.map((link) => {
    return {
      icon: link.icon,
      to: link.to,
      target: link.target,
      aria_label: t(link['aria-label'])
    }
  })
)
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
