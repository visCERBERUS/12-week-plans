<template>
  <div class="card plan-task-card">
    <div class="task-top">
      <label class="task-check-label">
        <input type="checkbox" :checked="task.done" @change="$emit('toggle')" />
        <span :class="{ 'done-text': task.done }">{{ task.text }}</span>
      </label>
      <button class="btn btn-ghost btn-icon" @click="$emit('delete')" title="Удалить">🗑️</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ task: { type: Object, required: true } })
defineEmits(['toggle', 'delete'])
</script>

<style scoped>
.plan-task-card { transition: all 0.3s ease; }
.task-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.task-check-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  flex: 1;
}
.task-check-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
}
.btn-icon {
  padding: 0.35rem 0.5rem;
  font-size: 1rem;
}
</style>
