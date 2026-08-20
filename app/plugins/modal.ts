import { clearBodyLocks, lock, unlock } from 'tua-body-scroll-lock'

interface ModalParams {
  isBlockESC?: boolean
  [key: string]: unknown
}

export default defineNuxtPlugin(() => {
  const current = reactive({
    name: '',
    params: {} as ModalParams,
  })

  function closeModal() {
    unlock()
    document.removeEventListener('keydown', handleKeyDown)
    current.name = ''
    current.params = {}
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape')
      closeModal()
  }

  const modal = {
    active() {
      return current.name
    },
    getParams() {
      return current.params
    },
    show(name: string, params: ModalParams = {}) {
      current.name = name
      current.params = { isBlockESC: false, ...params }

      lock()

      if (!current.params.isBlockESC)
        document.addEventListener('keydown', handleKeyDown)
    },
    accept() {
      closeModal()
    },
    cancel() {
      closeModal()
    },
    close() {
      closeModal()
    },
  }

  return {
    provide: { modal },
  }
})

if (import.meta.hot) {
  import.meta.hot.dispose(() => clearBodyLocks())
}
