/**
 * Maps device types to user-friendly names.
 */
export const DeviceTypes: { [type: number]: string } = {
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

/**
 * Represents one lowcar device and its reported data.
 */
export default interface DeviceInfoState {
  /**
   * The device id: the device type and uid separated by an underscore.
   */
  id: string;
  /**
   * Human-presentable data reported by the device, by the keys used by Robot.get_value.
   */
  [key: string]: string;
}
