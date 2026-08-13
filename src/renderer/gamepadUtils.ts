const STANDARD_GAMEPAD_MAPPING = 'standard';

const isConnectedGamepad = (gamepad: Gamepad | null): gamepad is Gamepad =>
  gamepad !== null && gamepad.connected;

const hasValidControls = (gamepad: Gamepad) =>
  gamepad.buttons.length > 0 || gamepad.axes.length > 0;

const supportsMapping = (gamepad: Gamepad, allowNonStandardMappings: boolean) =>
  gamepad.mapping === STANDARD_GAMEPAD_MAPPING ||
  (allowNonStandardMappings && hasValidControls(gamepad));

const choosePreferredGamepad = (a: Gamepad, b: Gamepad) => {
  if (a.mapping === STANDARD_GAMEPAD_MAPPING) {
    return a;
  }
  if (b.mapping === STANDARD_GAMEPAD_MAPPING) {
    return b;
  }
  return a;
};

export default function getConnectedGamepads(allowNonStandardMappings = false) {
  const connectedByIndex = new Map<number, Gamepad>();

  navigator
    .getGamepads()
    .filter(isConnectedGamepad)
    .filter((gamepad) => supportsMapping(gamepad, allowNonStandardMappings))
    .forEach((gamepad) => {
      const existing = connectedByIndex.get(gamepad.index);
      if (!existing) {
        connectedByIndex.set(gamepad.index, gamepad);
        return;
      }
      connectedByIndex.set(
        gamepad.index,
        choosePreferredGamepad(existing, gamepad),
      );
    });

  return [...connectedByIndex.values()].sort((a, b) => a.index - b.index);
}
