import DeviceInfoState, { DeviceTypes } from '../common/DeviceInfoState';
import './DeviceInfo.css';

/**
 * Component displaying information about input devices and peripherals connected to the robot.
 * @param props - props
 * @param props.deviceStates - an array of DeviceInfoState objects describing the state of all devices
 * connected to the robot. If empty, the robot is assumed to be disconnected (because the PDB should
 * always be there).
 */
export default function DeviceInfo({
  deviceStates,
}: {
  deviceStates: DeviceInfoState[];
}) {
  return (
    <div className="DeviceInfo">
      {deviceStates.length > 0 ? (
        deviceStates.map((device) => {
          const deviceTypeNum = Number(device.id.split('_')[0]);
          const deviceType =
            deviceTypeNum in DeviceTypes
              ? DeviceTypes[deviceTypeNum]
              : 'Unknown device';
          return (
            <div className="DeviceInfo-device" key={device.id}>
              <div className="DeviceInfo-device-id">{device.id}</div>
              <div className="DeviceInfo-device-type">{deviceType}</div>
              <div className="DeviceInfo-device-props-wrapper">
                <table className="DeviceInfo-device-props">
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
                              {String(value)}
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
        <div className="DeviceInfo-disconnected">
          Dawn is not connected to the robot.
        </div>
      )}
    </div>
  );
}
