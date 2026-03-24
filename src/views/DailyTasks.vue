<template>
  <div class="daily-tasks">
    <h1 class="page-title">📅 Дневные задачи</h1>
    <p class="date-label">{{ currentDate }}</p>

    <!-- Section 1: Plan for the day -->
    <section class="section">
      <h2 class="section-title">📋 План на день</h2>

      <div v-if="plannedTasks.length === 0" class="empty-state">
        <p>Нет запланированных задач. Добавьте первую!</p>
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
        />
      </div>

      <div class="add-task-form card">
        <div class="add-task-row">
          <input
            v-model="newTaskText"
            class="input"
            placeholder="Новая задача..."
            @keydown.enter="addPlannedTask"
          />
          <div class="pomodoro-count-control">
            <button class="btn btn-ghost btn-icon" aria-label="Уменьшить количество помидоров" @click="newTaskPomodoros = Math.max(1, newTaskPomodoros - 1)">−</button>
            <span class="pomodoro-count-label">🍅 {{ newTaskPomodoros }}</span>
            <button class="btn btn-ghost btn-icon" aria-label="Увеличить количество помидоров" @click="newTaskPomodoros = Math.min(12, newTaskPomodoros + 1)">+</button>
          </div>
          <button class="btn btn-primary" @click="addPlannedTask">Добавить</button>
        </div>
        <p class="hint">💡 Если задача > 5–7 помидоров — разбейте её на части</p>
      </div>
    </section>

    <!-- Section 2: Active pomodoro (only when timer is running) -->
    <section v-if="tasksStore.activeTimer" class="section active-section">
      <h2 class="section-title">⏱ Активный помидор</h2>
      <div class="active-pomodoro card">
        <div class="active-task-name">{{ activeTaskName }}</div>
        <div class="active-phase">{{ activePhaseLabel }}</div>
        <div class="active-timer-display">{{ pomodoroDisplay }}</div>
        <div class="active-timer-controls">
          <button class="btn btn-primary" @click="togglePause">
            {{ tasksStore.activeTimer.isPaused ? '▶ Продолжить' : '⏸ Пауза' }}
          </button>
          <button class="btn btn-ghost" @click="tasksStore.resetTimer()">⏹ Сброс</button>
          <button class="btn btn-warning" @click="recordActiveInterruption">⚡ Записать прерывание</button>
        </div>
      </div>
    </section>

    <!-- Section 3: Unplanned tasks -->
    <section class="section">
      <h2 class="section-title">📝 Незапланированные дела</h2>
      <p class="hint">Если во время работы появилась новая задача — запишите её здесь, не прерывая таймер.</p>

      <div class="task-list">
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
        />
      </div>

      <div class="add-unplanned-row">
        <input
          v-model="newUnplannedText"
          class="input"
          placeholder="Запишите новую задачу..."
          @keydown.enter="addUnplanned"
        />
        <button class="btn btn-secondary" @click="addUnplanned">Записать</button>
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
  max-width: 750px;
}
.date-label {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  text-transform: capitalize;
}
.section {
  margin-bottom: 2.5rem;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 1.5rem 0;
}
.add-task-form {
  padding: 1rem;
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
  min-width: 180px;
}
.pomodoro-count-control {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.pomodoro-count-label {
  font-size: 0.9rem;
  min-width: 3.5ch;
  text-align: center;
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
.hint {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}
/* Active pomodoro section */
.active-section .section-title {
  color: var(--accent);
}
.active-pomodoro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 2px solid var(--accent);
  border-radius: 12px;
  background: rgba(108, 99, 255, 0.06);
}
.active-task-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}
.active-phase {
  font-size: 0.95rem;
  color: var(--text-secondary);
}
.active-timer-display {
  font-family: 'Courier New', monospace;
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--accent);
  letter-spacing: 0.05em;
}
.active-timer-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}
.btn-warning {
  background: rgba(255, 160, 50, 0.15);
  color: #e07b00;
  border: 1px solid rgba(255, 160, 50, 0.4);
}
.btn-warning:hover {
  background: rgba(255, 160, 50, 0.25);
}
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
.btn-secondary:hover {
  background: var(--bg-hover, rgba(108, 99, 255, 0.1));
}
</style>

