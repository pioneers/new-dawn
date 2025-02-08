import Modal from './Modal';

/**
 * Modal component displaying help for Dawn and the robot API.
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
      modalTitle="Help"
      onClose={onClose}
      isActive={isActive}
      isDarkMode={isDarkMode}
    >
      This is a very helpful message. So helpful, in fact, that it&apos;s too
      helpful to even write here. Its helpfulness would blind your eyes with its
      brilliance.
    </Modal>
  );
}
