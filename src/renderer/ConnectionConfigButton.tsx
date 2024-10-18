import './ConnectionConfigButton.css';

/**
 * Button component that opens the ConnectionConfigModal.
 * @param props - props
 * @param props.onModalOpen - click handler for the button that opens the ConnectionConfigModal
 */
export default function ConnectionConfigButton({
  onModalOpen,
}: {
  onModalOpen: () => void;
}) {
  return (
    <div className="ConnectionConfigButton">
      <button
        className="ConnectionConfigButton-btn"
        type="button"
        onClick={onModalOpen}
      >
        Connection settings...
      </button>
    </div>
  );
}
