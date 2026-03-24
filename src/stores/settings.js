import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const stored = JSON.parse(localStorage.getItem('vis-settings') || '{}')

  const startDate = ref(stored.startDate || new Date().toISOString().split('T')[0])
  const theme = ref(stored.theme || 'dark')

  watch([startDate, theme], () => {
    localStorage.setItem('vis-settings', JSON.stringify({ startDate: startDate.value, theme: theme.value }))
  })

  function resetAll() {
    localStorage.clear()
    startDate.value = new Date().toISOString().split('T')[0]
    theme.value = 'dark'
    window.location.reload()
  }

  return { startDate, theme, resetAll }
})
