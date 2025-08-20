export default defineAppConfig({
  global: {
    email: 'kaolinite.work@proton.me',
    available: true,
    meetingLink: 'https://cal.com/koda-turqui/15min',
    picture: {
      src: 'https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com.webm',
      alt: 'A GIF of Koda in pixelart style'
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
  },
  footer: {
    col4orMode: false,
    links: [{
      'icon': 'basil:whatsapp-solid',
      'to': 'https://api.whatsapp.com/send?phone=5511945975898&text=Ol%C3%A1%20Koda!%20%F0%9F%98%81',
      'target': '_blank',
      'aria-label': 'footer.whatsappAriaLabel'
    },
    {
      'icon': 'mdi:linkedin',
      'to': 'https://www.linkedin.com/in/kodaturqui/',
      'target': '_blank',
      'aria-label': 'footer.linkedinAriaLabel'
    },
    {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/koda-kaolinite',
      'target': '_blank',
      'aria-label': 'footer.githubAriaLabel'
    }]
  }
})
