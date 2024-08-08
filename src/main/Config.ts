/**
 * Describes persistent configuration for Dawn.
 */
export default interface Config {
  /**
   * The IP address used to communicate with the robot's runtime.
   */
  robotIPAddress: string;
  /**
   * The IP address used to upload code to the robot.
   */
  robotSSHAddress: string;
  /**
   * The IP address of the field controller.
   */
  fieldIPAddress: string;
  /**
   * The field station number to connect to.
   */
  fieldStationNumber: string;
  /**
   * Whether the user should be warned when uploading code with unsaved changes in the editor (since
   * these won't be uploaded).
   */
  showDirtyUploadWarning: boolean;
}

/**
 * Converts a template value to a Config by populating missing properties on a shallow copy of the
 * template with defaults. If the template is not an object, returns a default Config. Non-Config
 * properties on the template are preserved.
 * @param template - the value to use as a template for the returned Config
 * @returns A Config first populated by properties in the template, then by defaults for any missing
 * properties.
 */
export function coerceToConfig(template: unknown): Config {
  let config: Partial<Config>;
  if (typeof template !== 'object' || !template) {
    config = {};
  } else {
    // Don't mutate argument
    config = { ...template };
  }
  if (
    !('robotIPAddress' in config) ||
    typeof config.robotIPAddress !== 'string'
  ) {
    config.robotIPAddress = '192.168.0.100';
  }
  if (
    !('robotSSHAddress' in config) ||
    typeof config.robotSSHAddress !== 'string'
  ) {
    config.robotSSHAddress = '192.168.0.100';
  }
  if (
    !('fieldIPAddress' in config) ||
    typeof config.fieldIPAddress !== 'string'
  ) {
    config.fieldIPAddress = 'localhost';
  }
  if (
    !('fieldStationNumber' in config) ||
    typeof config.fieldStationNumber !== 'string'
  ) {
    config.fieldStationNumber = '4';
  }
  if (
    !('showDirtyUploadWarning' in config) ||
    typeof config.showDirtyUploadWarning !== 'boolean'
  ) {
    config.showDirtyUploadWarning = true;
  }
  // By now we're sure all the required fields are set (and really typescript should be too, so I
  // don't really understand why a cast is needed here)
  return config as Config;
}
