import { ChangeEvent, useState } from 'react';
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
  const [isFieldSettingsExpanded, setIsFieldSettingsExpanded] = useState(false);

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          width="24"
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{ verticalAlign: 'middle', marginRight: '8px' }}
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
        </svg>
        Robot IP Address
        <input
          name="ConnectionConfigModal-IPAddress"
          onChange={handleConfigChange}
          value={IPAddress}
          className={`ConnectionModalInput-${isDarkMode ? 'dark' : 'light'}`}
        />
      </label>
      <div className="ConnectionConfigModal-section">
        <button
          type="button"
          className="ConnectionConfigModal-section-header"
          onClick={() => setIsFieldSettingsExpanded(!isFieldSettingsExpanded)}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            border: 'none',
            background: 'none',
            padding: '8px 0',
            color: 'inherit',
            textAlign: 'left',
          }}
          aria-expanded={isFieldSettingsExpanded}
          aria-controls="field-settings-content"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              fontSize: '16px',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              width="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
              aria-hidden="true"
            >
              <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
            </svg>
            Field Control Settings
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            width="24"
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{
              transform: isFieldSettingsExpanded
                ? 'rotate(180deg)'
                : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
            aria-hidden="true"
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </button>
        <div
          id="field-settings-content"
          style={{
            maxHeight: isFieldSettingsExpanded ? '500px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out',
          }}
        >
          <label
            htmlFor="ConnectionConfigModal-FieldIPAddress"
            className="ConnectionConfigModal-config-field"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              width="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
            >
              <path d="M15.9 5c-.17 0-.32.09-.41.23l-.07.15-5.18 11.65c-.16.29-.26.61-.26.96 0 1.11.9 2.01 2.01 2.01.96 0 1.77-.68 1.96-1.59l.01-.03L16.4 5.5c0-.28-.22-.5-.5-.5zM1 9l2 2c2.88-2.88 6.79-4.08 10.53-3.62l1.19-2.68C9.89 3.84 4.74 5.27 1 9zm20 2l2-2c-1.64-1.64-3.55-2.82-5.59-3.57l-.53 2.82c1.5.62 2.9 1.53 4.12 2.75zm-4 4l2-2c-.8-.8-1.7-1.42-2.66-1.89l-.55 2.92c.42.27.83.59 1.21.97zM5 13l2 2c1.13-1.13 2.56-1.79 4.03-2l1.28-2.88c-2.63-.08-5.3.87-7.31 2.88z" />
            </svg>
            IP Address
            <input
              name="ConnectionConfigModal-FieldIPAddress"
              onChange={handleConfigChange}
              value={FieldIPAddress}
              className={`ConnectionModalInput-${
                isDarkMode ? 'dark' : 'light'
              }`}
            />
          </label>
          <label
            htmlFor="ConnectionConfigModal-FieldStationNum"
            className="ConnectionConfigModal-config-field"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              width="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
            </svg>
            Station Number
            <input
              name="ConnectionConfigModal-FieldStationNum"
              onChange={handleConfigChange}
              value={FieldStationNum}
              className={`ConnectionModalInput-${
                isDarkMode ? 'dark' : 'light'
              }`}
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}
