import { ChangeEvent } from 'react';
import Modal from './Modal';
import './ConnectionConfigModal.css';

/**
 * Modal component exposing info about the connection to the robot (IP address, port, etc.)
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.isActive - whether to display the modal
 * @param props.onChange - change handler used for all connection info input elements. Possible ids
 * of event targets are 'IPAddress', 'SSHAddress', 'FieldIPAddress', and 'FieldStationNum'.
 * @param props.IPAddress - displayed robot IP address
 * @param props.SSHAddress - displayed robot SSH address
 * @param props.FieldIPAddress - displayed field IP address
 * @param props.FieldStationNum - displayed field station number
 */
export default function ConnectionConfigModal({
  onClose,
  isActive,
  onChange,
  IPAddress,
  SSHAddress,
  FieldIPAddress,
  FieldStationNum,
}: {
  onClose: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isActive: boolean;
  IPAddress: string;
  SSHAddress: string;
  FieldIPAddress: string;
  FieldStationNum: string;
}) {
  return (
    <Modal
      modalTitle="Connection settings"
      onClose={onClose}
      isActive={isActive}
      className="ConnectionConfigModal-content"
    >
      <label htmlFor="IPAddress" className="ConnectionConfigModal-config-field">
        IP Address:
        <input name="IPAddress" onChange={onChange} value={IPAddress} />
      </label>
      <label
        htmlFor="SSHAddress"
        className="ConnectionConfigModal-config-field"
      >
        SSH Address:
        <input name="SSHAddress" onChange={onChange} value={SSHAddress} />
      </label>
      <div className="ConnectionConfigModal-section">
        <div className="ConnectionConfigModal-section-header">
          Field Control Settings
        </div>
        <label
          htmlFor="FieldIPAddress"
          className="ConnectionConfigModal-config-field"
        >
          Field Control IP Address:
          <input
            name="FieldIPAddress"
            onChange={onChange}
            value={FieldIPAddress}
          />
        </label>
        <label
          htmlFor="FieldStationNum"
          className="ConnectionConfigModal-config-field"
        >
          Field Control Station Number:
          <input
            name="FieldStationNum"
            onChange={onChange}
            value={FieldStationNum}
          />
        </label>
      </div>
    </Modal>
  );
}
