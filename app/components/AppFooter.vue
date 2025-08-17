<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const { footer } = useAppConfig()

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
      <ClientOnly>
        {{ `${t('footer.copyright')} ${new Date().getFullYear()}` }}
      </ClientOnly>
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
