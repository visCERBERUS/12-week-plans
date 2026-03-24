import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useYearPlanStore = defineStore('yearPlan', () => {
  const stored = JSON.parse(localStorage.getItem('vis-yearly') || '[]')
  const goals = ref(stored)

  watch(goals, () => {
    localStorage.setItem('vis-yearly', JSON.stringify(goals.value))
  }, { deep: true })

  function addGoal(text) {
    goals.value.push({ id: crypto.randomUUID(), text, done: false })
  }

  function toggleGoal(id) {
    const goal = goals.value.find(g => g.id === id)
    if (goal) goal.done = !goal.done
  }

  function deleteGoal(id) {
    goals.value = goals.value.filter(g => g.id !== id)
  }

  return { goals, addGoal, toggleGoal, deleteGoal }
})
