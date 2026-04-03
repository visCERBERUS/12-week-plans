<template>
  <div class="dashboard">
    <!-- Hero -->
    <header class="dashboard-hero">
      <div class="hero-content">
        <AppLogo class="hero-logo" />
        <h1 class="hero-greeting">{{ greeting }}</h1>
        <p class="hero-date">{{ currentDate }}</p>
      </div>
    </header>

    <!-- Cards grid -->
    <div class="dashboard-grid">
      <!-- Cycle progress -->
      <div class="card progress-card">
        <p class="card-eyebrow">Цикл 12 недель</p>
        <h3 class="card-title">Прогресс</h3>

        <div class="progress-section">
          <div class="progress-label">
            <span class="progress-name">Неделя {{ currentWeek }} из 12</span>
            <span class="progress-pct">{{ Math.round(weekProgress) }}%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: weekProgress + '%' }"></div>
          </div>
        </div>

        <div class="progress-section" style="margin-top: 1.25rem">
          <div class="progress-label">
            <span class="progress-name">Блок {{ currentBlock }} из 3</span>
            <span class="progress-pct">{{ Math.round(blockProgress) }}%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: blockProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Today's tasks -->
      <div class="card tasks-card">
        <p class="card-eyebrow">Сегодня</p>
        <h3 class="card-title">Задачи</h3>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-value" style="color: var(--success)">{{ doneTodayCount }}</span>
            <span class="stat-label">выполнено</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ todayCount }}</span>
            <span class="stat-label">всего</span>
          </div>
          <div class="stat-ring-wrap" v-if="todayCount > 0">
            <svg class="stat-ring" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" class="ring-track" />
              <circle
                cx="22" cy="22" r="18"
                class="ring-progress"
                :stroke-dashoffset="ringOffset"
              />
            </svg>
            <span class="ring-label">{{ Math.round(todayTaskProgress) }}%</span>
          </div>
        </div>

        <div class="progress-bar-wrap" style="margin-top: 1.25rem">
          <div class="progress-bar-fill" :style="{ width: todayTaskProgress + '%' }"></div>
        </div>
      </div>

      <!-- Quote -->
      <div class="card quote-card">
        <p class="card-eyebrow">Цитата дня</p>
        <blockquote class="quote-text">{{ todayQuote.text }}</blockquote>
        <p class="quote-author">— {{ todayQuote.author }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppLogo from '../components/AppLogo.vue'
import { useSettingsStore } from '../stores/settings.js'
import { useTasksStore } from '../stores/tasks.js'

const settings = useSettingsStore()
const tasksStore = useTasksStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 5) return 'Доброй ночи 🌙'
  if (h < 12) return 'Доброе утро ☀️'
  if (h < 17) return 'Добрый день 👋'
  return 'Добрый вечер 🌆'
})

const currentDate = computed(() =>
  new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
)

const startDate = computed(() => new Date(settings.startDate))

const currentWeek = computed(() => {
  const now = Date.now()
  const start = startDate.value.getTime()
  const diff = now - start
  const week = Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1
  return Math.max(1, Math.min(week, 12))
})

const weekProgress = computed(() => (currentWeek.value / 12) * 100)

const currentBlock = computed(() => Math.min(Math.ceil(currentWeek.value / 4), 3))
const blockProgress = computed(() => (currentBlock.value / 3) * 100)

const todayTasks = computed(() => tasksStore.getTodayTasks())
const todayCount = computed(() => todayTasks.value.length)
const doneTodayCount = computed(() => todayTasks.value.filter(t => t.done).length)
const todayTaskProgress = computed(() =>
  todayCount.value > 0 ? (doneTodayCount.value / todayCount.value) * 100 : 0
)

const RING_R = 18
const RING_CIRC = 2 * Math.PI * RING_R
const ringOffset = computed(() =>
  RING_CIRC - (todayTaskProgress.value / 100) * RING_CIRC
)

