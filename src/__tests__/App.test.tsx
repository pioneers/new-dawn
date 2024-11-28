import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from '../renderer/App';
import { config as aceConfig, require as acequire } from 'ace-builds';

describe('App', () => {
  beforeEach(() => {
    aceConfig.set('basePath', 'node_modules/ace-builds/src-noconflict');
  });
  it('should render', () => {
    expect(render(<App />)).toBeTruthy();
  });
});
