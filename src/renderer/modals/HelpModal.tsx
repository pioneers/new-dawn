import Modal from './Modal';

/**
 * Modal component displaying help for Dawn and the robot API.
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
    <Modal modalTitle="Help" onClose={onClose} isActive={isActive}>
      This is a very helpful message. So helpful, in fact, that it&apos;s too
      helpful to even write here. Its helpfulness would blind your eyes with its
      brilliance.
    </Modal>
  );
}
