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
      <p>
        Click{' '}
        <a
          href="https://github.com/pioneers/runtime/blob/master/docs/docs/api.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>{' '}
        for Dawn&apos;s runtime documentation!
      </p>
    </Modal>
  );
}
