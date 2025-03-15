import { ChangeEvent } from 'react';
import Modal from './Modal';
import './ConnectionConfigModal.css';

/**
 * Names of fields in ConnectionConfigModal.
 */
export type ConfigName = 'IPAddress' | 'FieldIPAddress' | 'FieldStationNum';
/**
 * Event data for ConnectionConfigModal onChange handler.
 */
export interface ConnectionConfigChangeEvent {
  /**
   * The name of the field that was changed.
   */
  name: ConfigName;
  /**
   * The new value of the field.
   */
  value: string;
}

/**
 * Modal component exposing info about the connection to the robot (IP address, port, etc.)
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.isActive - whether to display the modal
 * @param props.IPAddress - displayed robot IP address
 * @param props.FieldIPAddress - displayed field IP address
 * @param props.FieldStationNum - displayed field station number
 * @param props.isDarkMode - whether UI is in dark mode
 */
export default function ConnectionConfigModal({
  onClose,
  isActive,
  onChange,
  IPAddress,
  FieldIPAddress,
  FieldStationNum,
  isDarkMode,
}: {
  onClose: () => void;
  /**
   * change handler for connection configuration
   * @param e - event describing the changed field and its new value
   */
  onChange: (e: ConnectionConfigChangeEvent) => void;
  isActive: boolean;
  IPAddress: string;
  FieldIPAddress: string;
  FieldStationNum: string;
  isDarkMode: boolean;
}) {
  const handleConfigChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name.replace(/^ConnectionConfigModal-/, '');
    onChange({
      name: name as ConfigName,
      value: e.target.value,
    });
  };
  return (
    <Modal
      modalTitle="Connection settings"
      onClose={onClose}
      isActive={isActive}
      className={`ConnectionConfigModal-content-${
        isDarkMode ? 'dark' : 'light'
      }`}
      isDarkMode={isDarkMode}
    >
      <label
        htmlFor="ConnectionConfigModal-IPAddress"
        className="ConnectionConfigModal-config-field"
      >
        Robot IP Address:
        <input
          name="ConnectionConfigModal-IPAddress"
          onChange={handleConfigChange}
          value={IPAddress}
          className={`ConnectionModalInput-${isDarkMode ? 'dark' : 'light'}`}
        />
      </label>
      <div className="ConnectionConfigModal-section">
        <div className="ConnectionConfigModal-section-header">
          Field Control Settings
        </div>
        <label
          htmlFor="ConnectionConfigModal-FieldIPAddress"
          className="ConnectionConfigModal-config-field"
        >
          Field Control IP Address:
          <input
            name="ConnectionConfigModal-FieldIPAddress"
            onChange={handleConfigChange}
            value={FieldIPAddress}
            className={`ConnectionModalInput-${isDarkMode ? 'dark' : 'light'}`}
          />
        </label>
        <label
          htmlFor="ConnectionConfigModal-FieldStationNum"
          className="ConnectionConfigModal-config-field"
        >
          Field Control Station Number:
          <input
            name="ConnectionConfigModal-FieldStationNum"
            onChange={handleConfigChange}
            value={FieldStationNum}
            className={`ConnectionModalInput-${isDarkMode ? 'dark' : 'light'}`}
          />
        </label>
      </div>
    </Modal>
  );
}
