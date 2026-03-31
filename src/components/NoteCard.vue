<template>
  <div class="note-card card" :class="{ pinned: note.isPinned }" @click="$emit('open', note.id)">
    <div class="note-card-top">
      <span v-if="note.isPinned" class="pin-marker">📌</span>
      <span v-if="folder" class="note-folder" :style="{ color: folder.color }">{{ folder.icon }}</span>
      <div class="note-card-actions" @click.stop>
        <button class="btn-icon-xs" @click="$emit('toggle-pin', note.id)" :title="note.isPinned ? 'Открепить' : 'Закрепить'">
          📌
        </button>
        <button class="btn-icon-xs danger" @click="$emit('delete', note.id)" title="Удалить">🗑️</button>
      </div>
    </div>
    <div class="note-title">{{ note.title || 'Без названия' }}</div>
    <div v-if="note.content" class="note-preview">{{ preview }}</div>
    <div class="note-meta">
      <div class="note-tags">
        <span v-for="tag in note.tags.slice(0, 3)" :key="tag" class="tag-sm">{{ tag }}</span>
      </div>
      <span v-if="note.flashcards.length > 0" class="cards-badge">🎴 {{ note.flashcards.length }}</span>
    </div>
    <div class="note-date">{{ formatDate(note.updatedAt) }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  note: { type: Object, required: true },
  folder: { type: Object, default: null },
})

defineEmits(['open', 'delete', 'toggle-pin'])

const preview = computed(() =>
  (props.note.content || '').replace(/[#*\-]/g, '').trim().slice(0, 80) +
  (props.note.content?.length > 80 ? '...' : '')
)

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.note-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  cursor: pointer;
  padding: 0.85rem 1rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  min-height: 100px;
}
.note-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
.note-card.pinned { border-left-color: var(--accent); }

.note-card-top {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.pin-marker, .note-folder { font-size: 0.85rem; }

.note-card-actions {
  display: flex;
  gap: 0.2rem;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
}
.note-card:hover .note-card-actions { opacity: 1; }

.btn-icon-xs {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.1rem 0.2rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.btn-icon-xs:hover { opacity: 1; }
.btn-icon-xs.danger:hover { color: var(--danger); }

.note-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-preview {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: auto;
}

.note-tags { display: flex; gap: 0.25rem; flex-wrap: wrap; }

.tag-sm {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  background: rgba(124,111,255,0.12);
  color: var(--accent);
  border-radius: 999px;
  font-size: 0.68rem;
}

.cards-badge {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-left: auto;
}

.note-date {
  font-size: 0.68rem;
  color: var(--text-secondary);
  opacity: 0.7;
}
</style>
