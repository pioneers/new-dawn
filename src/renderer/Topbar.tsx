import ConnectionConfig from './ConnectionConfig';
import './Topbar.css';

/**
 * Component displaying Dawn version and connection info.
 */
export default function Topbar({
  onConnectionConfigModalOpen,
  runtimeVersion,
  robotBatteryVoltage,
  robotLatencyMs,
  dawnVersion,
}: {
  onConnectionConfigModalOpen: () => void;
  runtimeVersion: string;
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
        <div className="Topbar-runtime-version Topbar-info-card">
          Runtime v{runtimeVersion}
        </div>
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
