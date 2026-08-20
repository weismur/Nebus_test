<script setup lang="ts">
const { $modal } = useNuxtApp()

const route = useRoute()
const notesStore = useNotesStore()

notesStore.startEditing(route.params.id as string)

const detail = computed(() => notesStore.draft)
const doneCount = computed(() => detail.value?.items.filter(item => item.done).length ?? 0)

function requestDelete() {
  $modal.show('delete-note')
}

function confirmDelete() {
  if (!detail.value)
    return

  notesStore.removeNote(detail.value.id)
  notesStore.discardDraft()
  $modal.close()

  navigateTo('/')
}

function save() {
  notesStore.saveDraft()
  navigateTo('/')
}

function requestCancel() {
  $modal.show('cancel-edit')
}

function confirmCancel() {
  notesStore.discardDraft()
  $modal.close()

  navigateTo('/')
}

onBeforeUnmount(() => {
  notesStore.discardDraft()
})
</script>

<template>
  <div class="notes-detail">
    <div v-if="detail" class="notes-detail__card">
      <NotesActions
        :history-index="notesStore.historyIndex"
        :history-total="notesStore.history.length"
        :can-undo="notesStore.canUndo"
        :can-redo="notesStore.canRedo"
        @undo="notesStore.undo"
        @redo="notesStore.redo"
        @delete="requestDelete"
        @save="save"
        @cancel="requestCancel"
      />

      <div class="notes-detail__body">
        <div class="notes-detail__field">
          <span class="notes-detail__label">Название</span>
          <UIInput
            :model-value="detail.title"
            class="notes-detail__title-input"
            @update:model-value="notesStore.updateNoteTitle($event ?? '')"
            @blur="notesStore.sealHistory()"
          />
        </div>

        <div class="notes-detail__tasks">
          <div class="notes-detail__tasks-header">
            <span class="notes-detail__label">Задачи</span>
            <span class="notes-detail__progress">{{ doneCount }} из {{ detail.items.length }} выполнено</span>
          </div>

          <ul class="notes-detail__list">
            <li
              v-for="(item, index) in detail.items"
              :key="item.id"
              class="notes-detail__row"
            >
              <UICheckbox :model-value="item.done" @update:model-value="notesStore.toggleItem(item.id)">
                <UIInput
                  :model-value="item.text"
                  placeholder="Текст пункта"
                  @update:model-value="notesStore.updateItemText(item.id, $event ?? '')"
                  @blur="notesStore.sealHistory()"
                />
              </UICheckbox>
              <button type="button" class="notes-detail__remove" @click="notesStore.removeItem(index)">
                ✕
              </button>
            </li>
          </ul>

          <UIButton type="ghost" class="notes-detail__add" @click="notesStore.addItem">
            + Добавить пункт
          </UIButton>
        </div>
      </div>
    </div>

    <p v-else class="notes-detail__not-found">
      Заметка не найдена
    </p>

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

    <ModalDefaultModal name="cancel-edit" @cancel="$modal.close()">
      <template #title>
        Отменить редактирование?
      </template>
      <template #description>
        Несохранённые изменения будут потеряны.
      </template>
      <template #actions>
        <UIButton type="secondary" @click="$modal.close()">
          Продолжить редактирование
        </UIButton>
        <UIButton type="danger-solid" @click="confirmCancel">
          Отменить изменения
        </UIButton>
      </template>
    </ModalDefaultModal>
  </div>
</template>

<style scoped lang="scss">
@use 'detail.scss';
</style>
