<template>
  <div class="pomodoro-page">
    <div class="pomodoro-header">
      <h1 class="page-title">🍅 Таймер Помидора</h1>
      <button class="btn btn-ghost settings-btn" @click="showSettings = true">⚙️ Настройки</button>
    </div>

    <!-- Screen 1: Start session -->
    <div v-if="!pomodoroStore.currentSession" class="start-screen">
      <div class="card start-card">
        <h2 class="section-title">Новая сессия</h2>
        <div class="field-group">
          <label class="field-label">Название задачи</label>
          <input v-model="taskName" class="input" placeholder="Над чем будешь работать?" />
        </div>
        <div class="field-group">
          <label class="field-label">Запланировать помидоров: <strong>{{ plannedPomodoros }}</strong></label>
          <div class="pomodoro-count-row">
            <button class="btn btn-ghost" @click="plannedPomodoros = Math.max(1, plannedPomodoros - 1)">−</button>
            <div class="pomodoro-dots">
              <span
                v-for="n in 12"
                :key="n"
                class="dot"
                :class="{ active: n <= plannedPomodoros }"
                @click="plannedPomodoros = n"
              >🍅</span>
            </div>
            <button class="btn btn-ghost" @click="plannedPomodoros = Math.min(12, plannedPomodoros + 1)">+</button>
          </div>
        </div>
        <button class="btn btn-primary start-btn" :disabled="!taskName.trim()" @click="startSession">
          Начать сессию 🍅
        </button>
      </div>

      <!-- Today summary -->
      <div class="card today-card">
        <h2 class="section-title">📊 Сегодня</h2>
        <div class="today-stats">
          <div class="today-stat">
            <span class="stat-num">{{ pomodoroStore.todayCompletedPomodoros }}</span>
            <span class="stat-label">выполнено</span>
          </div>
          <div class="today-divider">/</div>
          <div class="today-stat">
            <span class="stat-num">{{ pomodoroStore.settings.dailyGoal }}</span>
            <span class="stat-label">цель</span>
          </div>
        </div>
        <div class="progress-bar-wrap">
          <div
            class="progress-bar-fill"
            :style="{ width: Math.min(100, pomodoroStore.todayCompletedPomodoros / pomodoroStore.settings.dailyGoal * 100) + '%' }"
          />
        </div>

        <div v-if="pomodoroStore.todaySessions.length" class="today-sessions">
          <div v-for="s in [...pomodoroStore.todaySessions].reverse()" :key="s.id" class="session-row">
            <span class="session-icon">{{ s.abandoned ? '⚠️' : '✅' }}</span>
            <span class="session-name">{{ s.taskName }}</span>
            <span class="session-count">{{ s.completedPomodoros }} 🍅</span>
            <span v-if="s.concentrationRating" class="session-rating">{{ concentrationEmojis[s.concentrationRating - 1] }}</span>
          </div>
        </div>
        <p v-else class="empty-hint">Сегодня сессий ещё не было</p>
      </div>
    </div>

    <!-- Screen 2: Active timer -->
    <div v-else-if="pomodoroStore.currentSession.phase !== 'rating'" class="timer-screen">
      <div class="card timer-card" :class="{ 'flash-complete': showFlash }">
        <div class="phase-label">{{ phaseLabel }}</div>
        <div class="pomodoro-progress-text">
          Помидор {{ pomodoroStore.currentSession.completedPomodoros + 1 }} из {{ pomodoroStore.currentSession.plannedPomodoros }}
        </div>

        <!-- Circular SVG timer (counts up) -->
        <div class="circle-timer-wrap">
          <svg class="circle-timer" viewBox="0 0 200 200" width="220" height="220">
            <circle cx="100" cy="100" r="88" class="circle-bg" />
            <circle
              cx="100" cy="100" r="88"
              class="circle-fill"
              :stroke="phaseColor"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
            />
          </svg>
          <div class="timer-inner">
            <span class="timer-value">{{ displayTime }}</span>
            <span class="timer-phase-mini">{{ phaseDurationLabel }}</span>
          </div>
        </div>

        <div class="interruptions-badge">Прерываний: {{ pomodoroStore.currentSession.interruptionsCount }} ✗</div>

        <div class="timer-controls">
          <button class="btn btn-primary" @click="toggleTimer">
            {{ pomodoroStore.currentSession.timerActive ? '⏸ Пауза' : '▶ Старт' }}
          </button>
          <button class="btn btn-ghost" @click="interruptWithConfirm">✗ Прервать</button>
          <button class="btn btn-danger" @click="abandonWithConfirm">⏹ Завершить</button>
        </div>

        <div class="task-label">
          <span>📝 {{ pomodoroStore.currentSession.taskName }}</span>
        </div>
      </div>
    </div>

    <!-- Screen 3: Concentration rating -->
    <div v-else class="rating-screen">
      <div class="card rating-card">
        <h2 class="rating-title">Сессия завершена! 🎉</h2>
        <div class="rating-stats">
          <div class="rating-stat">
            <span class="rstat-num">{{ pomodoroStore.currentSession.completedPomodoros }}</span>
            <span class="rstat-label">помидоров</span>
          </div>
          <div class="rating-stat">
            <span class="rstat-num">{{ pomodoroStore.currentSession.interruptionsCount }}</span>
            <span class="rstat-label">прерываний</span>
          </div>
          <div class="rating-stat">
            <span class="rstat-num">{{ sessionWorkTime }}</span>
            <span class="rstat-label">работы</span>
          </div>
        </div>

        <h3 class="concentration-title">Как была концентрация?</h3>
        <div class="concentration-btns">
          <button
            v-for="(item, i) in concentrationLevels"
            :key="i"
            class="conc-btn"
            :class="{ selected: selectedRating === i + 1 }"
            @click="selectedRating = i + 1"
          >
            <span class="conc-emoji">{{ item.emoji }}</span>
            <span class="conc-label">{{ item.label }}</span>
          </button>
        </div>

        <button class="btn btn-primary save-btn" :disabled="!selectedRating" @click="saveSession">
          Сохранить
        </button>
      </div>
    </div>

    <!-- Settings modal -->
    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="card modal-card">
        <h2 class="section-title">⚙️ Настройки таймера</h2>
        <div class="settings-grid">
          <label class="settings-field">
            <span>Работа (мин)</span>
            <input v-model.number="settingsForm.workMin" type="number" min="1" max="60" class="input" />
          </label>
          <label class="settings-field">
            <span>Короткий перерыв (мин)</span>
            <input v-model.number="settingsForm.shortBreakMin" type="number" min="1" max="30" class="input" />
          </label>
          <label class="settings-field">
            <span>Длинный перерыв (мин)</span>
            <input v-model.number="settingsForm.longBreakMin" type="number" min="1" max="60" class="input" />
          </label>
          <label class="settings-field">
            <span>Длинный перерыв после (помидоров)</span>
            <input v-model.number="settingsForm.longBreakAfter" type="number" min="2" max="10" class="input" />
          </label>
          <label class="settings-field">
            <span>Дневная цель (помидоров)</span>
            <input v-model.number="settingsForm.dailyGoal" type="number" min="1" max="20" class="input" />
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="saveSettings">Сохранить</button>
          <button class="btn btn-ghost" @click="showSettings = false">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { usePomodoroStore } from '../stores/pomodoro.js'

