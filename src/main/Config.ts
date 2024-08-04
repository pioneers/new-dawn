/**
 * Describes persistent configuration for Dawn.
 */
export default interface Config {
  robotIPAddress: string;
  robotSSHAddress: string;
  fieldIPAddress: string;
  fieldStationNumber: string;
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
  return config as Config; // By now we're sure all the fields (and maybe some more) are set
}
