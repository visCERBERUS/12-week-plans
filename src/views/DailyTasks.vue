<template>
  <div class="daily-tasks">
    <!-- Page header -->
    <header class="page-header">
      <div>
        <h1 class="page-title">День</h1>
        <p class="page-date">{{ currentDate }}</p>
      </div>
    </header>

    <!-- Active Pomodoro banner — "Now Playing" widget -->
    <Transition name="banner">
      <div v-if="tasksStore.activeTimer" class="now-playing-banner card">
        <div class="now-playing-left">
          <span class="now-playing-icon">🍅</span>
          <div class="now-playing-info">
            <p class="now-playing-label">Активный помидор</p>
            <p class="now-playing-task">{{ activeTaskName }}</p>
          </div>
        </div>
        <div class="now-playing-timer">{{ pomodoroDisplay }}</div>
        <div class="now-playing-controls">
          <button class="btn btn-ghost btn-sm" @click="togglePause">
            {{ tasksStore.activeTimer.isPaused ? '▶' : '⏸' }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="tasksStore.resetTimer()">⏹</button>
          <button class="btn btn-warning btn-sm" @click="recordActiveInterruption" title="Записать прерывание">⚡</button>
        </div>
      </div>
    </Transition>

    <!-- Section 1: Plan for the day -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">План на день</h2>
        <span class="section-badge">{{ plannedTasks.length }}</span>
      </div>

      <div v-if="plannedTasks.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="empty-heading">Нет запланированных задач</p>
        <p class="empty-hint">Добавьте задачи ниже, чтобы начать продуктивный день</p>
      </div>

      <div class="task-list">
        <TaskCard
          v-for="task in plannedTasks"
          :key="task.id"
          :task="task"
          @toggle="tasksStore.toggleTask(task.id)"
          @delete="tasksStore.deleteTask(task.id)"
          @start-pomodoro="tasksStore.startTimer(task.id, 25 * 60 * 1000)"
          @increment-planned="tasksStore.incrementPlanned(task.id)"
          @decrement-planned="tasksStore.decrementPlanned(task.id)"
          @record-interruption="tasksStore.recordInterruption(task.id)"
          @update-notes="notes => tasksStore.updateTaskNotes(task.id, notes)"
        />
      </div>

      <!-- Add planned task form -->
      <div class="add-task-form card">
        <div class="add-task-row">
          <input
            v-model="newTaskText"
            class="input"
            placeholder="Новая задача..."
            @keydown.enter="addPlannedTask"
          />
          <div class="pomodoro-count-control">
            <button
              class="btn btn-ghost btn-icon-sm"
              aria-label="Уменьшить количество помидоров"
              @click="newTaskPomodoros = Math.max(1, newTaskPomodoros - 1)"
            >−</button>
            <span class="pomodoro-count-label">🍅 {{ newTaskPomodoros }}</span>
            <button
              class="btn btn-ghost btn-icon-sm"
              aria-label="Увеличить количество помидоров"
              @click="newTaskPomodoros = Math.min(12, newTaskPomodoros + 1)"
            >+</button>
          </div>
          <button class="btn btn-primary" @click="addPlannedTask">Добавить</button>
        </div>
        <p class="hint">💡 Если задача > 5–7 помидоров — разбейте её на части</p>
      </div>
    </section>

    <!-- Section 2: Unplanned tasks -->
    <section class="section unplanned-section">
      <div class="section-header">
        <h2 class="section-title">Незапланированные</h2>
        <span class="section-badge unplanned-badge">{{ unplannedTasks.length }}</span>
      </div>
      <p class="section-hint">Записывайте сюда задачи, которые появились во время работы, не прерывая таймер.</p>

      <div v-if="unplannedTasks.length > 0" class="task-list">
        <TaskCard
          v-for="task in unplannedTasks"
          :key="task.id"
          :task="task"
          @toggle="tasksStore.toggleTask(task.id)"
          @delete="tasksStore.deleteTask(task.id)"
          @start-pomodoro="tasksStore.startTimer(task.id, 25 * 60 * 1000)"
          @increment-planned="tasksStore.incrementPlanned(task.id)"
          @decrement-planned="tasksStore.decrementPlanned(task.id)"
          @record-interruption="tasksStore.recordInterruption(task.id)"
          @update-notes="notes => tasksStore.updateTaskNotes(task.id, notes)"
        />
      </div>

      <div class="add-unplanned-row">
        <input
          v-model="newUnplannedText"
          class="input"
          placeholder="Запишите новую задачу..."
          @keydown.enter="addUnplanned"
        />
        <button class="btn btn-ghost" @click="addUnplanned">Записать</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TaskCard from '../components/TaskCard.vue'
import { useTasksStore } from '../stores/tasks.js'

const tasksStore = useTasksStore()

const newTaskText = ref('')
const newTaskPomodoros = ref(1)
const newUnplannedText = ref('')

const now = ref(Date.now())
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    now.value = Date.now()
    if (tasksStore.activeTimer && !tasksStore.activeTimer.isPaused) {
      const remaining = tasksStore.activeTimer.endTime - now.value
      if (remaining <= 0) {
        playBeep()
        tasksStore.completeTimer()
      }
    }
  }, 500)
})

