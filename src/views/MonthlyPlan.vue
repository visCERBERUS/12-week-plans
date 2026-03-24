<template>
  <div class="monthly-plan">
    <h1 class="page-title">🗓️ 4-недельный блок {{ currentBlock }} (из 3)</h1>

    <div class="card timer-card">
      <p class="timer-label-text">До конца блока:</p>
      <CountdownTimer :targetTime="endOfBlock" />
    </div>

    <div class="progress-info">
      <span>{{ doneCount }} / {{ tasks.length }} выполнено</span>
      <div class="progress-bar-wrap" style="flex:1; margin-left: 1rem">
        <div class="progress-bar-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>

    <div class="add-task-row" style="margin-top: 1.5rem">
      <input v-model="newTask" class="input" placeholder="Цель на этот 4-недельный блок..." @keydown.enter="addTask" />
      <button class="btn btn-primary" @click="addTask">Добавить</button>
    </div>

    <div v-if="tasks.length === 0" class="empty-state">
      <p>Нет задач на этот блок.</p>
    </div>

    <div class="task-list">
      <PlanTaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="monthlyStore.toggleTask(currentBlock, task.id)"
        @delete="monthlyStore.deleteTask(currentBlock, task.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CountdownTimer from '../components/CountdownTimer.vue'
import PlanTaskCard from '../components/PlanTaskCard.vue'
import { useSettingsStore } from '../stores/settings.js'
import { useMonthlyPlanStore } from '../stores/monthlyPlan.js'

const settings = useSettingsStore()
const monthlyStore = useMonthlyPlanStore()
const newTask = ref('')

const startDate = computed(() => new Date(settings.startDate).getTime())

const currentWeek = computed(() => {
  const diff = Date.now() - startDate.value
  const week = Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1
  return Math.max(1, Math.min(week, 12))
})

const currentBlock = computed(() => Math.min(Math.ceil(currentWeek.value / 4), 3))

const endOfBlock = computed(() => {
  return startDate.value + currentBlock.value * 4 * 7 * 24 * 3600 * 1000
})

const tasks = computed(() => monthlyStore.getBlockTasks(currentBlock.value))
const doneCount = computed(() => tasks.value.filter(t => t.done).length)
const progressPct = computed(() => tasks.value.length > 0 ? (doneCount.value / tasks.value.length) * 100 : 0)

function addTask() {
  if (newTask.value.trim()) {
    monthlyStore.addTask(currentBlock.value, newTask.value.trim())
    newTask.value = ''
  }
}
</script>

<style scoped>
.monthly-plan { max-width: 700px; }
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
