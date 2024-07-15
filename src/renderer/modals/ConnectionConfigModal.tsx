import { ChangeEvent } from 'react';
import Modal from './Modal';

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
export default function ConnectionInfoModal({
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
    <Modal modalTitle="Connection info" onClose={onClose} isActive={isActive}>
      <div>
        IP Address:
        <input id="IPAddress" onChange={onChange} value={IPAddress} />
      </div>
      <div>
        SSH Address:
        <input id="SSHAddress" onChange={onChange} value={SSHAddress} />
      </div>
      <div>
        Field Control Settings
        <div>
          Field Control IP Address:
          <input
            id="FieldIPAddress"
            onChange={onChange}
            value={FieldIPAddress}
          />
        </div>
        <div>
          Field Control Station Number:
          <input
            id="FieldStationNum"
            onChange={onChange}
            value={FieldStationNum}
          />
        </div>
      </div>
    </Modal>
  );
}
