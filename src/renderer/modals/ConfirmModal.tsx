import { ReactNode } from 'react';
import Modal from './Modal';
import './ConfirmModal.css';

/**
 * Generic confirmation modal component.
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.onConfirm - handler called when the confirm button is clicked
 * @param props.isActive - whether to display the modal
 * @param props.modalTitle - displayed title of the modal
 * @param props.noAutoClose - whether the modal should not call onClose after confirmation
 */
export default function ConfirmModal({
  onClose,
  onConfirm,
  isActive,
  modalTitle,
  noAutoClose = false,
  children,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isActive: boolean;
  modalTitle: string;
  noAutoClose?: boolean;
  children: ReactNode;
}) {
  const handleConfirm = () => {
    onConfirm();
    if (!noAutoClose) {
      onClose();
    }
  };
  return (
    <Modal modalTitle={modalTitle} onClose={onClose} isActive={isActive}>
      <div className="ConfirmModal-content">{children}</div>
      <button
        className="ConfirmModal-confirm-btn"
        type="button"
        onClick={handleConfirm}
      >
        Confirm
      </button>
    </Modal>
  );
}
/**
 * Default properties for ConfirmModal.
 */
ConfirmModal.defaultProps = {
  /**
   * Disables the implied close behavior after confirmation.
   */
  noAutoClose: false,
};
