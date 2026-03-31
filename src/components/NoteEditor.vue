<template>
  <Teleport to="body">
    <Transition name="editor-overlay">
      <div v-if="visible" class="note-editor-overlay" @click.self="close">
        <div class="note-editor-panel">
          <!-- Header -->
          <div class="editor-header">
            <input
              v-model="localTitle"
              class="editor-title-input"
              placeholder="Заголовок заметки..."
              @input="scheduleSave"
            />
            <div class="editor-header-actions">
              <button class="btn-icon" :class="{ pinned: note.isPinned }" @click="togglePin" title="Закрепить">
                📌
              </button>
              <button class="btn-icon close-btn" @click="close" title="Закрыть (Esc)">✕</button>
            </div>
          </div>

          <!-- Tags -->
          <div class="editor-tags">
            <span
              v-for="tag in localTags"
              :key="tag"
              class="tag-badge"
            >
              {{ tag }}
              <button class="tag-remove" @click="removeTag(tag)">×</button>
            </span>
            <div class="tag-add-wrap">
              <input
                v-model="newTag"
                class="tag-input"
                placeholder="+ тег"
                @keydown.enter.prevent="addTag"
                @keydown.comma.prevent="addTag"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="editor-body">
            <textarea
              ref="textareaRef"
              v-model="localContent"
              class="editor-textarea"
              placeholder="Начни писать конспект... Поддерживается **жирный**, # заголовки, - списки"
              @input="scheduleSave"
            />
          </div>

          <!-- Flashcards section -->
          <div class="editor-flashcards">
            <div class="flashcards-header">
              <h3 class="flashcards-title">🎴 Карточки ({{ note.flashcards.length }})</h3>
              <button class="btn btn-ghost btn-sm" @click="showAddCard = !showAddCard">
                {{ showAddCard ? 'Отмена' : '+ Добавить' }}
              </button>
            </div>

            <!-- Add card form -->
            <Transition name="slide-down">
              <div v-if="showAddCard" class="add-card-form">
                <textarea
                  v-model="newCardQuestion"
                  class="card-input"
                  placeholder="Вопрос..."
                  rows="2"
                />
                <textarea
                  v-model="newCardAnswer"
                  class="card-input"
                  placeholder="Ответ..."
                  rows="2"
                />
                <button class="btn btn-primary btn-sm" @click="addCard" :disabled="!newCardQuestion.trim() || !newCardAnswer.trim()">
                  Добавить карточку
                </button>
              </div>
            </Transition>

            <!-- Cards list -->
            <div class="cards-list">
              <div
                v-for="card in note.flashcards"
                :key="card.id"
                class="card-item"
              >
                <div class="card-question" @click="toggleCardAnswer(card.id)">
                  <span class="card-q-icon">❓</span>
                  <span class="card-q-text">{{ card.question }}</span>
                  <span class="card-toggle">{{ expandedCards.has(card.id) ? '▲' : '▼' }}</span>
                </div>
                <Transition name="slide-down">
                  <div v-if="expandedCards.has(card.id)" class="card-answer">
                    <div class="card-a-content">{{ card.answer }}</div>
                    <div class="card-actions">
                      <span v-if="card.lastReviewed" class="card-meta">
                        Повторено: {{ formatDate(card.lastReviewed) }}
                      </span>
                      <span v-if="card.repetitions > 0" class="card-reps">{{ card.repetitions }}×</span>
                      <button class="btn-icon-sm" @click="editingCard = card.id; editCardQ = card.question; editCardA = card.answer" title="Редактировать">✏️</button>
                      <button class="btn-icon-sm danger" @click="deleteCard(card.id)" title="Удалить">🗑️</button>
                    </div>
                    <div v-if="editingCard === card.id" class="edit-card-form">
                      <textarea v-model="editCardQ" class="card-input" rows="2" placeholder="Вопрос..." />
                      <textarea v-model="editCardA" class="card-input" rows="2" placeholder="Ответ..." />
                      <div class="edit-actions">
                        <button class="btn btn-primary btn-sm" @click="saveEditCard(card.id)">Сохранить</button>
                        <button class="btn btn-ghost btn-sm" @click="editingCard = null">Отмена</button>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
              <p v-if="note.flashcards.length === 0" class="cards-empty">Нет карточек. Добавь первую!</p>
            </div>
          </div>

          <!-- Footer meta -->
          <div class="editor-footer">
            <span class="meta-item">📅 Создано: {{ formatDate(note.createdAt) }}</span>
            <span class="meta-item">✏️ Обновлено: {{ formatDate(note.updatedAt) }}</span>
            <span v-if="saveStatus" class="save-status" :class="saveStatus">
              {{ saveStatus === 'saving' ? '💾 Сохранение...' : '✅ Сохранено' }}
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge.js'

