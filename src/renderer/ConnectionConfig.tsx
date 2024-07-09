/**
 * Button component that opens the ConnectionConfigModal.
 */
export default function ConnectionConfig({
  onModalOpen,
}: {
  onModalOpen: () => void;
}) {
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
