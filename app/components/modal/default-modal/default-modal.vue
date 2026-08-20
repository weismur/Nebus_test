<script setup lang="ts">
const { name } = defineProps<{
  name: string
}>()

defineEmits<{
  show: []
  close: []
}>()
</script>

<template>
  <Modal
    :name="name"
    with-close
    @show="$emit('show')"
    @close="$emit('close')"
  >
    <div class="default-modal">
      <h2 v-if="$slots.title" class="default-modal__title">
        <slot name="title" />
      </h2>

      <div v-if="$slots.description" class="default-modal__description">
        <slot name="description" />
      </div>

      <div v-if="$slots.actions" class="default-modal__actions">
        <slot name="actions" />
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@use 'default-modal.scss';
</style>
