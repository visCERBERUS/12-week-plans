<template>
  <div class="knowledge-page">
    <h1 class="page-title">📚 База знаний</h1>

    <!-- Top bar: search + add folder -->
    <div class="top-bar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          class="input search-input"
          placeholder="Поиск по заметкам..."
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
      </div>
      <button class="btn btn-ghost" @click="showFolderForm = true">+ Папка</button>
    </div>

    <!-- Search results -->
    <template v-if="searchQuery">
      <div class="section-label">Результаты поиска</div>
      <div v-if="searchResults.length === 0" class="empty-state">
        <p>Ничего не найдено по запросу «{{ searchQuery }}»</p>
      </div>
      <div v-else class="notes-grid">
        <NoteCard
          v-for="note in searchResults"
          :key="note.id"
          :note="note"
          :folder="getFolderById(note.folderId)"
          @open="openNote"
          @delete="deleteNote"
          @toggle-pin="store.togglePinNote(note.id)"
        />
      </div>
    </template>

    <!-- Normal view (no search) -->
    <template v-else>
      <!-- Due flashcards banner -->
      <div v-if="dueCards.length > 0" class="due-banner" @click="startReview">
        <span class="due-banner-icon">🎴</span>
        <div class="due-banner-text">
          <strong>Повторение — {{ dueCards.length }} карточ{{ pluralCards(dueCards.length) }} на сегодня</strong>
          <span>Нажми, чтобы начать →</span>
        </div>
      </div>

      <!-- Pinned notes -->
      <div v-if="pinnedNotes.length > 0" class="section">
        <div class="section-label">📌 Закреплённые</div>
        <div class="notes-grid">
          <NoteCard
            v-for="note in pinnedNotes"
            :key="note.id"
            :note="note"
            :folder="getFolderById(note.folderId)"
            @open="openNote"
            @delete="deleteNote"
            @toggle-pin="store.togglePinNote(note.id)"
          />
        </div>
      </div>

      <!-- Folders -->
      <div class="section">
        <div class="section-label">📁 Папки</div>
        <div class="folders-grid">
          <div
            v-for="folder in sortedFolders"
            :key="folder.id"
            class="folder-card"
            :style="{ '--folder-color': folder.color }"
            @click="openFolder(folder.id)"
          >
            <div class="folder-top">
              <span class="folder-icon">{{ folder.icon }}</span>
              <div class="folder-menu">
                <button class="btn-icon-xs" @click.stop="startEditFolder(folder)" title="Редактировать">✏️</button>
                <button class="btn-icon-xs" @click.stop="deleteFolder(folder.id)" title="Удалить">🗑️</button>
              </div>
            </div>
            <div class="folder-name">{{ folder.name }}</div>
            <div class="folder-count">{{ store.getNotesForFolder(folder.id).length }} заметок</div>
          </div>

          <!-- Unfiled card -->
          <div class="folder-card unfiled" @click="openFolder(null)">
            <div class="folder-top">
              <span class="folder-icon">📄</span>
            </div>
            <div class="folder-name">Без папки</div>
            <div class="folder-count">{{ unfiledNotes.length }} заметок</div>
          </div>
        </div>
      </div>

      <!-- Open folder view -->
      <Transition name="slide-down">
        <div v-if="openFolderId !== undefined" class="folder-view">
          <div class="folder-view-header">
            <span class="folder-view-title">
              <template v-if="openFolderId === null">📄 Без папки</template>
              <template v-else>
                {{ getFolderById(openFolderId)?.icon }} {{ getFolderById(openFolderId)?.name }}
              </template>
            </span>
            <div class="folder-view-actions">
              <button class="btn btn-primary btn-sm" @click="addNoteToFolder(openFolderId)">+ Заметка</button>
              <button class="btn btn-ghost btn-sm" @click="openFolderId = undefined">✕</button>
            </div>
          </div>
          <div v-if="folderNotes.length === 0" class="empty-state small">
            <p>В этой папке нет заметок</p>
          </div>
          <div v-else class="notes-grid">
            <NoteCard
              v-for="note in folderNotes"
              :key="note.id"
              :note="note"
              :folder="getFolderById(note.folderId)"
              @open="openNote"
              @delete="deleteNote"
              @toggle-pin="store.togglePinNote(note.id)"
            />
          </div>
        </div>
      </Transition>

      <!-- Stats footer -->
      <div class="stats-row">
        <span>📝 {{ stats.total }} заметок</span>
        <span>🎴 {{ stats.totalCards }} карточек</span>
        <span>✅ {{ stats.learnedPct }}% изучено</span>
      </div>
    </template>

    <!-- Add folder modal -->
    <Transition name="overlay-fade">
      <div v-if="showFolderForm || editingFolder" class="modal-overlay" @click.self="closeFolderForm">
        <div class="modal-box">
          <h3 class="modal-title">{{ editingFolder ? 'Редактировать папку' : 'Новая папка' }}</h3>
          <input v-model="folderForm.name" class="input" placeholder="Название папки..." style="margin-bottom: 0.75rem" />
          <div class="icon-color-row">
            <div class="icon-picker">
              <button
                v-for="ic in folderIcons"
                :key="ic"
                class="icon-btn"
                :class="{ selected: folderForm.icon === ic }"
                @click="folderForm.icon = ic"
              >{{ ic }}</button>
            </div>
            <div class="color-picker">
              <button
                v-for="c in folderColors"
                :key="c"
                class="color-dot"
                :class="{ selected: folderForm.color === c }"
                :style="{ background: c }"
                @click="folderForm.color = c"
              />
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" @click="saveFolderForm" :disabled="!folderForm.name.trim()">
              {{ editingFolder ? 'Сохранить' : 'Создать' }}
            </button>
            <button class="btn btn-ghost" @click="closeFolderForm">Отмена</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Note editor -->
    <NoteEditor
      :note-id="editingNoteId"
      :visible="!!editingNoteId"
      @close="editingNoteId = null"
    />

    <!-- Flashcard review -->
    <FlashcardReview
      :visible="reviewVisible"
      :cards="dueCards"
      @close="reviewVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge.js'