onUnmounted(() => {
  clearInterval(interval)
})

const currentDate = computed(() =>
  new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const allTasks = computed(() => tasksStore.getTodayTasks())
const plannedTasks = computed(() => allTasks.value.filter(t => !t.isUnplanned))
const unplannedTasks = computed(() => allTasks.value.filter(t => t.isUnplanned))

const activeTaskName = computed(() => {
  if (!tasksStore.activeTimer) return ''
  const task = allTasks.value.find(t => t.id === tasksStore.activeTimer.taskId)
  return task?.text ?? ''
})

const activePhaseLabel = computed(() => '🍅 Работа')

const pomodoroDisplay = computed(() => {
  if (!tasksStore.activeTimer) return '25:00'
  let remaining
  if (tasksStore.activeTimer.isPaused) {
    remaining = tasksStore.activeTimer.remainingMs
  } else {
    remaining = tasksStore.activeTimer.endTime - now.value
  }
  if (remaining < 0) remaining = 0
  const totalSec = Math.ceil(remaining / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

function addPlannedTask() {
  if (newTaskText.value.trim()) {
    tasksStore.addTask(newTaskText.value.trim(), { plannedPomodoros: newTaskPomodoros.value })
    newTaskText.value = ''
    newTaskPomodoros.value = 1
  }
}

function addUnplanned() {
  if (newUnplannedText.value.trim()) {
    tasksStore.addUnplannedTask(newUnplannedText.value.trim())
    newUnplannedText.value = ''
  }
}

function togglePause() {
  if (tasksStore.activeTimer?.isPaused) {
    tasksStore.resumeTimer()
  } else {
    tasksStore.pauseTimer()
  }
}

function recordActiveInterruption() {
  if (tasksStore.activeTimer) {
    tasksStore.recordInterruption(tasksStore.activeTimer.taskId)
  }
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1)
  } catch (e) {
    console.warn('Audio not available', e)
  }
}
</script>

<style scoped>
.daily-tasks {
  max-width: 720px;
}

/* ── Page header ─────────────────────────────────────────────────────────── */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 0.25rem;
}

.page-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: capitalize;
}

/* ── Now Playing banner ──────────────────────────────────────────────────── */
.now-playing-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  border: 1px solid var(--accent);
  background: var(--accent-subtle, var(--accent-glow));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
}

.now-playing-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.now-playing-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.now-playing-info {
  min-width: 0;
}

.now-playing-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.15rem;
}

.now-playing-task {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.now-playing-timer {
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--accent);
  flex-shrink: 0;
}

.now-playing-controls {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

/* ── Banner transition ───────────────────────────────────────────────────── */
.banner-enter-active,
.banner-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ── Sections ────────────────────────────────────────────────────────────── */
.section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--text-primary);
}

.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.4rem;
  background: var(--accent-subtle, rgba(124, 111, 255, 0.1));
  color: var(--accent);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
}

.unplanned-badge {
  background: color-mix(in srgb, var(--text-secondary) 15%, transparent);
  color: var(--text-secondary);
}

.section-hint {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 0.875rem;
  line-height: 1.5;
}

/* ── Task list ───────────────────────────────────────────────────────────── */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.empty-heading {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.375rem;
}

.empty-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* ── Add task form ───────────────────────────────────────────────────────── */
.add-task-form {
  padding: 1rem 1.25rem;
  margin-top: 0.5rem;
}

.add-task-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.add-task-row .input {
  flex: 1;
  min-width: 160px;
}

.pomodoro-count-control {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: var(--bg-elevated, var(--bg-secondary));
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 0.2rem 0.4rem;
}

.pomodoro-count-label {
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 3.5ch;
  text-align: center;
  color: var(--text-primary);
}

.btn-icon-sm {
  padding: 0.15rem 0.5rem;
  font-size: 1rem;
  line-height: 1;
  border-radius: 100px;
  border: none;
}

.hint {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 0.625rem;
}

/* ── Unplanned section ───────────────────────────────────────────────────── */
.unplanned-section {
  background: var(--bg-elevated, var(--bg-secondary));
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
}

.unplanned-section .section-title {
  color: var(--text-secondary);
}

.add-unplanned-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.75rem;
}

.add-unplanned-row .input {
  flex: 1;
}

/* ── Shared small buttons ────────────────────────────────────────────────── */
.btn-sm {
  padding: 0.3rem 0.75rem;
  font-size: 0.82rem;
}

.btn-warning {
  background: rgba(255, 149, 0, 0.12);
  color: #E08000;
  border: 1px solid rgba(255, 149, 0, 0.3);
  border-radius: 100px;
}

.btn-warning:hover {
  background: rgba(255, 149, 0, 0.22);
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .now-playing-banner {
    flex-wrap: wrap;
  }

  .now-playing-timer {
    font-size: 1.5rem;
  }

  .add-task-row {
    flex-direction: column;
    align-items: stretch;
  }

  .pomodoro-count-control {
    justify-content: center;
  }
}
</style>

