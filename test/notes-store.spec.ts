import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLocalStorage } from '~/composables/useLocalStorage.ts'
import { useNotesStore } from '~/stores/notes.ts'

const { loadNotes, saveNotes, loadDraft, saveDraft } = useLocalStorage()

describe('стор заметок', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('список', () => {
    it('добавляет заметку с уникальным id и пишет её в хранилище', () => {
      const store = useNotesStore()

      store.addNote()
      store.addNote()

      expect(store.notes).toHaveLength(2)
      expect(store.notes[0]!.id).not.toBe(store.notes[1]!.id)
      expect(loadNotes()).toHaveLength(2)
    })

    it('удаляет заметку и обновляет хранилище', () => {
      const store = useNotesStore()

      store.addNote()
      store.removeNote(store.notes[0]!.id)

      expect(store.notes).toHaveLength(0)
      expect(loadNotes()).toHaveLength(0)
    })

    it('не ломается при удалении несуществующей заметки', () => {
      const store = useNotesStore()

      store.addNote()
      store.removeNote('такого-нет')

      expect(store.notes).toHaveLength(1)
    })
  })

  describe('сессия редактирования', () => {
    it('правит копию, не трогая сохранённую заметку', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)
      store.updateNoteTitle('Черновик')
      store.addItem()

      expect(store.draft!.title).toBe('Черновик')
      expect(store.notes[0]!.title).toBe('')
      expect(store.notes[0]!.items).toHaveLength(0)
    })

    it('оставляет драфт пустым для несуществующего id', () => {
      const store = useNotesStore()

      store.startEditing('такого-нет')

      expect(store.draft).toBeNull()
    })

    it('переносит правки в заметку при сохранении', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)
      store.updateNoteTitle('Покупки')
      store.addItem()
      store.updateItemText(store.draft!.items[0]!.id, 'Хлеб')
      store.saveDraft()

      expect(store.notes[0]!.title).toBe('Покупки')
      expect(store.notes[0]!.items).toHaveLength(1)
      expect(store.notes[0]!.items[0]!.text).toBe('Хлеб')
      expect(store.draft).toBeNull()
    })

    it('выбрасывает пункты без текста при сохранении', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)
      store.addItem()
      store.updateItemText(store.draft!.items[0]!.id, 'Заполненный')
      store.addItem()
      store.addItem()
      store.updateItemText(store.draft!.items[2]!.id, '   ')
      store.saveDraft()

      expect(store.notes[0]!.items).toHaveLength(1)
      expect(store.notes[0]!.items[0]!.text).toBe('Заполненный')
    })

    it('при отмене не меняет сохранённую заметку', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)
      store.updateNoteTitle('Испорчено')
      store.discardDraft()

      expect(store.notes[0]!.title).toBe('')
      expect(store.draft).toBeNull()
    })

    it('после сохранения заметку можно открыть снова', () => {
      const store = useNotesStore()

      store.addNote()
      const id = store.notes[0]!.id

      store.startEditing(id)
      store.updateNoteTitle('Сохранено')
      store.saveDraft()

      store.startEditing(id)

      expect(store.draft!.title).toBe('Сохранено')
    })
  })

  describe('черновик в хранилище', () => {
    it('записывает текущий драфт по flushDraft', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)
      store.updateNoteTitle('Не сохранено')
      store.flushDraft()

      expect(loadDraft()!.title).toBe('Не сохранено')
    })

    it('не пишет черновик, пока идут правки', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)
      store.updateNoteTitle('Не сохранено')

      expect(loadDraft()).toBeNull()
    })

    it('предлагает восстановление, если черновик отличается от заметки', () => {
      const store = useNotesStore()

      store.addNote()
      const id = store.notes[0]!.id

      saveDraft({ id, title: 'Из прошлой сессии', items: [] })
      store.startEditing(id)

      expect(store.pendingDraft!.title).toBe('Из прошлой сессии')
      expect(store.draft!.title).toBe('')
    })

    it('не предлагает черновик, совпадающий с заметкой', () => {
      const store = useNotesStore()

      store.addNote()
      const note = store.notes[0]!

      saveDraft({ ...note, items: [] })
      store.startEditing(note.id)

      expect(store.pendingDraft).toBeNull()
      expect(loadDraft()).toBeNull()
    })

    it('не предлагает черновик от другой заметки', () => {
      const store = useNotesStore()

      store.addNote()
      saveDraft({ id: 'другая-заметка', title: 'Чужой', items: [] })
      store.startEditing(store.notes[0]!.id)

      expect(store.pendingDraft).toBeNull()
    })

    it('применяет черновик при восстановлении', () => {
      const store = useNotesStore()

      store.addNote()
      const id = store.notes[0]!.id

      saveDraft({ id, title: 'Из прошлой сессии', items: [] })
      store.startEditing(id)
      store.restoreDraft()

      expect(store.draft!.title).toBe('Из прошлой сессии')
      expect(store.pendingDraft).toBeNull()
      expect(store.history).toHaveLength(0)
    })

    it('удаляет черновик при отказе', () => {
      const store = useNotesStore()

      store.addNote()
      const id = store.notes[0]!.id

      saveDraft({ id, title: 'Из прошлой сессии', items: [] })
      store.startEditing(id)
      store.dismissDraft()

      expect(store.pendingDraft).toBeNull()
      expect(loadDraft()).toBeNull()
      expect(store.draft!.title).toBe('')
    })

    it('чистит черновик при сохранении и при отмене', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)
      store.flushDraft()
      store.saveDraft()

      expect(loadDraft()).toBeNull()
    })
  })

  describe('синхронизация между вкладками', () => {
    it('подтягивает список из хранилища', () => {
      const store = useNotesStore()

      saveNotes([{ id: 'из-другой-вкладки', title: 'Извне', items: [] }])
      store.syncFromStorage()

      expect(store.notes).toHaveLength(1)
      expect(store.notes[0]!.title).toBe('Извне')
    })

    it('помечает драфт осиротевшим, если редактируемую заметку удалили', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)

      // другая вкладка удалила заметку
      saveNotes([])
      store.syncFromStorage()

      expect(store.isDraftOrphaned).toBe(true)
    })

    it('не трогает флаг, если заметка на месте', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)
      store.syncFromStorage()

      expect(store.isDraftOrphaned).toBe(false)
    })

    it('снимает флаг при выходе из редактирования', () => {
      const store = useNotesStore()

      store.addNote()
      store.startEditing(store.notes[0]!.id)
      saveNotes([])
      store.syncFromStorage()

      store.discardDraft()

      expect(store.isDraftOrphaned).toBe(false)
    })
  })
})
