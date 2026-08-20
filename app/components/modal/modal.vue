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

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function closeModal() {
  if (withClose)
    $modal.close()
}

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !wrapperRef.value)
    return

  const focusable = Array.from(wrapperRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
  const first = focusable[0]
  const last = focusable.at(-1)
  const active = document.activeElement

  if (!first || !last)
    return

  if (event.shiftKey) {
    if (active === first || active === wrapperRef.value) {
      event.preventDefault()
      last.focus()
    }
  }
  else if (active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(isOpen, (value) => {
  if (value) {
    emit('show')
    lastFocused = document.activeElement as HTMLElement
    nextTick(() => wrapperRef.value?.focus())
    document.addEventListener('keydown', trapFocus, true)
  }
  else {
    emit('close')
    lastFocused?.focus()
    document.removeEventListener('keydown', trapFocus, true)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', trapFocus, true)
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
