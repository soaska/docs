import { defineConfig } from "vitepress";

// TODO: Reuse telegram icon
const telegramSvg = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Telegram</title><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  locales: {
    root: {
      label: "Русский",
      lang: "ru",
      title: "Proxi",
      titleTemplate: ":title • Proxi",
      description:
        "Бесплатный SOCKS5 прокси для Telegram",
      themeConfig: {
        lastUpdated: {
          text: "Обновлено",
        },
        outline: {
          label: "На этой странице",
        },
        docFooter: {
          prev: "Предыдущая страница",
          next: "Следующая страница",
        },
        darkModeSwitchLabel: "Тема",
        lightModeSwitchTitle: "Переключиться на светлую тему",
        darkModeSwitchTitle: "Переключиться на тёмную тему",
        sidebarMenuLabel: "Меню",
        returnToTopLabel: "Наверх",
        langMenuLabel: "Сменить язык",
        nav: [
          { text: "Как использовать", link: "/use" },
          { text: "Контакты", link: "/support" },
          { text: "Авторы", link: "/authors" },
        ],
        sidebar: [
          {
            text: "Документация",
            items: [
              { text: "Использование", link: "/use" },
              { text: "Контакты", link: "/support" },
              { text: "Авторы", link: "/authors" },
            ],
          },
        ],
        footer: {
          message: "Опубликовано под лицензией Apache-2.0",
          copyright:
            'Создано <a href="https://github.com/soaska" target="_blank">@soaska</a> • Основано на <a href="https://huecker.io" target="_blank">huecker.io</a>',
        },
      },
    },
    en: {
      label: "English",
      lang: "en",
      title: "Proxi",
      titleTemplate: ":title • Proxi",
      description:
        "Free SOCKS5 proxy for Telegram",
      themeConfig: {
        nav: [
          { text: "How to Use", link: "/en/use" },
          { text: "Contacts", link: "/en/support" },
          { text: "Authors", link: "/en/authors" },
        ],
        sidebar: [
          {
            text: "Documentation",
            base: "/en",
            items: [
              { text: "How to Use", link: "/use" },
              { text: "Contacts", link: "/support" },
              { text: "Authors", link: "/authors" },
            ],
          },
        ],
        footer: {
          message: "Published under Apache-2.0 license",
          copyright:
            'Created by <a href="https://github.com/soaska" target="_blank">@soaska</a> • Based on <a href="https://huecker.io" target="_blank">huecker.io</a>',
        },
      },
    },
  },
  head: [
    ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/android-chrome-192x192.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/android-chrome-512x512.png",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    [
      "link",
      { rel: "mask-icon", href: "/favico.svg", color: "#1d63ed" },
    ],
    ["meta", { name: "msapplication-TileColor", content: "#1d63ed" }],
    ["meta", { name: "msapplication-config", content: "/browserconfig.xml" }],
    ["meta", { name: "theme-color", content: "#ffffff" }],
  ],
  srcDir: "./src",
  outDir: "./dist",
  appearance: "dark",
  lastUpdated: true,
  themeConfig: {
    siteTitle: false,
    search: {
      provider: "local",
    },
    logo: {
      light: "/logo_light.svg",
      dark: "/logo_dark.svg",
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/soaska/proxy" },
      { icon: { svg: telegramSvg }, link: "https://t.me/cumsorg" },
    ],
  },
});
