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

  runtimeConfig: {
    public: {
      pictureDark: process.env.NUXT_PUBLIC_PICTURE_DARK,
      pictureLight: process.env.NUXT_PUBLIC_PICTURE_LIGHT,
      pictureAlt: process.env.NUXT_PUBLIC_PICTURE_ALT,
      meetingLink: process.env.NUXT_PUBLIC_MEETING_LINK
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
    defaultLocale: 'pt_br',
    langDir: 'locales',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
        name: 'English'
      },
      {
        code: 'pt_br',
        iso: 'pt_br',
        file: 'pt_br.json',
        name: 'Portugues'
      }
    ],
    vueI18n: './i18n.config.ts'
  }

})
