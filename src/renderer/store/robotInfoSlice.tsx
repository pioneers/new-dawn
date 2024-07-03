import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dawnVersion: '', // not technically robot info, but we get it through the main process
  runtimeVersion: '',
  latencyMs: -1,
  batteryVoltage: 0
};
export const robotInfoSlice = createSlice({
  name: 'robotInfo',
  initialState: initialState,
  reducers: {
    setDawnVersion: (state, { payload }) => {
      state.dawnVersion = payload;
    },
    setRuntimeVersion: (state, { payload }) => {
      state.runtimeVersion = payload;
    },
    setLatency: (state, { payload }) => {
      state.latencyMs = payload;
      if (payload === -1) {
        state.runtimeVersion = '';
        state.batteryVoltage = 0;
      }
    },
    setBatteryVoltage: (state, { payload }) => {
      state.batteryVoltage = payload;
    }
  }
});
export const robotInfoActions = robotInfoSlice.actions;
export type RobotInfoState = typeof initialState;
export default robotInfoSlice.reducer;
