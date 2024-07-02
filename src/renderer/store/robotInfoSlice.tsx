import { createSlice } from '@reduxjs/toolkit';

export const robotInfoSlice = createSlice({
  name: 'robotInfo',
  initialState: {
    runtimeVersion: "X.X.X",
    latencyMs: -1,
    batteryVoltage: 0
  },
  reducers: {}
});
export const robotInfoActions = robotInfoSlice.actions;
export default robotInfoSlice.reducer;
