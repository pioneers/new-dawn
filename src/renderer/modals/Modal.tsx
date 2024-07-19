import { ReactNode } from 'react';
import './Modal.css';

/**
 * Generic modal component.
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.isActive - whether to display the modal
 * @param props.modalTitle - displayed title of the modal
 */
export default function Modal({
  onClose,
  isActive,
  modalTitle,
  children,
}: {
  onClose: () => void;
  isActive: boolean;
  modalTitle: string;
  children: ReactNode;
}) {
  return (
    <div className={`Modal${isActive ? ' modal-active' : ''}`}>
      <div className="Modal-title-bar">
        <span className="Modal-title">{modalTitle}</span>
        <button className="Modal-close-button" onClick={onClose} type="button">
          X
        </button>
      </div>
      <div className="Modal-content">{children}</div>
    </div>
  );
}
