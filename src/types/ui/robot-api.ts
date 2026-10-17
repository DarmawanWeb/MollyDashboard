/**
 * Everything the dashboard can ask the robot to do.
 *
 * Two implementations share this contract: the live one over rosbridge
 * (lib/robot/live-api.ts) and the in-memory robot used offline
 * (mocks/mock-robot.ts). Components never care which one they talk to.
 */

import type { Language, POI } from "./poi";
import type { ControlMode } from "./robot";
import type { TourDefinition } from "./tour";

export interface ActionResult {
  success: boolean;
  message: string;
}

export interface RobotApi {
  /* sites and mapping */
  listSites(): Promise<{ sites: string[]; active: string }>;
  loadSite(site: string): Promise<ActionResult>;
  startMapping(site: string, reset: boolean): Promise<ActionResult>;
  stopMapping(): Promise<ActionResult>;
  saveMap(): Promise<ActionResult>;
  localize(): Promise<ActionResult>;
  recordTags(): Promise<ActionResult>;

  /* POIs and tours */
  savePoi(
    poi: POI,
    atRobotPose: boolean,
  ): Promise<ActionResult & { poi: POI | null }>;
  deletePoi(id: string): Promise<ActionResult>;
  saveTour(
    tour: TourDefinition,
  ): Promise<ActionResult & { tour: TourDefinition | null }>;
  deleteTour(id: string): Promise<ActionResult>;

  /* walking */
  goToPoi(id: string): Promise<ActionResult>;
  goToPose(pose: { x: number; y: number; yaw: number }): Promise<ActionResult>;
  cancelGoTo(): Promise<ActionResult>;
  pauseNavigation(pause: boolean): Promise<ActionResult>;

  /* interaction */
  say(
    text: string,
    language: Language,
    interrupt: boolean,
  ): Promise<ActionResult & { id: number }>;
  stopSpeech(): Promise<ActionResult>;
  gesture(name: string): Promise<ActionResult>;
  greet(): Promise<ActionResult>;
  setGreeter(enabled: boolean): Promise<ActionResult>;
  ask(
    question: string,
    language: Language,
    speak: boolean,
  ): Promise<ActionResult & { answer: string }>;

  /* control */
  setMode(mode: ControlMode): Promise<ActionResult>;
  setEstop(engaged: boolean): Promise<ActionResult>;
  robotCommand(name: string): Promise<ActionResult>;
  /** Teleop velocity (body frame); only effective in remote mode. */
  drive(vx: number, vy: number, wz: number): void;
  getWalkingSpeed(): Promise<number | null>;
  setWalkingSpeed(speed: number): Promise<ActionResult>;

  /* system */
  listNodes(): Promise<string[]>;
  listTopics(): Promise<{ name: string; type: string }[]>;
}