import NoteEditor from '../components/NoteEditor.vue'
import FlashcardReview from '../components/FlashcardReview.vue'
import NoteCard from '../components/NoteCard.vue'
import { pluralRu } from '../utils/pluralize.js'

const store = useKnowledgeStore()

const searchQuery = ref('')
const showFolderForm = ref(false)
const editingFolder = ref(null)
const folderForm = ref({ name: '', icon: '📁', color: '#7C6FFF' })
const openFolderId = ref(undefined) // undefined = closed, null = unfiled, string = folderId
const editingNoteId = ref(null)
const reviewVisible = ref(false)

const folderIcons = ['📁', '📐', '🔬', '💻', '📖', '🎨', '🌍', '🎵', '🏋️', '💡', '🧪', '📊']
const folderColors = ['#7C6FFF', '#4DA6FF', '#4ADE80', '#F5C842', '#E05A8A', '#FF6B35', '#A89CFF', '#22D3EE']

const sortedFolders = computed(() =>
  [...store.folders].sort((a, b) => a.order - b.order)
)

const pinnedNotes = computed(() =>
  store.notes.filter(n => n.isPinned)
)

const unfiledNotes = computed(() =>
  store.notes.filter(n => !n.folderId)
)

const folderNotes = computed(() => {
  if (openFolderId.value === undefined) return []
  return store.getNotesForFolder(openFolderId.value)
})

const dueCards = computed(() => store.getDueFlashcards)

const stats = computed(() => store.getNoteStats)

const searchResults = computed(() => store.searchNotes(searchQuery.value))

function getFolderById(id) {
  if (!id) return null
  return store.folders.find(f => f.id === id) || null
}

