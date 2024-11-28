import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { config as aceConfig } from 'ace-builds';
import App from '../renderer/App';

describe('App', () => {
  beforeEach(() => {
    aceConfig.set('basePath', 'node_modules/ace-builds/src-noconflict');
  });
  it('should render', () => {
    expect(render(<App />)).toBeTruthy();
  });
});