const props = defineProps({
  noteId: { type: String, default: null },
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const store = useKnowledgeStore()

const localTitle = ref('')
const localContent = ref('')
const localTags = ref([])
const newTag = ref('')
const note = ref({ flashcards: [], isPinned: false, createdAt: '', updatedAt: '', tags: [] })

const showAddCard = ref(false)
const newCardQuestion = ref('')
const newCardAnswer = ref('')
const expandedCards = ref(new Set())
const editingCard = ref(null)
const editCardQ = ref('')
const editCardA = ref('')
const textareaRef = ref(null)
const saveStatus = ref(null)
let saveTimer = null
let saveStatusTimer = null

watch(() => props.noteId, loadNote, { immediate: true })
watch(() => props.visible, (v) => {
  if (v) {
    loadNote()
    nextTick(() => textareaRef.value?.focus())
  }
})

function loadNote() {
  if (!props.noteId) return
  const n = store.notes.find(n => n.id === props.noteId)
  if (!n) return
  note.value = n
  localTitle.value = n.title
  localContent.value = n.content
  localTags.value = [...n.tags]
}

function scheduleSave() {
  saveStatus.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    store.updateNote(props.noteId, {
      title: localTitle.value,
      content: localContent.value,
      tags: localTags.value,
    })
    loadNote()
    saveStatus.value = 'saved'
    clearTimeout(saveStatusTimer)
    saveStatusTimer = setTimeout(() => { saveStatus.value = null }, 1500)
  }, 500)
}

function addTag() {
  const tag = newTag.value.trim().replace(/,/g, '')
  if (tag && !localTags.value.includes(tag)) {
    localTags.value.push(tag)
    scheduleSave()
  }
  newTag.value = ''
}

function removeTag(tag) {
  localTags.value = localTags.value.filter(t => t !== tag)
  scheduleSave()
}

function togglePin() {
  store.togglePinNote(props.noteId)
  loadNote()
}

function toggleCardAnswer(cardId) {
  if (expandedCards.value.has(cardId)) {
    expandedCards.value.delete(cardId)
  } else {
    expandedCards.value.add(cardId)
  }
  expandedCards.value = new Set(expandedCards.value)
}

function addCard() {
  if (!newCardQuestion.value.trim() || !newCardAnswer.value.trim()) return
  store.addFlashcard(props.noteId, newCardQuestion.value.trim(), newCardAnswer.value.trim())
  newCardQuestion.value = ''
  newCardAnswer.value = ''
  showAddCard.value = false
  loadNote()
}

function deleteCard(cardId) {
  store.deleteFlashcard(props.noteId, cardId)
  loadNote()
}

function saveEditCard(cardId) {
  store.updateFlashcard(props.noteId, cardId, {
    question: editCardQ.value,
    answer: editCardA.value,
  })
  editingCard.value = null
  loadNote()
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function close() {
  clearTimeout(saveTimer)
  if (saveStatus.value === 'saving') {
    store.updateNote(props.noteId, {
      title: localTitle.value,
      content: localContent.value,
      tags: localTags.value,
    })
  }
  emit('close')
}

function onKeyDown(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  clearTimeout(saveTimer)
  clearTimeout(saveStatusTimer)
})
</script>

