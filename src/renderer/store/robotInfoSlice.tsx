import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  runtimeVersion: "X.X.X",
  latencyMs: -1,
  batteryVoltage: 0
};
export const robotInfoSlice = createSlice({
  name: 'robotInfo',
  initialState: initialState,
  reducers: {}
});
export const robotInfoActions = robotInfoSlice.actions;
export type RobotInfoState = typeof initialState;
export default robotInfoSlice.reducer;
