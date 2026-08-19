import type { NoteTodoItem } from '~/types/note-todo-item.ts'

export interface Note {
  id: number
  title: string
  items: NoteTodoItem[]
}
