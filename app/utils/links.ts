import type { NavigationMenuItem } from '@nuxt/ui'

export const navLinks: NavigationMenuItem[] = [{
  label: 'navbar.home',
  icon: 'i-lucide-home',
  to: '/'
}, {
  label: 'navbar.projects',
  icon: 'i-lucide-folder',
  to: '/projects'
}, {
  label: 'navbar.blog',
  icon: 'i-lucide-file-text',
  to: '/blog'
},
//   label: 'Speaking',
//   icon: 'i-lucide-mic',
//   to: '/speaking'
// }
{
  label: 'navbar.about',
  icon: 'i-lucide-user',
  to: '/about'
}]
