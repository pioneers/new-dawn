import Modal from './Modal';
/**
 * Modal component displaying help for Dawn and the robot API.
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.isActive - whether to display the modal
 */
export default function HelpModal({
  onClose,
  isActive,
}: {
  onClose: () => void;
  isActive: boolean;
}) {
  return (
    <Modal modalTitle="Help" onClose={onClose} isActive={isActive}>
      {Object.entries(apiHelpComponents).toSorted().map([k, v]) => (
        <h1 className="docTitle">{k}</h1>
        {v({ onShowHelpModal: () => {} })}
      )}
    </Modal>
  );
}
