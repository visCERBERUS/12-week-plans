<template>
  <div class="dashboard">
    <div class="dashboard-hero">
      <AppLogo class="hero-logo" />
      <p class="hero-date">{{ currentDate }}</p>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <h3>Прогресс цикла</h3>
        <div class="progress-section">
          <div class="progress-label">
            <span>Неделя {{ currentWeek }} из 12</span>
            <span>{{ Math.round(weekProgress) }}%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: weekProgress + '%' }"></div>
          </div>
        </div>
        <div class="progress-section" style="margin-top: 1rem">
          <div class="progress-label">
            <span>Блок {{ currentBlock }} из 3</span>
            <span>{{ Math.round(blockProgress) }}%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: blockProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Задачи сегодня</h3>
        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-num">{{ doneTodayCount }}</div>
            <div class="stat-label">выполнено</div>
          </div>
          <div class="stat-sep">/</div>
          <div class="stat-box">
            <div class="stat-num">{{ todayCount }}</div>
            <div class="stat-label">всего</div>
          </div>
        </div>
        <div class="progress-bar-wrap" style="margin-top: 0.75rem">
          <div class="progress-bar-fill" :style="{ width: todayTaskProgress + '%' }"></div>
        </div>
      </div>

      <div class="card quote-card">
        <div class="quote-icon">💬</div>
        <p class="quote-text">{{ todayQuote.text }}</p>
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

const currentDate = computed(() => {
  return new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
})

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
  max-width: 900px;
}
.dashboard-hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 0.5rem;
}
.hero-logo {
  transform: scale(1.4);
  transform-origin: left center;
  margin-bottom: 0.5rem;
}
.hero-date {
  color: var(--text-secondary);
  font-size: 1rem;
  text-transform: capitalize;
  margin-top: 0.75rem;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.dashboard-grid .card:last-child {
  grid-column: 1 / -1;
}
.card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.progress-section {}
.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}
.stats-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}
.stat-box {
  text-align: center;
}
.stat-num {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}
.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.stat-sep {
  font-size: 2rem;
  color: var(--border);
}
.quote-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.quote-icon {
  font-size: 1.5rem;
}
.quote-text {
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
}
.quote-author {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
@media (max-width: 600px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-grid .card:last-child {
    grid-column: auto;
  }
}
</style>
