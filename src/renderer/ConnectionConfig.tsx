/**
 * Button component that opens the ConnectionConfigModal.
 * @param props
 * @param props.onModalOpen - click handler for the button that opens the ConnectionConfigModal
 */
export default function ConnectionConfig({
  onModalOpen,
}: {
  onModalOpen: () => void;
}): JSX.Element {
  return (
    <div className="ConnectionConfig">
      <button
        className="ConnectionConfig-button"
        type="button"
        onClick={onModalOpen}
      >
        Connection settings...
      </button>
    </div>
  );
}
