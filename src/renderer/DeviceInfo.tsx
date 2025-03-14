import DeviceInfoState, { DeviceTypeNames } from '../common/DeviceInfoState';
import './DeviceInfo.css';

// helper function for making floats round to 4 digits after the decimal point
function roundNumber(value: string, decimalPlaces: number) {
  if (value === 'true' || value === 'false') {
    return value; // do nothing, value is just a boolean
  }

  const numberValue = parseFloat(value);
  const truncatedNumber = Math.trunc(numberValue * 10 ** 4) / 10 ** 4;
  return parseFloat(truncatedNumber.toFixed(decimalPlaces));
}

/**
 * Component displaying information about input devices and peripherals connected to the robot.
 * @param props - props
 * @param props.deviceStates - an array of DeviceInfoState objects describing the state of all devices
 * connected to the robot. If empty, the robot is assumed to be disconnected (because the PDB should
 * always be there).
 * @param props.isDarkMode - whether UI is in dark mode
 */
export default function DeviceInfo({
  deviceStates,
  isDarkMode,
}: {
  deviceStates: DeviceInfoState[];
  isDarkMode: boolean;
}) {
  return (
    <div className={`DeviceInfo-${isDarkMode ? 'dark' : 'light'}`}>
      {deviceStates.length > 0 ? (
        deviceStates.map((device) => {
          const deviceTypeNum = Number(device.id.split('_')[0]);
          const deviceType =
            deviceTypeNum in DeviceTypeNames
              ? DeviceTypeNames[deviceTypeNum]
              : 'Unknown device';
          return (
            <div className="DeviceInfo-device" key={device.id}>
              <div
                className={`DeviceInfo-device-id-${
                  isDarkMode ? 'dark' : 'light'
                }`}
              >
                {device.id}
              </div>
              <div
                className={`DeviceInfo-device-type-${
                  isDarkMode ? 'dark' : 'light'
                }`}
              >
                {deviceType}
              </div>
              <div className="DeviceInfo-device-props-wrapper">
                <table
                  className={`DeviceInfo-device-props-${
                    isDarkMode ? 'dark' : 'light'
                  }`}
                >
                  <tbody>
                    {Object.entries(device).map(
                      ([key, value]) =>
                        key !== 'id' && (
                          <tr
                            className="DeviceInfo-device-prop"
                            key={device.id + key}
                          >
                            <td className="DeviceInfo-prop-key">{key}</td>
                            <td className="DeviceInfo-prop-value">
                              {String(roundNumber(value, 4))}
                            </td>
                          </tr>
                        ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      ) : (
        <div
          className={`DeviceInfo-disconnected-${isDarkMode ? 'dark' : 'light'}`}
        >
          Dawn is not connected to the robot.
        </div>
      )}
    </div>
  );
}
