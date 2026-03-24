<template>
  <div class="year-plan">
    <h1 class="page-title">🎯 12-недельный цикл</h1>

    <div class="card timer-card-big">
      <p class="timer-label-text">До конца цикла:</p>
      <CountdownTimer :targetTime="endOfCycle" label="осталось" />
      <button class="btn btn-ghost" style="margin-top: 1.5rem" @click="confirmNewCycle">
        🔄 Начать новый цикл
      </button>
    </div>

    <div class="progress-info">
      <span>{{ doneCount }} / {{ goals.length }} целей выполнено</span>
      <div class="progress-bar-wrap" style="flex:1; margin-left: 1rem">
        <div class="progress-bar-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>

    <div class="add-task-row" style="margin-top: 1.5rem">
      <input v-model="newGoal" class="input" placeholder="Цель на 12 недель..." @keydown.enter="addGoal" />
      <button class="btn btn-primary" @click="addGoal">Добавить</button>
    </div>

    <div v-if="goals.length === 0" class="empty-state">
      <p>Нет целей на цикл. Добавьте первую!</p>
    </div>

    <div class="task-list">
      <PlanTaskCard
        v-for="goal in goals"
        :key="goal.id"
        :task="goal"
        @toggle="yearStore.toggleGoal(goal.id)"
        @delete="yearStore.deleteGoal(goal.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CountdownTimer from '../components/CountdownTimer.vue'
import PlanTaskCard from '../components/PlanTaskCard.vue'
import { useSettingsStore } from '../stores/settings.js'
import { useYearPlanStore } from '../stores/yearPlan.js'

const settings = useSettingsStore()
const yearStore = useYearPlanStore()
const newGoal = ref('')

const endOfCycle = computed(() => {
  const start = new Date(settings.startDate).getTime()
  return start + 12 * 7 * 24 * 3600 * 1000
})

const goals = computed(() => yearStore.goals)
const doneCount = computed(() => goals.value.filter(g => g.done).length)
const progressPct = computed(() => goals.value.length > 0 ? (doneCount.value / goals.value.length) * 100 : 0)

function addGoal() {
  if (newGoal.value.trim()) {
    yearStore.addGoal(newGoal.value.trim())
    newGoal.value = ''
  }
}

function confirmNewCycle() {
  if (confirm('Начать новый 12-недельный цикл? Дата старта будет сброшена на сегодня.')) {
    settings.startDate = new Date().toISOString().split('T')[0]
  }
}
</script>

<style scoped>
.year-plan { max-width: 700px; }
.timer-card-big {
  text-align: center;
  padding: 2.5rem;
  margin-bottom: 1.5rem;
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
