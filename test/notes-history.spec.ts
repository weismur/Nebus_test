import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useNotesStore } from '~/stores/notes.ts'

function setup() {
  const store = useNotesStore()

  store.addNote()
  store.startEditing(store.notes[0]!.id)

  return store
}

describe('история изменений', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('склеивает непрерывный ввод в одну запись', () => {
    const store = setup()

    store.updateNoteTitle('П')
    store.updateNoteTitle('Пл')
    store.updateNoteTitle('План')

    expect(store.history).toHaveLength(1)
    expect(store.draft!.title).toBe('План')
  })

  it('после blur начинает новую запись', () => {
    const store = setup()

    store.updateNoteTitle('План')
    store.sealHistory()
    store.updateNoteTitle('План на неделю')

    expect(store.history).toHaveLength(2)
  })

  it('ввод в другое поле не приклеивается к предыдущему', () => {
    const store = setup()

    store.updateNoteTitle('План')
    store.addItem()

    const itemId = store.draft!.items[0]!.id

    store.updateItemText(itemId, 'Купить хлеб')

    expect(store.history).toHaveLength(3)
  })

  it('отметка чекбокса, добавление и удаление — отдельные записи', () => {
    const store = setup()

    store.addItem()
    store.toggleItem(store.draft!.items[0]!.id)
    store.removeItem(0)

    expect(store.history).toHaveLength(3)
    expect(store.history.map(entry => entry.type)).toEqual(['add-item', 'toggle-item', 'remove-item'])
  })

  it('не пишет запись, если значение не изменилось', () => {
    const store = setup()

    store.updateNoteTitle('План')
    store.sealHistory()
    store.updateNoteTitle('План')

    expect(store.history).toHaveLength(1)
  })

  it('undo возвращает предыдущее состояние, redo — следующее', () => {
    const store = setup()

    store.updateNoteTitle('План')
    store.sealHistory()

    store.undo()
    expect(store.draft!.title).toBe('')
    expect(store.canRedo).toBe(true)

    store.redo()
    expect(store.draft!.title).toBe('План')
    expect(store.canUndo).toBe(true)
  })

  it('undo и redo восстанавливают удалённый пункт на прежнее место', () => {
    const store = setup()

    store.addItem()
    store.addItem()
    store.sealHistory()

    const firstId = store.draft!.items[0]!.id

    store.removeItem(0)
    expect(store.draft!.items).toHaveLength(1)

    store.undo()
    expect(store.draft!.items).toHaveLength(2)
    expect(store.draft!.items[0]!.id).toBe(firstId)

    store.redo()
    expect(store.draft!.items).toHaveLength(1)
  })

  it('новое изменение после undo очищает redo-ветку', () => {
    const store = setup()

    store.updateNoteTitle('Первый')
    store.sealHistory()
    store.updateNoteTitle('Второй')
    store.sealHistory()

    store.undo()
    expect(store.canRedo).toBe(true)

    store.updateNoteTitle('Третий')

    expect(store.canRedo).toBe(false)
    expect(store.history).toHaveLength(2)
  })

  it('не откатывается дальше начала и не повторяет дальше конца', () => {
    const store = setup()

    store.updateNoteTitle('План')
    store.sealHistory()

    store.undo()
    store.undo()
    expect(store.canUndo).toBe(false)
    expect(store.draft!.title).toBe('')

    store.redo()
    store.redo()
    expect(store.canRedo).toBe(false)
    expect(store.draft!.title).toBe('План')
  })

  it('хранит не больше 50 шагов, выбрасывая самые старые', () => {
    const store = setup()

    for (let i = 0; i < 60; i += 1)
      store.addItem()

    expect(store.history).toHaveLength(50)
    expect(store.historyIndex).toBe(50)
  })

  it('сбрасывается при сохранении', () => {
    const store = setup()

    store.updateNoteTitle('План')
    store.saveDraft()

    expect(store.history).toHaveLength(0)
    expect(store.historyIndex).toBe(0)
  })

  it('сбрасывается при отмене редактирования', () => {
    const store = setup()

    store.updateNoteTitle('План')
    store.discardDraft()

    expect(store.history).toHaveLength(0)
  })

  it('начинается заново при входе в редактирование', () => {
    const store = setup()

    store.updateNoteTitle('План')
    store.saveDraft()
    store.startEditing(store.notes[0]!.id)

    expect(store.history).toHaveLength(0)
    expect(store.canUndo).toBe(false)
  })
})
