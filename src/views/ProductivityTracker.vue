<template>
  <div class="productivity-page">
    <h1 class="page-title">📊 Трекер продуктивности</h1>

    <!-- Week navigation -->
    <div class="week-nav">
      <button class="btn btn-ghost" @click="shiftWeek(-1)">← Предыдущая</button>
      <span class="week-label">{{ weekLabel }}</span>
      <button class="btn btn-ghost" :disabled="isCurrentWeek" @click="shiftWeek(1)">Следующая →</button>
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
        <div class="day-meta">
          <span v-if="day.avgConc !== null" class="day-conc">⭐ {{ day.avgConc.toFixed(1) }}</span>
          <span class="day-goal-pct" :style="{ color: goalPctColor(day.goalPct) }">
            {{ day.goalPct }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Week metrics -->
    <div class="card metrics-card">
      <h2 class="section-title">📈 Метрики недели</h2>
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-num">{{ weekMetrics.totalPomodoros }}</span>
          <span class="metric-label">Всего помидоров</span>
        </div>
        <div class="metric-item">
          <span class="metric-num">{{ weekMetrics.avgPerActiveDay.toFixed(1) }}</span>
          <span class="metric-label">Среднее в день</span>
        </div>
        <div class="metric-item">
          <span class="metric-num">{{ weekMetrics.avgConc !== null ? weekMetrics.avgConc.toFixed(1) : '—' }}</span>
          <span class="metric-label">Средняя концентрация</span>
        </div>
        <div class="metric-item">
          <span class="metric-num">{{ weekMetrics.focusTime }}</span>
          <span class="metric-label">Время фокуса</span>
        </div>
        <div class="metric-item">
          <span class="metric-num">{{ weekMetrics.totalInterruptions }}</span>
          <span class="metric-label">Прерываний</span>
        </div>
        <div class="metric-item">
          <span class="metric-num">{{ weekMetrics.goalDaysPct }}%</span>
          <span class="metric-label">Выполнение целей</span>
        </div>
      </div>
    </div>

    <!-- Weekly rating -->
    <div class="card rating-card">
      <h2 class="section-title">🏆 Рейтинг недели</h2>
      <div class="weekly-rating">
        <span class="rating-num" :style="{ color: ratingColor }">{{ weekMetrics.rating }}%</span>
        <span class="rating-desc">{{ ratingDesc }}</span>
      </div>
      <div class="progress-bar-wrap" style="margin-top: 0.75rem">
        <div class="progress-bar-fill" :style="{ width: weekMetrics.rating + '%', background: ratingColor }" />
      </div>
    </div>

    <!-- Activity chart -->
    <div class="card chart-card">
      <h2 class="section-title">📊 Активность по дням</h2>
      <div class="bar-chart">
        <div v-for="day in weekDays" :key="day.key" class="bar-row">
          <span class="bar-day-label">{{ day.weekdayShort }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: maxDayPomodoros > 0 ? (day.pomodoros / maxDayPomodoros * 100) + '%' : '0%',
                background: dayBarColor(day),
              }"
            />
          </div>
          <span class="bar-value">{{ day.pomodoros }}</span>
        </div>
      </div>
    </div>

    <!-- History (last 4 weeks) -->
    <div class="card history-card">
      <h2 class="section-title">📅 История (последние 4 недели)</h2>
      <div v-if="historyWeeks.length" class="history-list">
        <div v-for="wk in historyWeeks" :key="wk.start" class="history-row">
          <span class="hist-period">{{ wk.period }}</span>
          <span class="hist-rating" :style="{ color: getRatingColor(wk.rating) }">{{ wk.rating }}%</span>
          <span class="hist-pom">{{ wk.pomodoros }} 🍅</span>
          <span class="hist-conc">{{ wk.avgConc !== null ? '⭐ ' + wk.avgConc.toFixed(1) : '—' }}</span>
        </div>
      </div>
      <p v-else class="empty-hint">Пока нет истории</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePomodoroStore } from '../stores/pomodoro.js'

const pomodoroStore = usePomodoroStore()

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

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
    days.push({
      key,
      weekdayShort: WEEKDAYS_SHORT[i],
      dateShort: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' }),
      pomodoros,
      avgConc,
      goalPct,
      hasData: pomodoros > 0,
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

const maxDayPomodoros = computed(() => Math.max(1, ...weekDays.value.map(d => d.pomodoros)))

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
  const avgPerActiveDay = activeDays > 0 ? totalPomodoros / activeDays : 0
  const concSessions = sessions.filter(s => s.concentrationRating)
  const avgConc = concSessions.length
    ? concSessions.reduce((s, x) => s + x.concentrationRating, 0) / concSessions.length
    : null
  const totalInterruptions = sessions.reduce((s, x) => s + (x.interruptionsCount || 0), 0)
  const focusMin = totalPomodoros * pomodoroStore.settings.workMin
  const focusHours = Math.floor(focusMin / 60)
  const focusMinRem = focusMin % 60
  const focusTime = focusHours > 0 ? `${focusHours}ч ${focusMinRem}м` : `${focusMinRem} мин`

  const dailyGoal = pomodoroStore.settings.dailyGoal
  const goalDays = weekDays.value.filter(d => d.goalPct >= 100).length
  const goalDaysPct = Math.round(goalDays / 7 * 100)
  const rating = dailyGoal > 0 ? Math.min(100, Math.round(totalPomodoros / (dailyGoal * 7) * 100)) : 0

  return { totalPomodoros, avgPerActiveDay, avgConc, totalInterruptions, focusTime, goalDaysPct, rating }
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

// History: past 4 weeks (not including current)
const historyWeeks = computed(() => {
  const result = []
  for (let i = 1; i <= 4; i++) {
    const monday = getMondayOf(new Date())
    monday.setDate(monday.getDate() - i * 7)
    const startKey = toKey(monday)
    const sessions = pomodoroStore.weekSessions(startKey).filter(s => !s.abandoned)
    const pomodoros = sessions.reduce((s, x) => s + (x.completedPomodoros || 0), 0)
    const concSessions = sessions.filter(s => s.concentrationRating)
    const avgConc = concSessions.length
      ? concSessions.reduce((s, x) => s + x.concentrationRating, 0) / concSessions.length
      : null
    const dailyGoal = pomodoroStore.settings.dailyGoal
    const rating = dailyGoal > 0 ? Math.min(100, Math.round(pomodoros / (dailyGoal * 7) * 100)) : 0
    const endDate = new Date(monday)
    endDate.setDate(endDate.getDate() + 6)
    const fmt = (d) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' })
    result.push({ start: startKey, period: `${fmt(monday)} — ${fmt(endDate)}`, rating, pomodoros, avgConc })
  }
  return result
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
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.week-label {
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
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

.day-date {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.day-pomodoros {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.day-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.day-conc, .day-goal-pct {
  font-size: 0.7rem;
}

/* Metrics */
.metrics-card, .rating-card, .chart-card, .history-card {
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.metric-num {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.metric-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-align: center;
}

/* Rating */
.weekly-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-num {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.rating-desc {
  font-size: 1rem;
  color: var(--text-secondary);
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
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.bar-value {
  width: 24px;
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

/* History */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.hist-period {
  flex: 1;
  color: var(--text-secondary);
  min-width: 120px;
}

.hist-rating {
  font-weight: 700;
  min-width: 40px;
}

.hist-pom {
  color: var(--accent);
  font-weight: 600;
}

.hist-conc {
  color: var(--text-secondary);
}

.empty-hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .day-cards {
    grid-template-columns: repeat(4, 1fr);
  }
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
