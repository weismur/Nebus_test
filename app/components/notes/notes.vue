<script setup lang="ts">
import type { Note } from '~/types/note.ts'

const notesStore = useNotesStore()

const { notes } = storeToRefs(notesStore)

const { $modal } = useNuxtApp()

const selectedNote = ref<Note | null>(null)

function requestDelete(note: Note) {
  selectedNote.value = note
  $modal.show('delete-note')
}

function confirmDelete() {
  if (!selectedNote.value)
    return

  notesStore.removeNote(selectedNote.value.id)
  $modal.close()
}

function addNewNote() {
  notesStore.addNote()
}

function editNote(id: string) {
  navigateTo(`/${id}`)
}
</script>

<template>
  <div class="notes">
    <NotesHeader @add-note="addNewNote" />
    <div class="notes__list">
      <NotesCard
        v-for="note in notes"
        :key="note.id"
        :item="note"
        @delete="requestDelete(note)"
        @edit="editNote(note.id)"
      />
    </div>

    <ModalDefaultModal name="delete-note" @cancel="$modal.close()">
      <template #title>
        Удалить заметку?
      </template>
      <template #description>
        Заметка и все подпункты будут удалены. Действие нельзя отменить.
      </template>
      <template #actions>
        <UIButton type="secondary" @click="$modal.close()">
          Отмена
        </UIButton>
        <UIButton type="danger-solid" @click="confirmDelete">
          Удалить
        </UIButton>
      </template>
    </ModalDefaultModal>
  </div>
</template>

<style scoped lang="scss">
@use 'notes.scss';
</style>