function openFolder(id) {
  if (openFolderId.value === id) {
    openFolderId.value = undefined
  } else {
    openFolderId.value = id
  }
}

function openNote(noteId) {
  editingNoteId.value = noteId
}

function addNoteToFolder(folderId) {
  const id = store.addNote(folderId)
  editingNoteId.value = id
}

function deleteNote(noteId) {
  store.deleteNote(noteId)
}

function deleteFolder(folderId) {
  if (confirm('Удалить папку? Заметки переместятся в «Без папки»')) {
    store.deleteFolder(folderId)
    if (openFolderId.value === folderId) openFolderId.value = undefined
  }
}

function startEditFolder(folder) {
  editingFolder.value = folder.id
  folderForm.value = { name: folder.name, icon: folder.icon, color: folder.color }
}

function saveFolderForm() {
  if (editingFolder.value) {
    store.updateFolder(editingFolder.value, folderForm.value)
  } else {
    store.addFolder(folderForm.value.name, folderForm.value.icon, folderForm.value.color)
  }
  closeFolderForm()
}

function closeFolderForm() {
  showFolderForm.value = false
  editingFolder.value = null
  folderForm.value = { name: '', icon: '📁', color: '#7C6FFF' }
}

function startReview() {
  reviewVisible.value = true
}

function pluralCards(n) {
  return pluralRu(n, ['а', 'и', ''])
}
</script>

<style scoped>
.knowledge-page {
  max-width: 860px;
}

/* Top bar */
.top-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.search-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  font-size: 0.95rem;
  pointer-events: none;
}

.search-input {
  padding-left: 2.25rem;
  padding-right: 2rem;
  width: 100%;
}

.search-clear {
  position: absolute;
  right: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* Due banner */
.due-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(124, 111, 255, 0.2), rgba(124, 111, 255, 0.08));
  border: 1px solid var(--accent);
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.2s;
}
.due-banner:hover { background: linear-gradient(135deg, rgba(124, 111, 255, 0.3), rgba(124, 111, 255, 0.12)); }

.due-banner-icon { font-size: 2rem; }
.due-banner-text { display: flex; flex-direction: column; gap: 0.1rem; }
.due-banner-text strong { font-size: 1rem; color: var(--text-primary); }
.due-banner-text span { font-size: 0.82rem; color: var(--accent); }

/* Section */
.section { margin-bottom: 1.5rem; }
.section-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

/* Notes grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

/* Folder grid */
.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
}

.folder-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-top: 3px solid var(--folder-color, var(--accent));
  border-radius: 10px;
  padding: 0.85rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.folder-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
.folder-card.unfiled { --folder-color: var(--text-secondary); }

.folder-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.folder-icon { font-size: 1.5rem; }

.folder-menu {
  display: flex;
  gap: 0.15rem;
  opacity: 0;
  transition: opacity 0.2s;
}
.folder-card:hover .folder-menu { opacity: 1; }

.btn-icon-xs {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.15rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.btn-icon-xs:hover { opacity: 1; }

.folder-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Folder view */
.folder-view {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.folder-view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.folder-view-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.folder-view-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
}

/* Stats row */
.stats-row {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.88rem;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

/* Empty state */
.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  font-size: 0.9rem;
}
.empty-state.small { padding: 1rem; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.5rem;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.icon-color-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.icon-btn {
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 0.3rem;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}
.icon-btn:hover { border-color: var(--accent); }
.icon-btn.selected { border-color: var(--accent); background: rgba(124,111,255,0.15); }

.color-picker {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}
.color-dot.selected { border-color: white; transform: scale(1.15); }

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

/* Transitions */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.25s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 1000px; }

@media (max-width: 600px) {
  .folders-grid { grid-template-columns: repeat(2, 1fr); }
  .notes-grid { grid-template-columns: 1fr 1fr; }
  .top-bar { flex-direction: column; align-items: stretch; }
}
</style>
