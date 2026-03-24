<template>
  <div class="countdown-timer">
    <div class="timer-display">{{ formatted }}</div>
    <div class="timer-label" v-if="label">{{ label }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  targetTime: { type: Number, required: true }, // timestamp ms
  label: { type: String, default: '' },
})

const now = ref(Date.now())
let interval = null

onMounted(() => {
  interval = setInterval(() => { now.value = Date.now() }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

const remaining = computed(() => {
  const diff = props.targetTime - now.value
  return diff > 0 ? diff : 0
})

const formatted = computed(() => {
  const totalSec = Math.floor(remaining.value / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  if (days > 0) {
    return `${days} дн ${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  }
  return `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
})
</script>

<style scoped>
.countdown-timer {
  text-align: center;
}
.timer-display {
  font-family: 'Courier New', monospace;
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent);
  letter-spacing: 0.05em;
}
.timer-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}
</style>
