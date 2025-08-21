# Koda's Portfolio

<p align="center">
  <a href="https://github.com/koda-kaolinite/kodaPortfolio/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/koda-kaolinite/kodaPortfolio/deploy.yml?style=for-the-badge" alt="CI">
  </a>

[//]: # (  <a href="https://github.com/koda-kaolinite/kodaPortfolio/blob/main/LICENSE">)

[//]: # (    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" alt="License">)

[//]: # (  </a>)
  <img src="https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white" alt="Nuxt">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

This is my personal portfolio, built with Nuxt and Nuxt UI Pro. It showcases my projects, blog posts, and professional
experience.

---

## ✨ Features

* **🤖 Automated CI/CD:** The project is configured with a CI/CD pipeline using GitHub Actions that automatically runs
  tests and deploys the application.
* **🌍 Full Internationalization (i18n):** The portfolio is built with internationalization in mind, supporting multiple
  languages. Currently, English (`en`) and Portuguese (Brazil) (`pt-br`) are available.
* **✍️ Custom & Original Content:** All the content, from blog posts to project descriptions, is original and written by
  me.
* **🎨 UI/UX Enhancements:** Several improvements were made to the original template to enhance the user experience,
  including a new language switcher and theme color adjustments.
* **⚙️ Centralized Configuration:** The project uses a centralized configuration file (`app.config.ts`) for easy
  management of footer links and other global settings.
* **🚀 Advanced SEO:** Integrated with the **[@nuxtjs/seo](https://nuxt.com/seo)** module, the project has advanced SEO features, including dynamic `robots.txt` generation, sitemaps, and rich meta tags, replacing the previous `nuxt-og-image` implementation.
* **⚡ Performance Optimizations:** Several performance improvements have been implemented, such as **payload optimization** by fetching only necessary data in content queries and **lazy loading** for images to ensure a faster user experience.

---

## 🛠️ Technical Stack

| Technology                                | Description                                                                            |
|-------------------------------------------|----------------------------------------------------------------------------------------|
| [Nuxt](https://nuxt.com/)                 | The Intuitive Vue Framework                                                            |
| [Nuxt UI Pro](https://ui.nuxt.com/pro)    | A professional UI library for Nuxt                                                     |
| [Nuxt Content](https://content.nuxt.com/) | A Nuxt module that reads Markdown, YAML, CSV and JSON files to create a file-based CMS |
| [Nuxt SEO](https://nuxt.com/seo)          | A Nuxt module for robust SEO features, including sitemaps and meta tags                |
| [Nuxt Image](https://image.nuxt.com/)     | A Nuxt module for optimizing images                                                    |
| [i18n](https://i18n.nuxtjs.org/)          | A Nuxt module for internationalization                                                 |
| [VueUse](https://vueuse.org/)             | A collection of essential Vue Composition Utilities                                    |
| [Motion](https://motion.dev/)             | A library for creating animations                                                      |
| [Tailwind CSS](https://tailwindcss.com/)  | A utility-first CSS framework                                                          |

---

## 🚀 Getting Started

### CI

Run the integration tests:

```bash
pnpm run ci
```

### Setup

Make sure to install the dependencies:

```bash
pnpm install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Production

Build the application for production (for static hosting):

```bash
pnpm generate --preset github_pages
```

Locally preview production build:

```bash
npx serve .output/public
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

---

## 🙏 Acknowledgments

This project was originally based on the [Nuxt UI Pro portfolio template](https://github.com/nuxt/ui-pro).
