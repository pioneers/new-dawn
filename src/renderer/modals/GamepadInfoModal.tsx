import { useEffect, useState, MouseEvent } from 'react';
import Modal from './Modal';
// ignore the type error for the svgr component
// @ts-ignore
import LogitechGamepadSvgr from '../../../assets/logitech-gamepad.svg?svgr';
import './GamepadInfoModal.css';

const BUTTON_ORDER = [
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
] as const;

const AXIS_ORDER = [
  'joystick_left_x',
  'joystick_left_y',
  'joystick_right_x',
  'joystick_right_y',
] as const;

const CONTROL_NAMES = {
  'a-button': 'button_a',
  'b-button': 'button_b',
  'x-button': 'button_x',
  'y-button': 'button_y',
  'dpad-up': 'dpad_up',
  'dpad-down': 'dpad_down',
  'dpad-left': 'dpad_left',
  'dpad-right': 'dpad_right',
  'right-bumper': 'r_bumper',
  'right-trigger': 'r_trigger',
  'left-bumper': 'l_bumper',
  'left-trigger': 'l_trigger',
  'back-button': 'button_back',
  'start-button': 'button_start',
  'brand-button': 'button_xbox',
  'left-joystick': ['l_stick', 'joystick_left_x', 'joystick_left_y'],
  'right-joystick': ['r_stick', 'joystick_right_x', 'joystick_right_y'],
} as const;

type ControlName = keyof typeof CONTROL_NAMES;
type DataItem = [string, boolean | number];

const GAMEPAD_UPDATE_PERIOD_MS = 50;
const PREFIX = 'logitech-gamepad_svg__';
const AXIS_THRESHOLD = 0.25;

interface ControlSection {
  title: string;
  controls: DataItem[];
  gridColumn?: string;
}

const formatValue = (value: number | boolean) => {
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }
  // Always show sign and pad to 3 decimal places
  return (value >= 0 ? '+' : '') + value.toFixed(3);
};

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
  const createEmptyBtnArray = () =>
    BUTTON_ORDER.map((btn) => [btn, false] as [string, boolean]);
  const [buttons, setButtons] = useState(createEmptyBtnArray);
  const [hoverControl, setHoverControl] = useState<ControlName | ''>('');
  const [axes, setAxes] = useState([0, 0, 0, 0]);

  const classes = ['logitech-gamepad_svg']
    .concat(buttons.filter((x) => x[1]).map((x) => `active-${x[0]}`))
    .concat(
      axes
        .map((x) => (Math.abs(x) > AXIS_THRESHOLD ? Math.sign(x) : 0))
        .map((x, i) =>
          x === 0
            ? ''
            : `${x === -1 ? 'negative' : 'positive'}-${AXIS_ORDER[i]}`,
        )
        .filter(Boolean),
    )
    .join(' ');

  const buttonData = buttons as DataItem[];
  const axesData = axes.map((x, i) => [AXIS_ORDER[i], x] as DataItem);

  // Organize controls by type
  const sections: ControlSection[] = [
    {
      title: 'Face Buttons',
      controls: buttonData.filter(([name]) =>
        ['button_a', 'button_b', 'button_x', 'button_y'].includes(name),
      ),
    },
    {
      title: 'D-Pad',
      controls: buttonData.filter(([name]) => name.startsWith('dpad_')),
    },
    {
      title: 'Shoulder & Triggers',
      controls: buttonData.filter(([name]) =>
        ['l_bumper', 'r_bumper', 'l_trigger', 'r_trigger'].includes(name),
      ),
    },
    {
      title: 'System Buttons',
      controls: buttonData.filter(([name]) =>
        ['button_back', 'button_start', 'button_xbox'].includes(name),
      ),
    },
    {
      title: 'Left Stick',
      controls: [
        ...buttonData.filter(([name]) => name === 'l_stick'),
        ...axesData.filter(([name]) => name.includes('left')),
      ],
    },
    {
      title: 'Right Stick',
      controls: [
        ...buttonData.filter(([name]) => name === 'r_stick'),
        ...axesData.filter(([name]) => name.includes('right')),
      ],
    },
  ];

  const onMouseEnter = ({ target }: MouseEvent<SVGElement>) => {
    const element = target as SVGElement;
    const unprefixed = element.id.slice(PREFIX.length) as ControlName;
    if (unprefixed in CONTROL_NAMES) {
      setHoverControl(unprefixed);
    }
  };

  const onMouseLeave = ({ target }: MouseEvent<SVGElement>) => {
    const element = target as SVGElement;
    if (element.id.slice(PREFIX.length)) {
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
      modalTitle="Gamepad Info"
      onClose={onClose}
      isActive={isActive}
      isDarkMode={isDarkMode}
    >
      <div className="GamepadInfoModal-content">
        <LogitechGamepadSvgr
          width="100%"
          height="500px"
          className={classes}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
        <div className="GamepadInfoModal-data">
          {sections.map((section) => (
            <div
              key={section.title}
              className="GamepadInfoModal-section"
              style={
                section.gridColumn
                  ? { gridColumn: section.gridColumn }
                  : undefined
              }
            >
              <h3>{section.title}</h3>
              <table>
                <tbody>
                  {section.controls.map((datum) => {
                    const controlValue =
                      CONTROL_NAMES[hoverControl as ControlName];
                    const isHovered =
                      (typeof controlValue === 'string' &&
                        controlValue === datum[0]) ||
                      (Array.isArray(controlValue) &&
                        controlValue.includes(datum[0]));

                    return (
                      <tr key={datum[0]}>
                        <td
                          className={
                            isHovered ? 'GamepadInfoModal-datum-hovered' : ''
                          }
                        >
                          {datum[0]}
                          <div className="GamepadInfoModal-value">
                            {typeof datum[1] === 'boolean' ? (
                              <div className="GamepadInfoModal-dot-container">
                                <div
                                  className="GamepadInfoModal-dot"
                                  data-active={datum[1]}
                                />
                                <div className="GamepadInfoModal-tooltip">
                                  {formatValue(datum[1])}
                                </div>
                              </div>
                            ) : (
                              <span className="GamepadInfoModal-axis-value">
                                {formatValue(datum[1])}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
