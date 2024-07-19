import Modal from './Modal';

/**
 * Modal component displaying info about a connected gamepad.
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.isActive - whether to display the modal
 */
export default function GamepadInfoModal({
  onClose,
  isActive,
}: {
  onClose: () => void;
  isActive: boolean;
}) {
  return (
    <Modal modalTitle="Gamepad info" onClose={onClose} isActive={isActive}>
      Test
    </Modal>
  );
}
