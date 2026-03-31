<template>
  <div class="card plan-task-card">
    <div class="task-top">
      <label class="task-check-label">
        <input type="checkbox" :checked="task.done" @change="$emit('toggle')" />
        <template v-if="editing">
          <input
            ref="editInputRef"
            v-model="editText"
            class="input edit-inline-input"
            @keydown.enter="saveEdit"
            @keydown.esc="cancelEdit"
            @blur="saveEdit"
          />
        </template>
        <span v-else :class="{ 'done-text': task.done }" @dblclick="startEdit">{{ task.text }}</span>
      </label>
      <div class="task-actions">
        <button
          v-if="!editing"
          class="btn btn-ghost btn-icon"
          @click="startEdit"
          title="Редактировать"
        >✏️</button>
        <button
          v-if="editing"
          class="btn btn-ghost btn-icon"
          @click="cancelEdit"
          title="Отмена"
        >✕</button>
        <button
          class="btn btn-ghost btn-icon notes-toggle-btn"
          :class="{ 'notes-active': task.notes }"
          @click="notesOpen = !notesOpen"
          title="Конспект"
        >📝</button>
        <button class="btn btn-ghost btn-icon" @click="$emit('delete')" title="Удалить">🗑️</button>
      </div>
    </div>

    <!-- Notes section -->
    <div v-if="notesOpen" class="notes-section">
      <textarea
        class="input notes-textarea"
        :value="task.notes || ''"
        placeholder="Конспект к задаче..."
        rows="4"
        @input="$emit('update-notes', $event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['toggle', 'delete', 'update', 'update-notes'])

const editing = ref(false)
const editText = ref('')
const editInputRef = ref(null)
const notesOpen = ref(false)

function startEdit() {
  editText.value = props.task.text
  editing.value = true
  nextTick(() => editInputRef.value?.focus())
}

function saveEdit() {
  const trimmed = editText.value.trim()
  if (trimmed && trimmed !== props.task.text) {
    emit('update', trimmed)
  }
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}
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
  min-width: 0;
}
.task-check-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
  flex-shrink: 0;
}
.edit-inline-input {
  flex: 1;
  padding: 0.2rem 0.5rem;
  font-size: inherit;
}
.task-actions {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
}
.btn-icon {
  padding: 0.35rem 0.5rem;
  font-size: 1rem;
}
.notes-toggle-btn {
  opacity: 0.5;
}
.notes-toggle-btn.notes-active,
.notes-toggle-btn:hover {
  opacity: 1;
}
.notes-section {
  margin-top: 0.75rem;
}
.notes-textarea {
  width: 100%;
  resize: vertical;
  font-size: 0.88rem;
  padding: 0.5rem 0.75rem;
  box-sizing: border-box;
}
</style>
