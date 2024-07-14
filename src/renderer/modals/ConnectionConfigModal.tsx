import Modal from './Modal';
import { useState, ChangeEvent } from 'react';

/**
 * Modal component exposing info about the connection to the robot (IP address, port, etc.)
 */
export default function ConnectionInfoModal({
  onClose,
  isActive,
  onChange,
  IPAddress,
  SSHAddress,
  FieldIPAddress,
  FieldStationNum
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
          <input id="FieldIPAddress" onChange={onChange} value={FieldIPAddress} />
        </div>
        <div>
          Field Control Station Number: 
          <input id="FieldStationNum" onChange={onChange} value={FieldStationNum} />
        </div>
      </div>
    </Modal>
  );
}
