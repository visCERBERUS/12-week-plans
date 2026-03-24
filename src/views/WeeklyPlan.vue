<template>
  <div class="weekly-plan">
    <h1 class="page-title">📆 Неделя {{ currentWeek }} из 12</h1>

    <div class="card timer-card">
      <p class="timer-label-text">До конца недели:</p>
      <CountdownTimer :targetTime="endOfWeek" />
    </div>

    <div class="progress-info">
      <span>{{ doneCount }} / {{ tasks.length }} выполнено</span>
      <div class="progress-bar-wrap" style="flex:1; margin-left: 1rem">
        <div class="progress-bar-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>

    <div class="add-task-row" style="margin-top: 1.5rem">
      <input v-model="newTask" class="input" placeholder="Цель на эту неделю..." @keydown.enter="addTask" />
      <button class="btn btn-primary" @click="addTask">Добавить</button>
    </div>

    <div v-if="tasks.length === 0" class="empty-state">
      <p>Нет задач на эту неделю.</p>
    </div>

    <div class="task-list">
      <PlanTaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="weeklyStore.toggleTask(currentWeek, task.id)"
        @delete="weeklyStore.deleteTask(currentWeek, task.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CountdownTimer from '../components/CountdownTimer.vue'
import PlanTaskCard from '../components/PlanTaskCard.vue'
import { useSettingsStore } from '../stores/settings.js'
import { useWeeklyPlanStore } from '../stores/weeklyPlan.js'

const settings = useSettingsStore()
const weeklyStore = useWeeklyPlanStore()
const newTask = ref('')

const currentWeek = computed(() => {
  const now = Date.now()
  const start = new Date(settings.startDate).getTime()
  const diff = now - start
  const week = Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1
  return Math.max(1, Math.min(week, 12))
})

const endOfWeek = computed(() => {
  const now = new Date()
  const day = now.getDay()
  const daysUntilSunday = day === 0 ? 0 : 7 - day
  const sunday = new Date(now)
  sunday.setDate(now.getDate() + daysUntilSunday)
  sunday.setHours(23, 59, 59, 999)
  return sunday.getTime()
})

const tasks = computed(() => weeklyStore.getWeekTasks(currentWeek.value))
const doneCount = computed(() => tasks.value.filter(t => t.done).length)
const progressPct = computed(() => tasks.value.length > 0 ? (doneCount.value / tasks.value.length) * 100 : 0)

function addTask() {
  if (newTask.value.trim()) {
    weeklyStore.addTask(currentWeek.value, newTask.value.trim())
    newTask.value = ''
  }
}
</script>

<style scoped>
.weekly-plan { max-width: 700px; }
.timer-card {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 2rem;
}
.timer-label-text {
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}
.progress-info {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem 0;
}
</style>
