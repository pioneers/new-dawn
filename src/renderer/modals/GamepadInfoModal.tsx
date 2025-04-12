import { useEffect, useState } from 'react';
import Modal from './Modal';
import LogitechGamepadSvgr from '../../../assets/logitech-gamepad.svg?svgr';
import './GamepadInfoModal.css';

const BUTTON_ORDER: string[] = [
  'button_a',
  'button_b',
  'button_x',
  'button_y',
  'l_bumper',
  'r_bumper',
  'l_trigger',
  'r_trigger',
  'button_back',
  'button_start',
  'l_stick',
  'r_stick',
  'dpad_up',
  'dpad_down',
  'dpad_left',
  'dpad_right',
  'button_xbox',
];
const AXIS_ORDER: string[] = [
  'joystick_left_x',
  'joystick_left_y',
  'joystick_right_x',
  'joystick_right_y',
];
const CONTROL_NAMES: {[string]: string | [string]} = {
  'a-button': 'button_a',
  'b-button': 'button_b',
  'x-button': 'button_x',
  'y-button': 'button_y',
  dpad: ['dpad_down', 'dpad_up', 'dpad_left', 'dpad_right'],
  'right-bumper': 'r_bumper',
  'right-trigger': 'r_trigger',
  'left-bumper': 'l_bumper',
  'left-trigger': 'l_trigger',
  'back-button': 'button_back',
  'start-button': 'button_start',
  'brand-button': 'button_xbox',
  'left-joystick': ['l_stick', 'joystick_left_x', 'joystick_left_y'],
  'right-joystick': ['r_stick', 'joystick_right_x', 'joystick_right_y'],
};
const GAMEPAD_UPDATE_PERIOD_MS = 50;
const PREFIX = 'logitech-gamepad_svg__';
const AXIS_THRESHOLD = 0.25;
const DATA_PER_ROW = 7;
const GAMEPAD_AXIS_DECIMALS = 6;

/**
 * Modal component displaying info about a connected gamepad.
 * @param props - props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.isActive - whether to display the modal
 * @param props.isDarkMode - whether UI is in dark mode
 */
export default function GamepadInfoModal({
  onClose,
  isActive,
  isDarkMode,
}: {
  onClose: () => void;
  isActive: boolean;
  isDarkMode: boolean;
}) {
  const createEmptyBtnArray = () => BUTTON_ORDER.map((btn) => [btn, false]);
  const [buttons, setButtons] = useState(createEmptyBtnArray);
  const [hoverControl, setHoverControl] = useState('');
  const [axes, setAxes] = useState([0, 0, 0, 0]);
  const classes = ['logitech-gamepad_svg']
    .concat(buttons.filter((x) => x[1]).map((x) => `active-${x[0]}`))
    .concat(
      axes
        .map((x) => (Math.abs(x) > AXIS_THRESHOLD ? Math.sign(x) : 0))
        .map((x, i) =>
          x === 0
            ? null
            : `${x === -1 ? 'negative' : 'positive'}-${AXIS_ORDER[i]}`,
        )
        .filter((x) => x),
    )
    .join(' ');
  const data = buttons.concat(axes.map((x, i) => [AXIS_ORDER[i], x]));
  const rows = [];
  for (let i = 0; i < data.length; i += DATA_PER_ROW) {
    rows.push(data.slice(i, i + DATA_PER_ROW));
  }

  const onMouseEnter = ({ target }) => {
    const unprefixed = target.id.slice(PREFIX.length);
    if (unprefixed in CONTROL_NAMES) {
      setHoverControl(unprefixed);
    }
  };
  const onMouseLeave = ({ target }) => {
    if (target.id.slice(PREFIX.length)) {
      setHoverControl('');
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const inputs = navigator
        .getGamepads()
        .filter(
          (gp): gp is Gamepad => gp !== null && gp.mapping === 'standard',
        );
      if (inputs.length) {
        setButtons(
          inputs[0].buttons.map((button, i) => [
            BUTTON_ORDER[i],
            button.pressed,
          ]),
        );
        setAxes(inputs[0].axes.slice());
      } else {
        setButtons(createEmptyBtnArray());
        setAxes([0, 0, 0, 0]);
      }
    }, GAMEPAD_UPDATE_PERIOD_MS);
    return () => clearInterval(interval);
  });
  return (
    <Modal
      modalTitle="Gamepad info"
      onClose={onClose}
      isActive={isActive}
      isDarkMode={isDarkMode}
    >
      <LogitechGamepadSvgr
        width="100%"
        height="500px"
        className={classes}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      <table className="GamepadInfoModal-data">
        <tbody>
          {rows.map((row) => (
            <tr key={row.map((x) => x[0]).join(' ')}>
              {row.map((datum: [string, boolean | number]) => {
                const pow = Math.pow(10, GAMEPAD_AXIS_DECIMALS);
                const val = typeof datum[1] === 'number'
                  ? String(Math.round(datum[1] * pow) / pow).padEnd(GAMEPAD_AXIS_DECIMALS, '0')
                  : String(datum[1])[0].toUpperCase() + String(datum[1]).slice(1);
                return (
                  <td
                    key={datum[0]}
                    className={
                      CONTROL_NAMES[hoverControl] === datum[0] ||
                      CONTROL_NAMES[hoverControl]?.includes?.(datum[0])
                        ? 'GamepadInfoModal-datum-hovered'
                        : ''
                    }
                  >
                    {datum[0]}: {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
