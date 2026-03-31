<template>
  <div class="productivity-page">
    <h1 class="page-title">📊 Трекер продуктивности</h1>

    <!-- Week navigation -->
    <div class="week-nav">
      <button class="btn btn-ghost" @click="shiftWeek(-1)">← Предыдущая</button>
      <span class="week-label">{{ weekLabel }}</span>
      <button class="btn btn-ghost" :disabled="isCurrentWeek" @click="shiftWeek(1)">Следующая →</button>
    </div>

    <!-- Smart tip -->
    <div v-if="smartTip" class="smart-tip card">
      <span class="tip-icon">💡</span>
      <span class="tip-text">{{ smartTip }}</span>
    </div>

    <!-- Streak + comparison row -->
    <div class="streak-row">
      <div v-if="currentStreak > 0" class="streak-badge">
        🔥 {{ currentStreak }} {{ pluralDays(currentStreak) }} подряд!
      </div>
      <div v-if="isCurrentWeek && weekComparison !== null" class="comparison-badge" :class="weekComparison >= 0 ? 'up' : 'down'">
        {{ weekComparison >= 0 ? '↑' : '↓' }} {{ Math.abs(weekComparison) }}% помидоров vs прошлая неделя
      </div>
    </div>

    <!-- Day cards -->
    <div class="day-cards">
      <div
        v-for="day in weekDays"
        :key="day.key"
        class="day-card card"
        :class="dayCardClass(day)"
      >
        <div class="day-name">{{ day.weekdayShort }}</div>
        <div class="day-date">{{ day.dateShort }}</div>
        <div class="day-pomodoros">{{ day.pomodoros }} 🍅</div>
        <div v-if="day.totalTasks > 0" class="day-tasks">
          {{ day.completedTasks }}/{{ day.totalTasks }} ✅
        </div>
        <div class="day-meta">
          <span v-if="day.avgConc !== null" class="day-conc">⭐ {{ day.avgConc.toFixed(1) }}</span>
          <span class="day-goal-pct" :style="{ color: goalPctColor(day.goalPct) }">
            {{ day.goalPct }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Combined: 4 metrics + rating -->
    <div class="card metrics-card">
      <div class="metrics-rating-row">
        <h2 class="section-title">📈 Метрики недели</h2>
        <div class="rating-inline">
          <span class="rating-pct" :style="{ color: ratingColor }">{{ weekMetrics.rating }}%</span>
          <span class="rating-desc-sm">{{ ratingDesc }}</span>
        </div>
      </div>
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-icon">🍅</span>
          <span class="metric-num">{{ weekMetrics.totalPomodoros }}</span>
          <span class="metric-label">Помидоров</span>
        </div>
        <div class="metric-item">
          <span class="metric-icon">⏱</span>
          <span class="metric-num">{{ weekMetrics.focusTime }}</span>
          <span class="metric-label">Фокус</span>
        </div>
        <div class="metric-item">
          <span class="metric-icon">🎯</span>
          <span class="metric-num">{{ weekMetrics.goalDaysPct }}%</span>
          <span class="metric-label">Цели</span>
        </div>
        <div class="metric-item">
          <span class="metric-icon">⭐</span>
          <span class="metric-num">{{ weekMetrics.avgConc !== null ? weekMetrics.avgConc.toFixed(1) : '—' }}</span>
          <span class="metric-label">Концентрация</span>
        </div>
      </div>
      <div class="progress-bar-wrap" style="margin-top: 0.75rem">
        <div class="progress-bar-fill" :style="{ width: weekMetrics.rating + '%', background: ratingColor }" />
      </div>
    </div>

    <!-- Activity chart with goal line -->
    <div class="card chart-card">
      <h2 class="section-title">📊 Активность по дням</h2>
      <div class="bar-chart">
        <div v-for="day in weekDays" :key="day.key" class="bar-row">
          <span class="bar-day-label">{{ day.weekdayShort }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: chartMax > 0 ? (day.pomodoros / chartMax * 100) + '%' : '0%',
                background: dayBarColor(day),
              }"
            />
            <!-- Goal line marker -->
            <div
              v-if="pomodoroStore.settings.dailyGoal > 0 && chartMax > 0"
              class="goal-line"
              :style="{ left: (pomodoroStore.settings.dailyGoal / chartMax * 100) + '%' }"
            />
          </div>
          <span class="bar-value">{{ day.pomodoros }}</span>
        </div>
      </div>
      <div class="chart-legend">
        <span class="legend-goal">— цель ({{ pomodoroStore.settings.dailyGoal }} 🍅)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePomodoroStore } from '../stores/pomodoro.js'
import { useTasksStore } from '../stores/tasks.js'
import { pluralRu } from '../utils/pluralize.js'

