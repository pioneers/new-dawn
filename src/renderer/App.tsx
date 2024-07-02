import Topbar from './Topbar.tsx';
import Editor from './editor/Editor.tsx';
import DeviceInfo from './DeviceInfo.tsx';
import AppConsole from './AppConsole.tsx';
import ConnectionInfoModal from './modals/ConnectionInfoModal.tsx';
import GamepadInfoModal from './modals/GamepadInfoModal.tsx';
import ResizeBar from './ResizeBar.tsx';
import './App.css';

/**
 * Top-level component handling layout.
 */
export default function App() {
  return (
    <div className="App">
      <Topbar />
      <div className="App-cols">
        <Editor />
        <ResizeBar />
        <DeviceInfo />
      </div>
      <AppConsole />
      <div className="App-modal-container">
        <ConnectionInfoModal />
        <GamepadInfoModal />
      </div>
    </div>
  );
}
