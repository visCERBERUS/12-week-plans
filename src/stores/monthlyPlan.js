import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useMonthlyPlanStore = defineStore('monthlyPlan', () => {
  const stored = JSON.parse(localStorage.getItem('vis-monthly') || '{}')
  const tasksByBlock = ref(stored)

  watch(tasksByBlock, () => {
    localStorage.setItem('vis-monthly', JSON.stringify(tasksByBlock.value))
  }, { deep: true })

  function getBlockTasks(blockNum) {
    const key = `block-${blockNum}`
    if (!tasksByBlock.value[key]) tasksByBlock.value[key] = []
    return tasksByBlock.value[key]
  }

  function addTask(blockNum, text) {
    const key = `block-${blockNum}`
    if (!tasksByBlock.value[key]) tasksByBlock.value[key] = []
    tasksByBlock.value[key].push({ id: crypto.randomUUID(), text, done: false })
  }

  function toggleTask(blockNum, id) {
    const tasks = getBlockTasks(blockNum)
    const task = tasks.find(t => t.id === id)
    if (task) task.done = !task.done
  }

  function deleteTask(blockNum, id) {
    const key = `block-${blockNum}`
    if (tasksByBlock.value[key]) {
      tasksByBlock.value[key] = tasksByBlock.value[key].filter(t => t.id !== id)
    }
  }

  return { tasksByBlock, getBlockTasks, addTask, toggleTask, deleteTask }
})
