import { useSelector } from 'react-redux';
import ConnectionConfig from './ConnectionConfig';
import type { State } from './store/store';
import './Topbar.css';

/**
 * Component displaying Dawn version and connection info.
 */
export default function Topbar() {
  const robotRuntimeVersion = useSelector((state: State) => state.robotInfo.runtimeVersion);
  const robotBatteryVoltage = useSelector((state: State) => state.robotInfo.batteryVoltage);
  const robotLatencyMs = useSelector((state: State) => state.robotInfo.latencyMs);
  const robotInfo = robotLatencyMs == -1 ?
    (
      <div className="Topbar-robot-disconnected Topbar-info-card">DISCONNECTED</div>
    ) :
    (
      <>
        <div className="Topbar-runtime-version Topbar-info-card">
          Runtime v{robotRuntimeVersion}
        </div>
        <div className="Topbar-info-card">
          Battery: {robotBatteryVoltage} V
        </div>
        <div className="Topbar-info-card">
          Latency: {robotLatencyMs} ms
        </div>
      </>
    );
  return (
    <div className="Topbar">
      <div className="Topbar-left-group">
        <div className="Topbar-dawn-version">
          Dawn vX.X.X
        </div>
        {robotInfo}
      </div>
      <div className="Topbar-right-group">
        <ConnectionConfig />
      </div>
      <div className="Topbar-tail"></div>
    </div>
  );
}
