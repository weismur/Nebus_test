import type { NoteHistoryItem } from '~/types/note-history-item.ts'
import type { NoteTodoItem } from '~/types/note-todo-item.ts'
import type { Note } from '~/types/note.ts'

const HISTORY_LIMIT = 50

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])

  const draft = ref<Note | null>(null)

  const history = ref<NoteHistoryItem[]>([])
  const historyIndex = ref(0)

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length)

  function getNoteById(id: string) {
    return notes.value.find(note => note.id === id)
  }

  let openTextEdit: string | null = null

  function pushHistory(entry: NoteHistoryItem) {
    history.value.splice(historyIndex.value)
    history.value.push(entry)

    if (history.value.length > HISTORY_LIMIT)
      history.value.splice(0, history.value.length - HISTORY_LIMIT)

    historyIndex.value = history.value.length
    openTextEdit = null
  }

  function sealHistory() {
    openTextEdit = null
  }

  function lastEntry() {
    return history.value[historyIndex.value - 1]
  }

  function clearHistory() {
    history.value = []
    historyIndex.value = 0
    openTextEdit = null
  }

  function startEditing(noteId: string) {
    const note = getNoteById(noteId)

    draft.value = note ? structuredClone(toRaw(note)) : null
    clearHistory()
  }

  function saveDraft() {
    const source = draft.value
    const note = source ? getNoteById(source.id) : undefined

    if (source && note) {
      note.title = source.title
      note.items = source.items
        .filter(item => item.text.trim())
        .map(item => ({ ...toRaw(item) }))
    }

    discardDraft()
  }

  function discardDraft() {
    draft.value = null
    clearHistory()
  }

  function addNote() {
    const id = generateId()

    notes.value.push({
      id,
      title: '',
      items: [],
    })
  }

  function removeNote(id: string) {
    const foundNoteIndex = notes.value.findIndex(note => note.id === id)

    if (foundNoteIndex !== -1) {
      notes.value.splice(foundNoteIndex, 1)
    }
  }

  function updateNoteTitle(title: string) {
    const note = draft.value

    if (!note || note.title === title)
      return

    const last = lastEntry()

    if (openTextEdit === 'title' && last?.type === 'update-title') {
      last.after = title
    }
    else {
      pushHistory({ type: 'update-title', before: note.title, after: title })
      openTextEdit = 'title'
    }

    note.title = title
  }

  function addItem() {
    const note = draft.value

    if (!note)
      return

    const item: NoteTodoItem = { id: generateId(), text: '', done: false }
    const index = note.items.length

    note.items.push(item)
    pushHistory({ type: 'add-item', index, item })
  }

  function removeItem(itemIndex: number) {
    const note = draft.value

    if (!note)
      return

    const [item] = note.items.splice(itemIndex, 1)

    if (item)
      pushHistory({ type: 'remove-item', index: itemIndex, item: toRaw(item) })
  }

  function updateItemText(itemId: string, text: string) {
    const item = draft.value?.items.find(item => item.id === itemId)

    if (!item || item.text === text)
      return

    const key = `item:${itemId}`
    const last = lastEntry()

    if (openTextEdit === key && last?.type === 'update-item-text') {
      last.after = text
    }
    else {
      pushHistory({ type: 'update-item-text', itemId, before: item.text, after: text })
      openTextEdit = key
    }

    item.text = text
  }

  function toggleItem(itemId: string) {
    const item = draft.value?.items.find(item => item.id === itemId)

    if (!item)
      return

    const before = item.done

    item.done = !item.done
    pushHistory({ type: 'toggle-item', itemId, before, after: item.done })
  }

  function applyUndo(entry: NoteHistoryItem) {
    const note = draft.value

    if (!note)
      return

    switch (entry.type) {
      case 'add-item': {
        const index = note.items.findIndex(item => item.id === entry.item.id)

        if (index !== -1)
          note.items.splice(index, 1)

        break
      }
      case 'remove-item':
        note.items.splice(entry.index, 0, entry.item)
        break
      case 'update-title':
        note.title = entry.before
        break
      case 'update-item-text': {
        const item = note.items.find(item => item.id === entry.itemId)

        if (item)
          item.text = entry.before

        break
      }
      case 'toggle-item': {
        const item = note.items.find(item => item.id === entry.itemId)

        if (item)
          item.done = entry.before

        break
      }
    }
  }

  function applyRedo(entry: NoteHistoryItem) {
    const note = draft.value

    if (!note)
      return

    switch (entry.type) {
      case 'add-item':
        note.items.splice(entry.index, 0, entry.item)
        break
      case 'remove-item': {
        const index = note.items.findIndex(item => item.id === entry.item.id)

        if (index !== -1)
          note.items.splice(index, 1)

        break
      }
      case 'update-title':
        note.title = entry.after
        break
      case 'update-item-text': {
        const item = note.items.find(item => item.id === entry.itemId)

        if (item)
          item.text = entry.after

        break
      }
      case 'toggle-item': {
        const item = note.items.find(item => item.id === entry.itemId)

        if (item)
          item.done = entry.after

        break
      }
    }
  }

  function undo() {
    if (!canUndo.value)
      return

    const entry = lastEntry()

    if (!entry)
      return

    sealHistory()
    historyIndex.value -= 1
    applyUndo(entry)
  }

  function redo() {
    if (!canRedo.value)
      return

    const entry = history.value[historyIndex.value]

    if (!entry)
      return

    sealHistory()
    applyRedo(entry)
    historyIndex.value += 1
  }

  return {
    notes,
    draft,
    history,
    historyIndex,
    canUndo,
    canRedo,
    getNoteById,
    addNote,
    removeNote,
    startEditing,
    saveDraft,
    discardDraft,
    updateNoteTitle,
    addItem,
    removeItem,
    updateItemText,
    toggleItem,
    undo,
    redo,
    sealHistory,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useNotesStore, import.meta.hot))