const pomodoroStore = usePomodoroStore()
const tasksStore = useTasksStore()

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const WEEKDAYS_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

function getMondayOf(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toKey(date) {
  return date.toISOString().split('T')[0]
}

const weekOffset = ref(0)

const weekStart = computed(() => {
  const monday = getMondayOf(new Date())
  monday.setDate(monday.getDate() + weekOffset.value * 7)
  return monday
})

const isCurrentWeek = computed(() => weekOffset.value === 0)

const weekLabel = computed(() => {
  const start = weekStart.value
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  return `${fmt(start)} — ${fmt(end)}`
})

function shiftWeek(delta) {
  weekOffset.value += delta
}

const weekDays = computed(() => {
  const days = []
  const start = weekStart.value
  const dailyGoal = pomodoroStore.settings.dailyGoal
  const sessions = pomodoroStore.weekSessions(toKey(start))

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const key = toKey(d)
    const daySessions = sessions.filter(s => s.date === key && !s.abandoned)
    const pomodoros = daySessions.reduce((s, x) => s + (x.completedPomodoros || 0), 0)
    const concSessions = daySessions.filter(s => s.concentrationRating)
    const avgConc = concSessions.length
      ? concSessions.reduce((s, x) => s + x.concentrationRating, 0) / concSessions.length
      : null
    const goalPct = dailyGoal > 0 ? Math.min(100, Math.round(pomodoros / dailyGoal * 100)) : 0
    const dayTasks = tasksStore.tasksByDate[key] || []
    const totalTasks = dayTasks.length
    const completedTasks = dayTasks.filter(t => t.done).length
    days.push({
      key,
      weekdayShort: WEEKDAYS_SHORT[i],
      weekdayFull: WEEKDAYS_FULL[i],
      dateShort: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' }),
      pomodoros,
      avgConc,
      goalPct,
      hasData: pomodoros > 0 || totalTasks > 0,
      totalTasks,
      completedTasks,
    })
  }
  return days
})

function dayCardClass(day) {
  if (!day.hasData) return 'day-none'
  if (day.goalPct >= 100) return 'day-green'
  if (day.goalPct >= 50) return 'day-yellow'
  return 'day-red'
}

function goalPctColor(pct) {
  if (pct >= 100) return 'var(--success)'
  if (pct >= 50) return '#FFC107'
  if (pct > 0) return 'var(--danger)'
  return 'var(--text-secondary)'
}

const chartMax = computed(() =>
  Math.max(pomodoroStore.settings.dailyGoal, ...weekDays.value.map(d => d.pomodoros), 1)
)

function dayBarColor(day) {
  if (day.goalPct >= 100) return 'var(--success)'
  if (day.goalPct >= 50) return '#FFC107'
  if (day.pomodoros > 0) return 'var(--danger)'
  return 'var(--border)'
}

const weekMetrics = computed(() => {
  const sessions = pomodoroStore.weekSessions(toKey(weekStart.value)).filter(s => !s.abandoned)
  const totalPomodoros = sessions.reduce((s, x) => s + (x.completedPomodoros || 0), 0)
  const activeDays = new Set(sessions.filter(s => s.completedPomodoros > 0).map(s => s.date)).size
  const concSessions = sessions.filter(s => s.concentrationRating)
  const avgConc = concSessions.length
    ? concSessions.reduce((s, x) => s + x.concentrationRating, 0) / concSessions.length
    : null
  const focusMin = totalPomodoros * pomodoroStore.settings.workMin
  const focusHours = Math.floor(focusMin / 60)
  const focusMinRem = focusMin % 60
  const focusTime = focusHours > 0 ? `${focusHours}ч ${focusMinRem}м` : `${focusMinRem} мин`

  const dailyGoal = pomodoroStore.settings.dailyGoal
  const goalDays = weekDays.value.filter(d => d.goalPct >= 100).length
  const goalDaysPct = Math.round(goalDays / 7 * 100)
  const rating = dailyGoal > 0 ? Math.min(100, Math.round(totalPomodoros / (dailyGoal * 7) * 100)) : 0

  return { totalPomodoros, activeDays, avgConc, focusTime, goalDaysPct, rating }
})

const ratingColor = computed(() => getRatingColor(weekMetrics.value.rating))
const ratingDesc = computed(() => {
  const r = weekMetrics.value.rating
  if (r >= 80) return 'Отличная неделя! 🔥'
  if (r >= 50) return 'Неплохо, есть куда расти 💪'
  return 'Нужно больше усилий 📈'
})

function getRatingColor(rating) {
  if (rating >= 80) return 'var(--success)'
  if (rating >= 50) return '#FFC107'
  return 'var(--danger)'
}

