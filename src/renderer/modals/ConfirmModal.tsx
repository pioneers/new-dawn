import Modal from './Modal';

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
