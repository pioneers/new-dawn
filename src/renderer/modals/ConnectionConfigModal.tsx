import Modal from './Modal';

/**
 * Modal component exposing info about the connection to the robot (IP address, port, etc.)
 */
export default function ConnectionInfoModal({
  onClose,
  isActive,
}: {
  onClose: () => void;
  isActive: boolean;
}) {
  return (
    <Modal modalTitle="Connection info" onClose={onClose} isActive={isActive}>
      Test
    </Modal>
  );
}
