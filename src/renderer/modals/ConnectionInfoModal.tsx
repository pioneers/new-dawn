import Modal from './Modal';
import { Modals } from '../store/modalSlice';

/**
 * Modal component exposing info about the connection to the robot (IP address, port, etc.)
 */
export default function ConnectionInfoModal() {
  return (
    <Modal modalType={Modals.ConnectionConfig} modalTitle="Connection info">
      Test
    </Modal>
  );
}