<style scoped>
.note-editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.note-editor-panel {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
}

/* Overlay animation */
.editor-overlay-enter-active,
.editor-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.editor-overlay-enter-from,
.editor-overlay-leave-to {
  opacity: 0;
}
.editor-overlay-enter-active .note-editor-panel,
.editor-overlay-leave-active .note-editor-panel {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.editor-overlay-enter-from .note-editor-panel,
.editor-overlay-leave-to .note-editor-panel {
  transform: scale(0.95);
  opacity: 0;
}

/* Header */
.editor-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.editor-title-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: inherit;
}

.editor-title-input::placeholder { color: var(--text-secondary); opacity: 0.6; }

.editor-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.3rem;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s;
  opacity: 0.6;
}
.btn-icon:hover { opacity: 1; background: var(--bg-secondary); }
.btn-icon.pinned { opacity: 1; color: var(--accent); }
.btn-icon.close-btn { font-size: 1rem; font-weight: 700; }

/* Tags */
.editor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  min-height: 44px;
  align-items: center;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.2rem 0.6rem;
  background: rgba(124, 111, 255, 0.15);
  color: var(--accent);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent);
  font-size: 0.9rem;
  line-height: 1;
  padding: 0;
  opacity: 0.7;
}
.tag-remove:hover { opacity: 1; }

.tag-add-wrap { display: flex; }
.tag-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.8rem;
  color: var(--text-secondary);
  width: 80px;
  font-family: inherit;
}
.tag-input::placeholder { color: var(--text-secondary); opacity: 0.6; }

/* Body / textarea */
.editor-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 0.92rem;
  line-height: 1.7;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  overflow-y: auto;
}

.editor-textarea::placeholder { color: var(--text-secondary); opacity: 0.5; }

/* Flashcards section */
.editor-flashcards {
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  max-height: 280px;
  overflow-y: auto;
  padding: 0.75rem 1.5rem;
}

.flashcards-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.flashcards-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

.add-card-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.card-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.85rem;
  resize: none;
  box-sizing: border-box;
  outline: none;
}
.card-input:focus { border-color: var(--accent); }

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card-item {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.card-question {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  user-select: none;
  background: var(--bg-secondary);
  transition: background 0.2s;
}
.card-question:hover { background: rgba(124, 111, 255, 0.1); }

.card-q-icon { font-size: 0.85rem; flex-shrink: 0; }
.card-q-text { flex: 1; font-size: 0.85rem; color: var(--text-primary); }
.card-toggle { font-size: 0.7rem; color: var(--text-secondary); flex-shrink: 0; }

.card-answer {
  padding: 0.6rem 0.75rem;
  border-top: 1px solid var(--border);
  background: var(--bg-primary);
}

.card-a-content {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-meta, .card-reps {
  font-size: 0.72rem;
  color: var(--text-secondary);
  flex: 1;
}

.card-reps {
  color: var(--accent);
  font-weight: 600;
  flex: none;
}

.btn-icon-sm {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem 0.3rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.btn-icon-sm:hover { opacity: 1; }
.btn-icon-sm.danger:hover { color: var(--danger); }

.edit-card-form {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.cards-empty {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 0.5rem;
  opacity: 0.7;
}

/* Footer */
.editor-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1.5rem;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.save-status {
  font-size: 0.75rem;
  margin-left: auto;
}
.save-status.saving { color: var(--text-secondary); }
.save-status.saved { color: var(--success); }

/* Slide transition */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to, .slide-down-leave-from {
  opacity: 1;
  max-height: 400px;
}

@media (max-width: 600px) {
  .note-editor-panel {
    max-height: 100vh;
    border-radius: 0;
  }
  .note-editor-overlay {
    padding: 0;
    align-items: flex-start;
  }
  .editor-title-input { font-size: 1.2rem; }
}
</style>
