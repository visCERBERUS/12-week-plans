<template>
  <div class="daily-tasks">
    <h1 class="page-title">📅 Дневные задачи</h1>
    <p class="date-label">{{ currentDate }}</p>

    <div class="add-task-row">
      <input
        v-model="newTask"
        class="input"
        placeholder="Новая задача..."
        @keydown.enter="addTask"
      />
      <button class="btn btn-primary" @click="addTask">Добавить</button>
    </div>

    <div v-if="tasks.length === 0" class="empty-state">
      <p>Задач на сегодня нет. Добавьте первую!</p>
    </div>

    <div class="task-list">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="tasksStore.toggleTask(task.id)"
        @delete="tasksStore.deleteTask(task.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TaskCard from '../components/TaskCard.vue'
import { useTasksStore } from '../stores/tasks.js'

const tasksStore = useTasksStore()
const newTask = ref('')

const currentDate = computed(() =>
  new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const tasks = computed(() => tasksStore.getTodayTasks())

function addTask() {
  if (newTask.value.trim()) {
    tasksStore.addTask(newTask.value.trim())
    newTask.value = ''
  }
}
</script>

<style scoped>
.daily-tasks {
  max-width: 700px;
}
.date-label {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  text-transform: capitalize;
}
.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem 0;
}
</style>
