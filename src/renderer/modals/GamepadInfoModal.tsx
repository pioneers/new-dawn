import Modal from './Modal';

/**
 * Modal component displaying info about a connected gamepad.
 */
export default function GamepadInfoModal({ onClose, isActive}: {
  onClose: () => void;
  isActive: boolean
}) {
  return (
    <Modal modalTitle="Gamepad info" onClose={onClose} isActive={isActive}>
      Test
    </Modal>
  );
}