// --- Streak ---
const currentStreak = computed(() => {
  const dailyGoal = pomodoroStore.settings.dailyGoal
  if (!dailyGoal) return 0
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = toKey(d)
    const daySessions = pomodoroStore.sessions.filter(s => s.date === key && !s.abandoned)
    const pomodoros = daySessions.reduce((s, x) => s + (x.completedPomodoros || 0), 0)
    if (pomodoros >= dailyGoal) {
      streak++
    } else {
      // Allow today to be incomplete if it's the first check
      if (i === 0) continue
      break
    }
  }
  return streak
})

function pluralDays(n) {
  return pluralRu(n, ['день', 'дня', 'дней'])
}

// --- Week comparison vs previous ---
const weekComparison = computed(() => {
  const currentPomodoros = weekMetrics.value.totalPomodoros
  // previous week
  const prevMonday = getMondayOf(new Date())
  prevMonday.setDate(prevMonday.getDate() - 7)
  const prevSessions = pomodoroStore.weekSessions(toKey(prevMonday)).filter(s => !s.abandoned)
  const prevPomodoros = prevSessions.reduce((s, x) => s + (x.completedPomodoros || 0), 0)
  if (prevPomodoros === 0) return null
  return Math.round((curPomodoros - prevPomodoros) / prevPomodoros * 100)
})

// --- Smart tip ---
const smartTip = computed(() => {
  const { totalPomodoros, avgConc } = weekMetrics.value
  const dailyGoal = pomodoroStore.settings.dailyGoal
  const totalInterruptions = pomodoroStore.weekSessions(toKey(weekStart.value))
    .filter(s => !s.abandoned)
    .reduce((s, x) => s + (x.interruptionsCount || 0), 0)

  if (weekMetrics.value.rating >= 90) return 'Так держать! Ты в ударе 🔥 Отличная продуктивность!'
  if (totalPomodoros === 0) return 'Попробуй начать с 2 помидоров утром — первый шаг самый важный!'
  if (totalPomodoros < dailyGoal * 2) return 'Попробуй начать с 2 помидоров утром, чтобы войти в ритм'
  if (avgConc !== null && avgConc < 3) return 'Убери отвлечения: отключи уведомления для лучшей концентрации'
  if (totalInterruptions > 5) return 'Много прерываний? Запиши отвлекающие мысли в незапланированные задачи'

  // Best day tip
  const bestDay = [...weekDays.value].sort((a, b) => b.pomodoros - a.pomodoros)[0]
  if (bestDay && bestDay.pomodoros > 0) {
    return `Твой самый продуктивный день — ${bestDay.weekdayFull}. Планируй сложные задачи на него!`
  }

  return null
})
</script>

<style scoped>
.productivity-page {
  max-width: 800px;
}

.week-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.week-label {
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

/* Smart tip */
.smart-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(124,111,255,0.12), rgba(124,111,255,0.05));
  border: 1px solid rgba(124,111,255,0.3);
}

.tip-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.05rem; }
.tip-text { font-size: 0.9rem; color: var(--text-primary); line-height: 1.5; }

/* Streak row */
.streak-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.streak-badge {
  font-size: 0.88rem;
  font-weight: 700;
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.12);
  border: 1px solid rgba(255, 107, 53, 0.3);
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
}

.comparison-badge {
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
}
.comparison-badge.up {
  color: var(--success);
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
}
.comparison-badge.down {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Day cards */
.day-cards {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.day-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.75rem 0.4rem;
  text-align: center;
  border-left: 3px solid transparent;
}

.day-none { opacity: 0.5; }
.day-green { border-left-color: var(--success); }
.day-yellow { border-left-color: #FFC107; }
.day-red { border-left-color: var(--danger); }

.day-name {
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.day-date { font-size: 0.7rem; color: var(--text-secondary); }

.day-pomodoros {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.day-tasks { font-size: 0.72rem; color: var(--text-secondary); }

.day-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.day-conc, .day-goal-pct { font-size: 0.7rem; }

/* Metrics card */
.metrics-card, .chart-card {
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.metrics-rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.metrics-rating-row .section-title { margin-bottom: 0; }

.rating-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-pct {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
}

.rating-desc-sm {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.75rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.metric-icon { font-size: 1.1rem; }

.metric-num {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.metric-label {
  font-size: 0.68rem;
  color: var(--text-secondary);
  text-align: center;
}

/* Bar chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bar-day-label {
  width: 24px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: 999px;
  height: 22px;
  overflow: visible;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.goal-line {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
  pointer-events: none;
}

.bar-value {
  width: 24px;
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.chart-legend {
  margin-top: 0.5rem;
  text-align: right;
}

.legend-goal {
  font-size: 0.72rem;
  color: var(--text-secondary);
  opacity: 0.7;
}

@media (max-width: 600px) {
  .day-cards { grid-template-columns: repeat(4, 1fr); }
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .streak-row { gap: 0.5rem; }
}
</style>
