import { StrictMode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import store from './store/store';
import Topbar from './Topbar';
import Editor from './editor/Editor';
import DeviceInfo from './DeviceInfo';
import AppConsole from './AppConsole';
import ConnectionInfoModal from './modals/ConnectionInfoModal';
import GamepadInfoModal from './modals/GamepadInfoModal';
import ResizeBar from './ResizeBar';
import './App.css';

/**
 * Top-level component handling layout.
 */
export default function App() {
  return (
    <StrictMode>
      <ReduxProvider store={store}>
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
      </ReduxProvider>
    </StrictMode>
  );
}
