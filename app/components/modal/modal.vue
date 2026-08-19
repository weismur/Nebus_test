<script setup lang="ts">
import CloseIcon from '@/assets/icons/close.svg'

const { withClose = false, name } = defineProps<{
  name: string
  withClose?: boolean
}>()

const emit = defineEmits<{
  show: []
  close: []
}>()

const { $modal } = useNuxtApp()

const isOpen = computed(() => $modal.active() === name)

const wrapperRef = ref<HTMLElement>()
let lastFocused: HTMLElement | null = null

function closeModal() {
  if (withClose)
    $modal.close()
}

watch(isOpen, (value) => {
  if (value) {
    emit('show')
    lastFocused = document.activeElement as HTMLElement
    nextTick(() => wrapperRef.value?.focus())
  }
  else {
    emit('close')
    lastFocused?.focus()
  }
})
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal">
      <div class="modal__overlay" @click="closeModal" />
      <div
        ref="wrapperRef"
        class="modal__wrapper"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
      >
        <button
          v-if="withClose"
          type="button"
          class="modal__close"
          @click="closeModal"
        >
          <CloseIcon class="modal__close-icon" />
          <span class="visually-hidden">Закрыть модалку</span>
        </button>
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use 'modal.scss';
</style>
