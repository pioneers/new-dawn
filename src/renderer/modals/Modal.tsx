import { useSelector, useDispatch } from 'react-redux';
import { modalActions, Modals } from '../store/modalSlice';
import type { State } from '../store/store';
import './Modal.css';

/**
 * Generic modal component.
 */
export default function Modal({ modalType, modalTitle, children }) {
  const isActive = useSelector((state: State) => state.modal.activeModal === modalType);
  const dispatch = useDispatch();
  return (
    <div className={'Modal' + (isActive ? ' modal-active' : '')}>
      <div className="Modal-title-bar">
        <span className="Modal-title">
          {modalTitle}
        </span>
        <button className="Modal-close-button"
            onClick={() => dispatch(modalActions.setActive(Modals.None))}>
          X
        </button>
      </div>
      <div className="Modal-content">
        {children}
      </div>
    </div>
  );
}
