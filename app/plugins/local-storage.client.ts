import type { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  const notesStore = useNotesStore(nuxtApp.$pinia as Pinia)

  const { loadNotes } = useLocalStorage()

  notesStore.notes = loadNotes()

  function saveDraftOnHide() {
    notesStore.flushDraft()
  }

  window.addEventListener('pagehide', saveDraftOnHide)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden')
      saveDraftOnHide()
  })
})
