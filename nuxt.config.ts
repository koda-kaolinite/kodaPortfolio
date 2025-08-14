// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'github-light',
          langs: [
            'json',
            'java'
          ]
        }
      }
    }
  },

  compatibilityDate: '2025-08-12',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    families: [
      { name: 'Sora', provider: 'google', weights: ['400', '500', '600', '700', '800'] },
      { name: 'Inter', provider: 'google', weights: ['400', '500', '600', '700'] }
    ]
  },
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'pt-BR',
    langDir: 'locales',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
        name: 'English',
        icon: 'i-flag-gb-4x3'
      },
      {
        code: 'pt-BR',
        iso: 'pt-BR',
        file: 'pt-BR.json',
        name: 'Português',
        icon: 'i-flag-br-4x3'
      }
    ],
    vueI18n: './i18n.config.ts'
  }

})
