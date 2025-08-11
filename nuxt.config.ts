// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt'
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

  compatibilityDate: '2024-11-01',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
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
  }

})
