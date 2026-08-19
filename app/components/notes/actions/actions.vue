<script setup lang="ts">
import RedoIcon from '@/assets/icons/redo.svg'
import UndoIcon from '@/assets/icons/undo.svg'

const { canUndo = false, canRedo = false } = defineProps<{
  historyIndex?: number
  historyTotal?: number
  canUndo?: boolean
  canRedo?: boolean
}>()

defineEmits<{
  undo: []
  redo: []
  delete: []
  cancel: []
  save: []
}>()
</script>

<template>
  <div class="notes-actions">
    <div class="notes-actions__wrapper">
      <UIButton type="secondary" size="sm" :disabled="!canUndo" @click="$emit('undo')">
        <template #icon>
          <UndoIcon />
        </template>
        Отменить
      </UIButton>
      <UIButton type="secondary" size="sm" :disabled="!canRedo" @click="$emit('redo')">
        <template #icon>
          <RedoIcon />
        </template>
        Повторить
      </UIButton>
      <span v-if="historyTotal" class="notes-actions__history">{{ historyIndex }} / {{ historyTotal }}</span>
    </div>
    <div class="notes-actions__wrapper">
      <UIButton type="danger" size="sm" @click="$emit('delete')">
        Удалить
      </UIButton>
      <UIButton type="secondary" size="sm" @click="$emit('cancel')">
        Отменить
      </UIButton>
      <UIButton type="primary" size="sm" @click="$emit('save')">
        Сохранить
      </UIButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'actions.scss';
</style>
