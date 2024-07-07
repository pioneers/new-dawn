import { createRoot } from 'react-dom/client';
import App from './App';
import store from './store/store';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

window.electron.ipcRenderer.on('renderer-store-dispatch', (action) => {
  //console.log('renderer store dispatch');
  store.dispatch(action);
});
