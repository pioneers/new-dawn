import TopbarButton from './TopbarButton';
import questionSvg from '../../assets/question.svg';
import gamepadSvg from '../../assets/gamepad.svg';
import connectionSvg from '../../assets/network.svg';
import noConnectionSvg from '../../assets/no-network.svg';
import './Topbar.css';

const GOOD_BATTERY_VOLTAGE = 11;
const FAIR_BATTERY_VOLTAGE = 9.5;
const GOOD_LATENCY_MS = 100;
const FAIR_LATENCY_MS = 200;

/**
 * Component displaying Dawn version and connection info.
 * @param props - props
 * @param props.onConnectionConfigModalOpen - handler called when the ConnectionConfigModal should
 * be opened
 * @param props.onHelpModalOpen - handler called when the HelpModal should be opened
 * @param props.onGamepadModalOpen - handler called when the GamepadInfoModal should be opened
 * @param props.robotLatencyMs - latency in milliseconds of the connection to the currently
 * connected robot, or -1 if there is no robot connected
 * @param props.robotBatteryVoltage - battery voltage in volts of the currently connected robot. The
 * value is not displayed to the user if robotLatencyMs is -1
 * @param props.dawnVersion - version string of Dawn
 * @param props.isDarkMode - whether UI is in dark mode
 */
export default function Topbar({
  onConnectionConfigModalOpen,
  onHelpModalOpen,
  onGamepadModalOpen,
  robotBatteryVoltage,
  robotLatencyMs,
  dawnVersion,
  isDarkMode,
}: {
  onConnectionConfigModalOpen: () => void;
  onHelpModalOpen: () => void;
  onGamepadModalOpen: () => void;
  robotBatteryVoltage: number;
  robotLatencyMs: number;
  dawnVersion: string;
  isDarkMode: boolean;
}) {
  let batteryColor;
  if (robotBatteryVoltage > GOOD_BATTERY_VOLTAGE) {
    batteryColor = 'Topbar-info-card-green';
  } else if (robotBatteryVoltage > FAIR_BATTERY_VOLTAGE) {
    batteryColor = 'Topbar-info-card-yellow';
  } else {
    batteryColor = 'Topbar-info-card-red';
  }
  let latencyColor;
  if (robotLatencyMs < GOOD_LATENCY_MS) {
    latencyColor = 'Topbar-info-card-green';
  } else if (robotLatencyMs < FAIR_LATENCY_MS) {
    latencyColor = 'Topbar-info-card-yellow';
  } else {
    latencyColor = 'Topbar-info-card-red';
  }
  const robotInfo =
    robotLatencyMs === -1 ? (
      <div className="Topbar-robot-disconnected Topbar-info-card">
        DISCONNECTED
      </div>
    ) : (
      <>
        <div className={`Topbar-info-card ${batteryColor}`}>
          Battery: {Math.floor(robotBatteryVoltage * 100) / 100} V
        </div>
        <div className={`Topbar-info-card ${latencyColor}`}>
          Latency: {robotLatencyMs} ms
        </div>
      </>
    );
  return (
    <div className={`Topbar-${isDarkMode ? 'dark' : 'light'}`}>
      <div className="Topbar-left-group">
        <div className="Topbar-dawn-version">Dawn v{dawnVersion}</div>
        {robotInfo}
      </div>
      <div className="Topbar-right-group">
        <TopbarButton
          onModalOpen={onGamepadModalOpen}
          alt="Gamepad info"
          src={gamepadSvg}
          isDarkMode={isDarkMode}
        />
        <TopbarButton
          onModalOpen={onHelpModalOpen}
          alt="Dawn and robot API help"
          src={questionSvg}
          isDarkMode={isDarkMode}
        />
        <TopbarButton
          onModalOpen={onConnectionConfigModalOpen}
          alt="Connection configuration"
          src={robotLatencyMs === -1 ? noConnectionSvg : connectionSvg}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}
