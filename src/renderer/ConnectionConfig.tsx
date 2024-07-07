import { useDispatch } from 'react-redux';
import { modalActions, Modals } from './store/modalSlice';

/**
 * Button component that opens the ConnectionConfigModal.
 */
export default function ConnectionConfig() {
  const dispatch = useDispatch();
  return (
    <div className="ConnectionConfig">
      <button className="ConnectionConfig-button"
          onClick={() => dispatch(modalActions.setActive(Modals.ConnectionConfig))}>
        Connection settings...
      </button>
    </div>
  );
}
