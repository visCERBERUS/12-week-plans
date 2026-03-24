<template>
  <nav class="sidebar">
    <div class="sidebar-header">
      <AppLogo />
    </div>
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.path">
        <RouterLink :to="item.path" class="nav-link" :class="{ active: route.path === item.path }">
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import AppLogo from './AppLogo.vue'

const route = useRoute()

const navItems = [
  { path: '/', icon: '🏠', label: 'Главная' },
  { path: '/daily', icon: '📅', label: 'Дневные задачи' },
  { path: '/tracker', icon: '📓', label: 'Трекер дня' },
  { path: '/pomodoro', icon: '🍅', label: 'Помидор' },
  { path: '/productivity', icon: '📊', label: 'Продуктивность' },
  { path: '/weekly', icon: '📆', label: 'Недельный план' },
  { path: '/monthly', icon: '🗓️', label: '4-недельный план' },
  { path: '/yearly', icon: '🎯', label: '12-недельный план' },
  { path: '/settings', icon: '⚙️', label: 'Настройки' },
  { path: '/finance', icon: '💰', label: 'Финансы' },
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.nav-list {
  list-style: none;
  padding: 1rem 0;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(108, 99, 255, 0.1);
}

.nav-link.active {
  color: var(--accent);
  border-left-color: var(--accent);
  background: rgba(108, 99, 255, 0.12);
}

.nav-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    bottom: auto;
    flex-direction: row;
    align-items: center;
    padding: 0.5rem;
  }
  .sidebar-header {
    display: none;
  }
  .nav-list {
    display: flex;
    flex-direction: row;
    padding: 0;
    overflow-x: auto;
  }
  .nav-link {
    flex-direction: column;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    gap: 0.2rem;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  .nav-link.active {
    border-left: none;
    border-bottom-color: var(--accent);
  }
}
</style>
