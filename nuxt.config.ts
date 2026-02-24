// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    'vuetify-nuxt-module',
  ],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      scripts: {
        googleMaps: {
          apiKey: '',
          mapId: '',
        },
      },
    },
  },
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
    },
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
})
