/**
 * Centralized mock data for development and offline mode.
 *
 * Mocks are gated by env.USE_MOCKS or by checking connectionStatus —
 * see SimulationLayer and the various components that pass `useMock`
 * flags into their data hooks.
 */

export { getMockOccupancyGrid } from "./occupancy-grid";
export { createMockTourRunner, type MockTourRunner } from "./tour-runner";
