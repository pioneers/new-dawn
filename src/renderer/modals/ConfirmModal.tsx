import Modal from './Modal';

/**
 * Generic confirmation modal component.
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.onConfirm - handler called when the confirm button is clicked
 * @param props.isActive - whether to display the modal
 * @param props.queryText - question text in the modal
 * @param props.modalTitle - displayed title of the modal
 * @param props.noAutoClose - whether the modal should not call onClose after confirmation
 */
export default function ConfirmModal({
  onClose,
  onConfirm,
  isActive,
  queryText,
  modalTitle,
  noAutoClose = false,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isActive: boolean;
  queryText: string;
  modalTitle: string;
  noAutoClose?: boolean;
}) {
  const handleConfirm = () => {
    onConfirm();
    if (!noAutoClose) {
      onClose();
    }
  };
  return (
    <Modal modalTitle={modalTitle} onClose={onClose} isActive={isActive}>
      <p>{queryText}</p>
      <button type="button" onClick={handleConfirm}>
        Confirm
      </button>
    </Modal>
  );
}
// Not sure why we need this if we have the default deconstruction parameter but the linter cries if
// we leave it out
ConfirmModal.defaultProps = {
  noAutoClose: false,
};
