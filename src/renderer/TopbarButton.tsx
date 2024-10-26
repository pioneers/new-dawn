import './TopbarButton.css';

/**
 * Image button component in the Topbar that opens a modal.
 * @param props - props
 * @param props.onModalOpen - click handler for the button that opens the ConnectionConfigModal
 * @param props.src - source of the image
 * @param props.alt - string to use as the image alt text and button hover text
 */
export default function TopbarButton({
  onModalOpen,
  src,
  alt,
}: {
  onModalOpen: () => void;
  src: string;
  alt: string;
}) {
  return (
    <div className="TopbarButton">
      <button type="button" onClick={onModalOpen} title={alt}>
        <img src={src} alt={alt} />
      </button>
    </div>
  );
}
