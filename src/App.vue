<template>
  <div class="app-layout">
    <AppNav />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppNav from './components/AppNav.vue'
import { useSettingsStore } from './stores/settings.js'
import { onMounted, watch } from 'vue'

const settings = useSettingsStore()

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

onMounted(() => {
  applyTheme(settings.theme)
})

watch(() => settings.theme, (newTheme) => {
  applyTheme(newTheme)
})
</script>
