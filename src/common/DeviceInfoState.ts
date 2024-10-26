/**
 * Numeric device types which appear before the underscore in device ids.
 */
export enum DeviceType {
  DUMMY = 0,
  LIMIT_SWITCH = 1,
  LINE_FOLLOWER = 2,
  BATTERY_BUZZER = 3,
  SERVO_CONTROLLER = 4,
  POLAR_BEAR = 5,
  KOALA_BEAR = 6,
  PDB = 7,
  DISTANCE_SENSOR = 8,
}

/**
 * Maps device types to user-friendly names.
 */
export const DeviceTypeNames: { [type: number]: string } = {
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
