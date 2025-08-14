export default defineAppConfig({
  global: {
    email: 'kaolinite.work@proton.me',
    available: true,
    meetingLink: 'https://cal.com/koda-turqui/15min',
    picture: {
      dark: 'https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com-optimize.gif',
      light: 'https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com-optimize.gif',
      alt: 'A GIF of me in pixelart style'
    }
  },
  uiPro: {
    pageHero: {
      slots: {
        container: 'py-18 sm:py-24 lg:py-32',
        title: 'mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl',
        description: 'mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted'
      }
    }
  }
})
