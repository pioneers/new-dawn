import { useState } from 'react';
import Modal from './Modal';
import LogitechGamepadSvgr from '../../../assets/logitech-gamepad.svg?svgr';
import './GamepadInfoModal.css';

const CONTROL_NAMES = {
  "a-button": "button_a",
  "b-button": "button_b",
  "x-button": "button_x",
  "y-button": "button_y",
  "dpad": ["dpad_down", "dpad_up", "dpad_left", "dpad_right"],
  "right-bumper": "r_bumper",
  "right-trigger": "r_trigger",
  "left-bumper": "l_bumper",
  "left-trigger": "l_trigger",
  "back-button": "button_back",
  "start-button": "button_start",
  "brand-button": "button_xbox",
  "left-joystick": ["l_stick", "joystick_left_x", "joystick_left_y"],
  "right-joystick": ["r_stick", "joystick_right_x", "joystick_right_y"],
};

const PREFIX = "logitech-gamepad_svg__";

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
  const [active, setActive] = useState(new Set());
  const [hoverControl, setHoverControl] = useState('');
  const classes = ['logitech-gamepad_svg', 'hover-' + hoverControl]
    .concat(Array.from(active))
    .join(' ');
  const onMouseEnter = ({target}) => {
    const unprefixed = target.id.slice(PREFIX.length)
    if (unprefixed in CONTROL_NAMES) {
      setHoverControl(unprefixed);
    }
  };
  const onMouseLeave = ({target}) => {
    if (target.id.slice(PREFIX.length)) {
      setHoverControl('');
    }
  };
  return (
    <Modal
      modalTitle="Gamepad info"
      onClose={onClose}
      isActive={isActive}
      isDarkMode={isDarkMode}
    >
      <LogitechGamepadSvgr
        width="100%"
        height="100%"
        className={classes}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </Modal>
  );
}
