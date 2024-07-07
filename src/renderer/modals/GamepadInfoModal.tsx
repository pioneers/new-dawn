import { Modals } from '../store/modalSlice';
import Modal from './Modal';

/**
 * Modal component displaying info about a connected gamepad.
 */
export default function GamepadInfoModal() {
  return (
    <Modal modalType={Modals.GamepadInfo} modalTitle="Gamepad info">
      Test
    </Modal>
  );
}
