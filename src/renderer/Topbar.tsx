import ConnectionConfig from './ConnectionConfig';
import './Topbar.css';

/**
 * Component displaying Dawn version and connection info.
 * @param props - props
 * @param props.onConnectionConfigModalOpen - handler called when the ConnectionConfigModal should
 * be opened
 * @param props.robotLatencyMs - latency in milliseconds of the connection to the currently
 * connected robot, or -1 if there is no robot connected
 * @param props.robotBatteryVoltage - battery voltage in volts of the currently connected robot. The
 * value is not used if robotLatencyMs is -1
 * @param props.dawnVersion - version string of Dawn
 */
export default function Topbar({
  onConnectionConfigModalOpen,
  robotBatteryVoltage,
  robotLatencyMs,
  dawnVersion,
}: {
  onConnectionConfigModalOpen: () => void;
  robotBatteryVoltage: number;
  robotLatencyMs: number;
  dawnVersion: string;
}) {
  const robotInfo =
    robotLatencyMs === -1 ? (
      <div className="Topbar-robot-disconnected Topbar-info-card">
        DISCONNECTED
      </div>
    ) : (
      <>
        <div className="Topbar-info-card">Battery: {robotBatteryVoltage} V</div>
        <div className="Topbar-info-card">Latency: {robotLatencyMs} ms</div>
      </>
    );
  return (
    <div className="Topbar">
      <div className="Topbar-left-group">
        <div className="Topbar-dawn-version">Dawn v{dawnVersion}</div>
        {robotInfo}
      </div>
      <div className="Topbar-right-group">
        <ConnectionConfig onModalOpen={onConnectionConfigModalOpen} />
      </div>
      <div className="Topbar-tail" />
    </div>
  );
}
