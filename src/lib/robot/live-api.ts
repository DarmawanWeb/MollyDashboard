/**
 * RobotApi over rosbridge: every action is a service call (or the teleop
 * publish) from the registry. Service failures resolve as
 * `{ success: false, message }` instead of throwing, so callers only branch
 * on the result.
 */

import type { ResultWire } from "@/types/ros/molly";
import type { TriggerRequest, TriggerResponse } from "@/types/ros/std";
import type {
  ActionResult,
  Language,
  POI,
  RobotApi,
  TourDefinition,
} from "@/types/ui";
import { makeTwist } from "../ros/codec";
import {
  doubleParameter,
  numberValue,
  setParametersError,
} from "../ros/params";
import { getRos } from "../ros/singleton";
import {
  robotCommandService,
  SERVICES,
  type ServiceDef,
  TOPICS,
} from "../ros/topics";
import { decodePoi, decodeTour, encodePoi, encodeTour } from "../site/codec";

/** Walking speed parameter of path_follower_node. */
export const WALKING_SPEED_PARAM = "target_linear_velocity";

function failure(err: unknown): ActionResult {
  return {
    success: false,
    message: err instanceof Error ? err.message : String(err),
  };
}

async function result(call: Promise<ResultWire>): Promise<ActionResult> {
  try {
    const res = await call;
    return { success: res.success, message: res.message };
  } catch (err) {
    return failure(err);
  }
}

/** Long-running calls (the robot may plan, load a map, run a model). */
const SLOW_MS = 30_000;
const ASK_MS = 90_000;

export function createLiveApi(): RobotApi {
  const ros = () => getRos();
  const trigger = (svc: ServiceDef<TriggerRequest, TriggerResponse>) =>
    result(ros().callService(svc, {}));

  return {
    listSites: async () => {
      try {
        return await ros().callService(SERVICES.SITE_LIST, {});
      } catch {
        return { sites: [], active: "" };
      }
    },
    loadSite: (site) =>
      result(ros().callService(SERVICES.SITE_LOAD, { site }, SLOW_MS)),
    startMapping: (site, reset) =>
      result(
        ros().callService(SERVICES.MAPPING_START, { site, reset }, SLOW_MS),
      ),
    stopMapping: () => trigger(SERVICES.MAPPING_STOP),
    saveMap: () =>
      result(ros().callService(SERVICES.MAPPING_SAVE, {}, SLOW_MS)),
    localize: () => trigger(SERVICES.LOCALIZATION_START),
    recordTags: () =>
      result(ros().callService(SERVICES.LOCALIZATION_RECORD_TAGS, {}, SLOW_MS)),

    savePoi: async (poi: POI, atRobotPose: boolean) => {
      try {
        const res = await ros().callService(SERVICES.SAVE_POI, {
          poi: encodePoi(poi),
          at_robot_pose: atRobotPose,
        });
        return {
          success: res.success,
          message: res.message,
          poi: res.success ? decodePoi(res.poi) : null,
        };
      } catch (err) {
        return { ...failure(err), poi: null };
      }
    },
    deletePoi: (id) => result(ros().callService(SERVICES.DELETE_POI, { id })),
    saveTour: async (tour: TourDefinition) => {
      try {
        const res = await ros().callService(SERVICES.SAVE_TOUR, {
          tour: encodeTour(tour),
        });
        return {
          success: res.success,
          message: res.message,
          tour: res.success ? decodeTour(res.tour) : null,
        };
      } catch (err) {
        return { ...failure(err), tour: null };
      }
    },
    deleteTour: (id) => result(ros().callService(SERVICES.DELETE_TOUR, { id })),

    goToPoi: (id) =>
      result(
        ros().callService(
          SERVICES.PLANNER_GO_TO,
          { poi_id: id, x: 0, y: 0, yaw: 0 },
          SLOW_MS,
        ),
      ),
    goToPose: ({ x, y, yaw }) =>
      result(
        ros().callService(
          SERVICES.PLANNER_GO_TO,
          { poi_id: "", x, y, yaw },
          SLOW_MS,
        ),
      ),
    cancelGoTo: () => trigger(SERVICES.PLANNER_CANCEL),
    pauseNavigation: (pause) =>
      result(ros().callService(SERVICES.NAVIGATION_PAUSE, { data: pause })),

    say: async (text: string, language: Language, interrupt: boolean) => {
      try {
        const res = await ros().callService(SERVICES.SAY, {
          text,
          language,
          interrupt,
        });
        return { success: res.success, message: res.message, id: res.id };
      } catch (err) {
        return { ...failure(err), id: 0 };
      }
    },
    stopSpeech: () => trigger(SERVICES.STOP_SPEECH),
    gesture: (name) =>
      result(ros().callService(SERVICES.GESTURE, { name }, SLOW_MS)),
    greet: () => result(ros().callService(SERVICES.GREET, {}, SLOW_MS)),
    setGreeter: (enabled) =>
      result(ros().callService(SERVICES.SET_GREETER, { data: enabled })),
    ask: async (question: string, language: Language, speak: boolean) => {
      try {
        const res = await ros().callService(
          SERVICES.ASK,
          { question, language, speak },
          ASK_MS,
        );
        return {
          success: res.success,
          message: res.message,
          answer: res.answer,
        };
      } catch (err) {
        return { ...failure(err), answer: "" };
      }
    },

    setMode: (mode) => result(ros().callService(SERVICES.SET_MODE, { mode })),
    setEstop: (engaged) =>
      result(ros().callService(SERVICES.ESTOP, { data: engaged })),
    robotCommand: (name) =>
      result(ros().callService(robotCommandService(name), {}, SLOW_MS)),
    drive: (vx, vy, wz) => {
      ros().publish(TOPICS.REMOTE_CMD_VEL, makeTwist(vx, vy, wz));
    },
    getWalkingSpeed: async () => {
      try {
        const res = await ros().callService(SERVICES.FOLLOWER_GET_PARAMS, {
          names: [WALKING_SPEED_PARAM],
        });
        return numberValue(res.values[0]);
      } catch {
        return null;
      }
    },
    setWalkingSpeed: async (speed) => {
      try {
        const res = await ros().callService(SERVICES.FOLLOWER_SET_PARAMS, {
          parameters: [doubleParameter(WALKING_SPEED_PARAM, speed)],
        });
        const error = setParametersError(res);
        return { success: error === null, message: error ?? "" };
      } catch (err) {
        return failure(err);
      }
    },

    listNodes: async () => {
      try {
        const res = await ros().callService(SERVICES.ROSAPI_NODES, {});
        return [...res.nodes].sort();
      } catch {
        return [];
      }
    },
    listTopics: async () => {
      try {
        const res = await ros().callService(SERVICES.ROSAPI_TOPICS, {});
        return res.topics
          .map((name, i) => ({ name, type: res.types[i] ?? "" }))
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch {
        return [];
      }
    },
  };
}
