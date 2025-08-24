// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/seo',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],
  site: {
    url: 'https://koda-turqui.dev',
    name: 'Koda Turqui Portfolio',
    description: 'Welcome to my portfolio!'
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'one-light',
            dark: 'github-dark'
          },
          langs: [
            'json',
            'java',
            'groovy'
          ]
        }
      }
    },
    renderer: {
      anchorLinks: false
    }
  },

  compatibilityDate: '2025-08-12',

  nitro: {
    prerender: {
      crawlLinks: true
    },
    routeRules: {
      '/**': { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, must-revalidate' } }
    }
  },

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
    defaultLocale: 'pt-br',
    langDir: 'locales',
    baseUrl: 'https://koda-turqui.dev',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
        name: 'English',
        icon: 'i-flag-gb-4x3'
      },
      {
        code: 'pt-br',
        iso: 'pt-BR',
        file: 'pt-br.json',
        name: 'Português',
        icon: 'i-flag-br-4x3'
      }
    ],
    vueI18n: './i18n.config.ts'
  }

})
