/**
 * Numeric device types which appear before the underscore in device ids.
 */
export enum DeviceType {
  /**
   * Dummy device type.
   */
  DUMMY = 0,
  /**
   * Limit switch device type.
   */
  LIMIT_SWITCH = 1,
  /**
   * Line follower device type.
   */
  LINE_FOLLOWER = 2,
  /**
   * Battery buzzer device type. Not used anymore?
   */
  BATTERY_BUZZER = 3,
  /**
   * Servo controller device type.
   */
  SERVO_CONTROLLER = 4,
  /**
   * PolarBear device type. Not distributed with new kits.
   */
  POLAR_BEAR = 5,
  /**
   * KoalaBear device type.
   */
  KOALA_BEAR = 6,
  /**
   * Power distribution board device type.
   */
  PDB = 7,
  /**
   * Distance sensor device type.
   */
  DISTANCE_SENSOR = 8,
  /**
   * Stopwatch ("custom data" that tracks duration of connection in ms) device type.
   */
  STOPWATCH = 32,
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
  32: 'Stopwatch',
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
