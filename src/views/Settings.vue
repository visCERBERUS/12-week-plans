<template>
  <div class="settings-view">
    <h1 class="page-title">⚙️ Настройки</h1>

    <div class="card settings-card">
      <h3>Начало 12-недельного цикла</h3>
      <div class="field-row">
        <input type="date" class="input" v-model="settings.startDate" />
      </div>
    </div>

    <div class="card settings-card">
      <h3>Тема оформления</h3>
      <div class="theme-toggle">
        <button
          class="btn"
          :class="settings.theme === 'dark' ? 'btn-primary' : 'btn-ghost'"
          @click="settings.theme = 'dark'"
        >
          🌙 Тёмная
        </button>
        <button
          class="btn"
          :class="settings.theme === 'light' ? 'btn-primary' : 'btn-ghost'"
          @click="settings.theme = 'light'"
        >
          ☀️ Светлая
        </button>
      </div>
    </div>

    <div class="card settings-card danger-card">
      <h3>Сброс данных</h3>
      <p class="danger-desc">Удалить все задачи, планы и сбросить настройки.</p>
      <button class="btn btn-danger" @click="confirmReset">🗑️ Сбросить все данные</button>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../stores/settings.js'

const settings = useSettingsStore()

function confirmReset() {
  if (confirm('Вы уверены? Все данные будут удалены безвозвратно.')) {
    settings.resetAll()
  }
}
</script>

<style scoped>
.settings-view { max-width: 600px; }
.settings-card {
  margin-bottom: 1.25rem;
}
.settings-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.field-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.field-row .input {
  color-scheme: dark;
}
.theme-toggle {
  display: flex;
  gap: 0.75rem;
}
.danger-card {
  border-color: var(--danger);
}
.danger-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
</style>
