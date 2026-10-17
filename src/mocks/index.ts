/**
 * Centralized mock data for development and offline mode.
 *
 * Mocks run when env.USE_MOCKS is set or rosbridge is disconnected — see
 * SimulationLayer (state) and useRobotApi (actions).
 */

export {
  getMockRobot,
  type MockRobot,
  type MockRobotState,
} from "./mock-robot";
export { getMockOccupancyGrid } from "./occupancy-grid";
export {
  createMockTourRunner,
  type MockTourPlan,
  type MockTourResolver,
  type MockTourRunner,
} from "./tour-runner";
