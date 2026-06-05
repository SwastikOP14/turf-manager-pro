import { useEffect } from "react"
import { registerModal } from "./useBackButton"

/**
 * Call this inside any modal/dialog component.
 * When the Android back button is pressed while this modal is open,
 * onClose() will be called instead of navigating back.
 * Pass null to skip registration (e.g. when modal is closed).
 *
 * @param {Function|null} onClose - the function to call to close the modal
 */
export function useModalBackHandler(onClose) {
  useEffect(() => {
    if (!onClose) return
    const unregister = registerModal(onClose)
    return unregister
  }, [onClose])
}
