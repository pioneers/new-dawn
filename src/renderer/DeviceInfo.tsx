import './DeviceInfo.css';

const DEVICE_TYPES = {
  0: 'Dummy device',
  1: 'Limit switch',
  2: 'Line follower',
  3: 'Battery buzzer',
  4: 'Servo controller',
  5: 'Polar bear motor controller',
  6: 'KoalaBear motor controller',
  7: 'Power distribution board',
  8: 'Distance sensor',
};

export interface Device {
  id: string;
  [string]: string;
}

/**
 * Component displaying information about input devices and peripherals connected to the robot.
 */
export default function DeviceInfo({
  deviceStates
}: {
  deviceStates: Device[];
}) {
  return (
    <div className="DeviceInfo">
      {
        deviceStates.length > 0 ? deviceStates.map((device) => {
          const deviceTypeNum = Number(device.id.split('_')[0]);
          const deviceType = deviceTypeNum in DEVICE_TYPES ? DEVICE_TYPES[deviceTypeNum] : 'Unknown device';
          return (
            <div className="DeviceInfo-device" key={device.id}>
              <div className="DeviceInfo-device-id">{device.id}</div>
              <div className="DeviceInfo-device-type">{deviceType}</div>
              <table className="DeviceInfo-device-props">
                <tbody>
                  {
                    Object.entries(device).map(([key, value]) => key !== 'id' && (
                      <tr className="DeviceInfo-device-prop" key={device.id + key}>
                        <td className="DeviceInfo-prop-key">{key}</td>
                        <td className="DeviceInfo-prop-value">{value}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          );
        }) : <div className="DeviceInfo-disconnected">Dawn is not connected to the robot.</div>
      }
    </div>
  );
}
