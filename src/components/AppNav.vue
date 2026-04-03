<template>
  <nav class="sidebar">
    <div class="sidebar-header">
      <AppLogo />
    </div>
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.path">
        <RouterLink :to="item.path" class="nav-link" :class="{ active: route.path === item.path }">
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
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
  { path: '/tracker', icon: '📓', label: 'Трекер' },
  { path: '/daily', icon: '📅', label: 'День' },
  { path: '/productivity', icon: '📊', label: 'Стат.' },
  { path: '/knowledge', icon: '📚', label: 'Учёба' },
  { path: '/weekly', icon: '📆', label: 'Неделя' },
  { path: '/monthly', icon: '🗓️', label: '4 нед.' },
  { path: '/yearly', icon: '🎯', label: '12 нед.' },
  { path: '/plan-1c', icon: '🏗️', label: '1С план' },
  { path: '/settings', icon: '⚙️', label: 'Настр.' },
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
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    width: 100%;
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: 0;
    border-right: none;
    border-top: 1px solid var(--border);
    background: var(--bg-secondary);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 200;
    overflow-y: visible;
  }

  .sidebar-header {
    display: none;
  }

  .nav-list {
    display: flex;
    flex-direction: row;
    padding: 0;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .nav-list::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    flex-direction: column;
    padding: 0.4rem 0.6rem;
    font-size: 0.65rem;
    gap: 0.15rem;
    border-left: none;
    border-bottom: 3px solid transparent;
    min-width: 52px;
    justify-content: center;
    text-align: center;
    white-space: nowrap;
  }

  .nav-link.active {
    border-left: none;
    border-bottom-color: var(--accent);
    color: var(--accent);
  }

  .nav-icon {
    font-size: 1.2rem;
  }

  .nav-label {
    font-size: 0.6rem;
  }
}
</style>