const quotes = [
  { text: 'Делай что должен, и будь что будет.', author: 'Лев Толстой' },
  { text: 'Начни — это половина дела.', author: 'Гораций' },
  { text: 'Человек рождён для действия.', author: 'Вольтер' },
  { text: 'Не откладывай на завтра то, что можно сделать сегодня.', author: 'Бенджамин Франклин' },
  { text: 'Время — деньги.', author: 'Бенджамин Франклин' },
  { text: 'Жизнь — это то, что происходит, пока ты строишь планы.', author: 'Джон Леннон' },
  { text: 'Единственный способ делать великую работу — любить то, что делаешь.', author: 'Стив Джобс' },
  { text: 'Не важно, насколько медленно ты движешься, главное — не останавливаться.', author: 'Конфуций' },
  { text: 'Успех — это способность идти от одной неудачи к другой, не теряя оптимизма.', author: 'Уинстон Черчилль' },
  { text: 'Жизнь можно понять только оглядываясь назад, но прожить — только смотря вперёд.', author: 'Сёрен Кьеркегор' },
  { text: 'Если хочешь изменить мир — начни с себя.', author: 'Махатма Ганди' },
  { text: 'Цель без плана — просто желание.', author: 'Антуан де Сент-Экзюпери' },
  { text: 'Сделай сегодня то, что другие не хотят, завтра ты будешь жить так, как другие не могут.', author: 'Джерри Райс' },
  { text: 'В середине каждой трудности скрывается возможность.', author: 'Альберт Эйнштейн' },
  { text: 'Планирование без действий — мечта, действие без планирования — кошмар.', author: 'Японская поговорка' },
  { text: 'Лучшее время посадить дерево было 20 лет назад. Второе лучшее время — сейчас.', author: 'Китайская пословица' },
  { text: 'Жизнь не в том, чтобы жить, а в том, чтобы чувствовать себя живым.', author: 'Уильям Хэзлитт' },
  { text: 'Время, которое вы хорошо провели, — не потраченное зря время.', author: 'Бертран Рассел' },
  { text: 'Великие дела совершаются не силой, а настойчивостью.', author: 'Сэмюэл Джонсон' },
  { text: 'Не считай дни — сделай так, чтобы дни считались.', author: 'Мухаммед Али' },
  { text: 'Не ищи в жизни лёгких путей — ищи смысл.', author: 'Ральф Эмерсон' },
  { text: 'Потеря времени — самая тяжёлая из всех потерь.', author: 'Феофраст' },
]

const todayQuote = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return quotes[dayOfYear % quotes.length]
})
</script>

<style scoped>
.dashboard {
  max-width: 860px;
}

/* ── Hero ──────────────────────────────────────────────────────────────── */
.dashboard-hero {
  margin-bottom: 2.5rem;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.hero-logo {
  transform: scale(1.35);
  transform-origin: left center;
  margin-bottom: 0.75rem;
}

.hero-greeting {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-primary);
  line-height: 1.2;
}

.hero-date {
  color: var(--text-secondary);
  font-size: 0.95rem;
  text-transform: capitalize;
}

/* ── Grid ──────────────────────────────────────────────────────────────── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.dashboard-grid .quote-card {
  grid-column: 1 / -1;
}

/* ── Card shared ───────────────────────────────────────────────────────── */
.card-eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.3rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
}

/* ── Progress card ─────────────────────────────────────────────────────── */
.progress-section {
  /* each progress section */
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.progress-name {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.progress-pct {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

/* ── Stats card ─────────────────────────────────────────────────────────── */
.stats-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.25rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-value {
  font-size: 2.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--accent);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 450;
}

.stat-divider {
  width: 1px;
  height: 2.5rem;
  background: var(--border);
  flex-shrink: 0;
}

.stat-ring-wrap {
  margin-left: auto;
  position: relative;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-ring {
  width: 52px;
  height: 52px;
  transform: rotate(-90deg);
  position: absolute;
  top: 0; left: 0;
}

.ring-track {
  fill: none;
  stroke: var(--border);
  stroke-width: 3;
}

.ring-progress {
  fill: none;
  stroke: var(--accent);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 113.1;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.ring-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-primary);
  position: relative;
  z-index: 1;
}

/* ── Quote card ─────────────────────────────────────────────────────────── */
.quote-card {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated, var(--bg-card)) 100%);
}

.quote-text {
  font-size: 1.05rem;
  line-height: 1.7;
  font-style: italic;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  margin-left: 0;
}

.quote-author {
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding-left: 1rem;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-grid .quote-card {
    grid-column: auto;
  }

  .hero-greeting {
    font-size: 1.5rem;
  }
}
</style>
