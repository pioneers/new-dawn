import { ReactNode } from 'react';
import './Modal.css';

/**
 * Generic modal component.
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.isActive - whether to display the modal
 * @param props.modalTitle - displayed title of the modal
 * @param props.className - additional className given to the modal content wrapper
 * @param props.isDarkMode - whether UI is in dark mode
 */
export default function Modal({
  onClose,
  isActive,
  modalTitle,
  children,
  className = '',
  isDarkMode,
}: {
  onClose: () => void;
  isActive: boolean;
  modalTitle: string;
  className?: string;
  children: ReactNode;
  isDarkMode: boolean;
}) {
  return (
    <div className={`Modal${isActive ? ' Modal-active' : ''}`}>
      <div className="Modal-title-bar">
        <span className="Modal-title">{modalTitle}</span>
        <button className="Modal-close-button" onClick={onClose} type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>
      </div>
      <div
        className={`Modal-content-${
          isDarkMode ? 'dark' : 'light'
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
/**
 * Default props for Modal.
 */
Modal.defaultProps = {
  /**
   * Doesn't give the modal content wrapper any additional classNames.
   */
  className: '',
};