const pomodoroStore = usePomodoroStore()

// --- Start screen ---
const taskName = ref('')
const plannedPomodoros = ref(4)

function startSession() {
  if (!taskName.value.trim()) return
  pomodoroStore.startSession(taskName.value.trim(), plannedPomodoros.value)
  taskName.value = ''
  plannedPomodoros.value = 4
  elapsed.value = 0
}

// --- Timer ---
const elapsed = ref(0)
let intervalId = null

const phaseDurationSec = computed(() => {
  const s = pomodoroStore.currentSession
  if (!s) return 0
  if (s.phase === 'work') return pomodoroStore.settings.workMin * 60
  if (s.phase === 'shortBreak') return pomodoroStore.settings.shortBreakMin * 60
  if (s.phase === 'longBreak') return pomodoroStore.settings.longBreakMin * 60
  return 0
})

const circumference = computed(() => 2 * Math.PI * 88)

const dashOffset = computed(() => {
  const total = phaseDurationSec.value
  if (total === 0) return circumference.value
  const progress = Math.min(elapsed.value / total, 1)
  return circumference.value * (1 - progress)
})

const displayTime = computed(() => {
  const s = elapsed.value
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

const phaseDurationLabel = computed(() => {
  const total = phaseDurationSec.value
  return `из ${Math.floor(total / 60)} мин`
})

const phaseLabel = computed(() => {
  const s = pomodoroStore.currentSession
  if (!s) return ''
  if (s.phase === 'work') return '🍅 Работа'
  if (s.phase === 'shortBreak') return '☕ Короткий перерыв'
  if (s.phase === 'longBreak') return '🛋️ Длинный перерыв'
  return ''
})

const phaseColor = computed(() => {
  const s = pomodoroStore.currentSession
  if (!s) return '#6C63FF'
  if (s.phase === 'work') return '#FF5252'
  if (s.phase === 'shortBreak') return '#4CAF50'
  return '#6C63FF'
})

const showFlash = ref(false)

function toggleTimer() {
  if (!pomodoroStore.currentSession) return
  if (pomodoroStore.currentSession.timerActive) {
    pomodoroStore.currentSession.timerActive = false
    stopInterval()
  } else {
    pomodoroStore.currentSession.timerActive = true
    startInterval()
  }
}

function startInterval() {
  if (intervalId) return
  intervalId = setInterval(() => {
    elapsed.value++
    if (elapsed.value >= phaseDurationSec.value) {
      stopInterval()
      onPhaseComplete()
    }
  }, 1000)
}

function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function onPhaseComplete() {
  playBeep()
  notifyUser()
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 1000)
  elapsed.value = 0
  pomodoroStore.tickComplete()
}

// Watch for phase changes to reset elapsed
watch(
  () => pomodoroStore.currentSession?.phase,
  () => { elapsed.value = 0 }
)

// Stop timer interval when session is cleared
watch(
  () => pomodoroStore.currentSession,
  (val) => {
    if (!val) stopInterval()
  }
)

function interruptWithConfirm() {
  pomodoroStore.recordInterruption()
}

function abandonWithConfirm() {
  if (confirm('Завершить сессию досрочно? Прогресс будет сохранён.')) {
    stopInterval()
    pomodoroStore.abandonSession()
  }
}

// --- Rating screen ---
const selectedRating = ref(null)

const concentrationLevels = [
  { emoji: '😴', label: 'Рассеян' },
  { emoji: '😕', label: 'Слабо' },
  { emoji: '😐', label: 'Средне' },
  { emoji: '🙂', label: 'Хорошо' },
  { emoji: '🔥', label: 'В потоке' },
]
const concentrationEmojis = concentrationLevels.map(c => c.emoji)

const sessionWorkTime = computed(() => {
  const s = pomodoroStore.currentSession
  if (!s) return '0 мин'
  const totalMin = s.completedPomodoros * pomodoroStore.settings.workMin
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}ч ${m}м` : `${m} мин`
})

function saveSession() {
  if (!selectedRating.value) return
  stopInterval()
  pomodoroStore.completeSession(selectedRating.value)
  selectedRating.value = null
}

// --- Sound ---
function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 440
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch (_) {}
}

// --- Notifications ---
function notifyUser() {
  const phase = pomodoroStore.currentSession?.phase
  const msg = phase === 'work' ? 'Время работать! 🍅' : 'Время отдохнуть! ☕'
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('Таймер Помидора', { body: msg })
  }
}

if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
  Notification.requestPermission()
}

// --- Settings ---
const showSettings = ref(false)
const settingsForm = ref({ ...pomodoroStore.settings })

watch(showSettings, (val) => {
  if (val) settingsForm.value = { ...pomodoroStore.settings }
})

function saveSettings() {
  pomodoroStore.updateSettings({ ...settingsForm.value })
  showSettings.value = false
}

onUnmounted(() => stopInterval())
</script>

<style scoped>
.pomodoro-page {
  max-width: 700px;
}

.pomodoro-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pomodoro-header .page-title {
  margin-bottom: 0;
}

.settings-btn {
  font-size: 0.85rem;
}

/* Start screen */
.start-card, .today-card {
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

.field-group {
  margin-bottom: 1.25rem;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.pomodoro-count-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pomodoro-dots {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.dot {
  font-size: 1.4rem;
  cursor: pointer;
  opacity: 0.25;
  transition: opacity 0.15s, transform 0.15s;
  line-height: 1;
}

.dot.active {
  opacity: 1;
}

.dot:hover {
  transform: scale(1.15);
}

.start-btn {
  width: 100%;
  justify-content: center;
  padding: 0.75rem;
  font-size: 1rem;
}

/* Today card */
.today-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.today-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.today-divider {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.today-sessions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.session-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 0.9rem;
}

.session-name {
  flex: 1;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-count {
  color: var(--accent);
  font-weight: 600;
}

.empty-hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.75rem;
}

/* Timer screen */
.timer-screen {
  display: flex;
  justify-content: center;
}

.timer-card {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: box-shadow 0.3s ease;
}

.timer-card.flash-complete {
  box-shadow: 0 0 0 4px var(--success);
}

.phase-label {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
}

.pomodoro-progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.circle-timer-wrap {
  position: relative;
  width: 220px;
  height: 220px;
}

.circle-timer {
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: var(--border);
  stroke-width: 10;
}

.circle-fill {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s linear;
}

.timer-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.timer-value {
  font-family: 'Courier New', monospace;
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.timer-phase-mini {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.interruptions-badge {
  font-size: 0.85rem;
  color: var(--danger);
  font-weight: 600;
}

.timer-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.task-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
}

/* Rating screen */
.rating-screen {
  display: flex;
  justify-content: center;
}

.rating-card {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.rating-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.rating-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.rating-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rstat-num {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.rstat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.concentration-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.concentration-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.conc-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  padding: 0.6rem 0.8rem;
  min-width: 72px;
  transition: all 0.2s;
}

.conc-btn:hover {
  border-color: var(--accent);
}

.conc-btn.selected {
  border-color: var(--accent);
  background: rgba(108, 99, 255, 0.15);
}

.conc-emoji {
  font-size: 1.8rem;
  line-height: 1;
}

.conc-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-align: center;
}

.save-btn {
  width: 100%;
  max-width: 200px;
  justify-content: center;
  padding: 0.65rem;
  font-size: 1rem;
}

/* Settings modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 420px;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.settings-field .input {
  width: 100%;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
