import type { NavigationMenuItem } from '@nuxt/ui'

interface NavLink extends NavigationMenuItem {
  label: string
  to: string
  icon: string
}

export const navLinks: NavLink[] = [{
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
}, {
  label: 'navbar.about',
  icon: 'i-lucide-user',
  to: '/about'
}]
