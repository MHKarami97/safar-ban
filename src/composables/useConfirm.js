import { ref } from 'vue'

export function useConfirm() {
  var isPending = ref(false)
  var pendingAction = ref(null)
  var pendingLabel = ref('')

  function requestConfirm(label, action) {
    pendingLabel.value = label
    pendingAction.value = action
    isPending.value = true
  }

  function confirmAction() {
    if (pendingAction.value) pendingAction.value()
    cancelAction()
  }

  function cancelAction() {
    isPending.value = false
    pendingAction.value = null
    pendingLabel.value = ''
  }

  return { isPending, pendingLabel, requestConfirm, confirmAction, cancelAction }
}
