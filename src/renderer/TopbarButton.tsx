import './TopbarButton.css';

/**
 * Image button component in the Topbar that opens a modal.
 * @param props - props
 * @param props.onModalOpen - click handler for the button that opens the ConnectionConfigModal
 * @param props.src - source of the image
 * @param props.alt - string to use as the image alt text and button hover text
 * @param props.isDarkMode - whether UI is in dark mode
 */
export default function TopbarButton({
  onModalOpen,
  src,
  alt,
  isDarkMode,
}: {
  onModalOpen: () => void;
  src: string;
  alt: string;
  isDarkMode: boolean;
}) {
  return (
    <div className={`TopbarButton-${isDarkMode ? 'dark' : 'light'}`}>
      <button type="button" onClick={onModalOpen} title={alt}>
        <img src={src} alt={alt} />
      </button>
    </div>
  );
}
