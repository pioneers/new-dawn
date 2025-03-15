import Modal from './Modal';

/**
 * Modal component displaying info about a connected gamepad.
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.isActive - whether to display the modal
 * @param props.isDarkMode - whether UI is in dark mode
 */
export default function GamepadInfoModal({
  onClose,
  isActive,
  isDarkMode,
}: {
  onClose: () => void;
  isActive: boolean;
  isDarkMode: boolean;
}) {
  return (
    <Modal
      modalTitle="Gamepad info"
      onClose={onClose}
      isActive={isActive}
      isDarkMode={isDarkMode}
    >
      Test
    </Modal>
  );
}
