/**
 * In-memory Molly robot for offline development (USE_MOCKS or no rosbridge).
 *
 * Implements the same RobotApi as the live robot and keeps a full robot
 * state (site, POIs, tours, mapping, walking, speech, visitors, control,
 * telemetry). SimulationLayer copies the state into the stores and calls
 * `tick()` to move time forward.
 */

import { toId } from "@/lib/site/codec";
import type {
  ActionResult,
  BatterySnapshot,
  ControlSnapshot,
  GreeterSnapshot,
  HealthSnapshot,
  Language,
  Lite3Snapshot,
  LocalizationSnapshot,
  MappingSnapshot,
  NavigationSnapshot,
  PathPoint,
  PlannerSnapshot,
  POI,
  RobotApi,
  RobotImu,
  RobotPose,
  SiteSnapshot,
  SpeechSnapshot,
  TourDefinition,
  VisitorsSnapshot,
} from "@/types/ui";

export interface MockRobotState {
  pose: RobotPose;
  localization: LocalizationSnapshot;
  odometry: string;
  battery: BatterySnapshot;
  imu: RobotImu;
  lite3: Lite3Snapshot;
  control: ControlSnapshot;
  site: SiteSnapshot;
  mapping: MappingSnapshot;
  pois: POI[];
  tours: TourDefinition[];
  planner: PlannerSnapshot;
  path: PathPoint[];
  navigation: NavigationSnapshot;
  speech: SpeechSnapshot;
  greeter: GreeterSnapshot;
  visitors: VisitorsSnapshot;
  health: HealthSnapshot;
}

export interface MockRobot {
  api: RobotApi;
  getState: () => MockRobotState;
  /** Receives the state immediately and after every change. */
  subscribe: (listener: (state: MockRobotState) => void) => () => void;
  /**
   * Advance the simulation by `dt` seconds. `tourTarget` is the POI a running
   * tour walks to (the mock tour runner lives in the tour controller).
   */
  tick: (dt: number, tourTarget: string | null) => void;
}

/* ----------------------------------------------------------------------------
 * Seed data — matches the mock occupancy grid (x ∈ [-3, 3], y ∈ [-2.5, 2.5])
 * ------------------------------------------------------------------------- */

const SEED_POIS: POI[] = [
  poi("lobby", "Lobby", -1.6, -1.6, 0, "Selamat datang di lobi utama."),
  poi("hall-a", "Hall A", 0.6, 0.4, Math.PI / 2, "Ini adalah Hall A."),
  poi("hall-b", "Hall B", 1.9, -1.2, 0, "Hall B menampilkan koleksi sejarah."),
  poi(
    "garden",
    "Garden",
    -0.8,
    1.8,
    Math.PI,
    "Taman kami terbuka setiap hari.",
  ),
];

const SEED_TOURS: TourDefinition[] = [
  {
    id: "highlights",
    name: "Highlights",
    description: "Lobby, both halls and the garden",
    poiIds: ["lobby", "hall-a", "hall-b", "garden"],
    returnPoiId: "lobby",
  },
];

function poi(
  id: string,
  name: string,
  x: number,
  y: number,
  yaw: number,
  narration: string,
): POI {
  return {
    id,
    name,
    description: "",
    x,
    y,
    yaw,
    narration,
    language: "id",
    gesture: id === "lobby" ? "hello" : "",
    dwellSec: 3,
  };
}

const WALK_SPEED = 0.5; // m/s
const TURN_SPEED = 1.2; // rad/s
const ARRIVE_M = 0.08;
const SPEAK_MS_PER_CHAR = 55;

/* ----------------------------------------------------------------------------
 * Factory
 * ------------------------------------------------------------------------- */

function createMockRobot(): MockRobot {
  let state: MockRobotState = {
    pose: { x: -2.2, y: -1.8, yaw: 0 },
    localization: {
      source: "tag",
      localized: true,
      detail: "tag_0",
      raw: "tag:tag_0",
    },
    odometry: "ok",
    battery: { percentage: 82, voltage: 25.1, current: -3.2 },
    imu: { roll: 0.4, pitch: 1.1, yaw: 0 },
    lite3: {
      connected: true,
      ageSec: 0.02,
      basicState: "standing",
      gait: "flat_medium",
      motion: "idle",
      standing: true,
      moving: false,
      balanceLost: false,
      ultrasoundFront: 2.4,
      ultrasoundRear: 4.5,
      controlMode: "navigation",
      gesture: "",
    },
    control: {
      mode: "auto",
      estopEngaged: false,
      estopReason: "",
      field: "clear",
    },
    site: {
      site: "demo-hall",
      sites: ["demo-hall", "lobby-east"],
      hasMap: true,
      mapping: false,
      poiCount: SEED_POIS.length,
      tourCount: SEED_TOURS.length,
      tagCount: 3,
      message: "",
    },
    mapping: {
      active: false,
      site: "",
      scans: 0,
      resolution: 0.05,
      width: 120,
      height: 100,
      knownAreaM2: 0,
      message: "",
    },
    pois: SEED_POIS.map((p) => ({ ...p })),
    tours: SEED_TOURS.map((t) => ({ ...t, poiIds: [...t.poiIds] })),
    planner: {
      state: "idle",
      goalId: "",
      goal: null,
      pathLength: 0,
      remaining: 0,
      replans: 0,
      message: "",
    },
    path: [],
    navigation: { state: "NAV_INACTIVE", message: "" },
    speech: {
      id: 0,
      state: "idle",
      text: "",
      language: "id",
      queued: 0,
      engine: "mock",
      message: "",
    },
    greeter: { enabled: true, state: "watching", lastGreetAge: null },
    visitors: {
      positions: [],
      count: 0,
      front: 0,
      behind: 0,
      nearest: null,
      nearestFront: null,
      nearestBehind: null,
    },
    health: {
      ok: true,
      level: "ok",
      issues: [],
      topics: {
        "/livox/lidar": 10,
        "/livox/imu": 200,
        "/robot/odom": 50,
        "/perception/safety_scan": 10,
      },
      odometry: "ok",
      localization: "tag:tag_0",
      field: "clear",
      estop: false,
      cpuTempC: 48,
      cpuPercent: 35,
      gpuPercent: 18,
      memoryPercent: 41,
      memoryUsedGb: 6.4,
      memoryTotalGb: 15.3,
      diskFreeGb: 112,
      load: 2.1,
    },
  };

  const listeners = new Set<(s: MockRobotState) => void>();
  let speechId = 0;
  let speechTimer: ReturnType<typeof setTimeout> | null = null;
  let remoteVel = { vx: 0, vy: 0, wz: 0, at: 0 };
  let clock = 0;

  const emit = () => {
    for (const l of listeners) l(state);
  };

  const update = (patch: Partial<MockRobotState>) => {
    state = { ...state, ...patch };
    emit();
  };

  const ok = (message = ""): ActionResult => ({ success: true, message });
  const fail = (message: string): ActionResult => ({ success: false, message });
  const later = <T>(value: T, ms = 250): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(value), ms));

  const refreshSite = () =>
    update({
      site: {
        ...state.site,
        poiCount: state.pois.length,
        tourCount: state.tours.length,
      },
    });

  const uniqueId = (base: string, taken: string[]) => {
    const root = toId(base) || "item";
    let id = root;
    for (let i = 2; taken.includes(id); i++) id = `${root}-${i}`;
    return id;
  };

  const startWalk = (
    goalId: string,
    goal: { x: number; y: number; yaw: number },
  ) => {
    const { x, y } = state.pose;
    const length = Math.hypot(goal.x - x, goal.y - y);
    const steps = Math.max(2, Math.ceil(length / 0.25));
    const path: PathPoint[] = Array.from({ length: steps + 1 }, (_, i) => ({
      x: x + ((goal.x - x) * i) / steps,
      y: y + ((goal.y - y) * i) / steps,
    }));
    update({
      path,
      planner: {
        state: "following",
        goalId,
        goal,
        pathLength: length,
        remaining: length,
        replans: 0,
        message: goalId ? `walking to ${goalId}` : "walking to the pose",
      },
      navigation: { state: "FOLLOWING", message: "" },
    });
  };

  const speak = (text: string, language: Language): number => {
    speechId += 1;
    const id = speechId;
    if (speechTimer) clearTimeout(speechTimer);
    update({
      speech: {
        id,
        state: "speaking",
        text,
        language: language || "id",
        queued: 0,
        engine: "mock",
        message: "",
      },
    });
    speechTimer = setTimeout(
      () => {
        speechTimer = null;
        update({ speech: { ...state.speech, state: "done" } });
      },
      Math.max(800, text.length * SPEAK_MS_PER_CHAR),
    );
    return id;
  };

  /* ------------------------------------------------------------------------
   * Simulation step
   * --------------------------------------------------------------------- */

  const moveTowards = (
    target: { x: number; y: number; yaw: number },
    dt: number,
  ): boolean => {
    const { x, y, yaw } = state.pose;
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist <= ARRIVE_M) {
      const dyaw = Math.atan2(
        Math.sin(target.yaw - yaw),
        Math.cos(target.yaw - yaw),
      );
      const turn = Math.sign(dyaw) * Math.min(Math.abs(dyaw), TURN_SPEED * dt);
      state.pose = { x: target.x, y: target.y, yaw: yaw + turn };
      return Math.abs(dyaw) < 0.05;
    }
    const step = Math.min(dist, WALK_SPEED * dt);
    const heading = Math.atan2(dy, dx);
    const dyaw = Math.atan2(Math.sin(heading - yaw), Math.cos(heading - yaw));
    state.pose = {
      x: x + (dx / dist) * step,
      y: y + (dy / dist) * step,
      yaw: yaw + Math.sign(dyaw) * Math.min(Math.abs(dyaw), TURN_SPEED * dt),
    };
    return false;
  };

  const tick = (dt: number, tourTarget: string | null) => {
    clock += dt;
    state = { ...state }; // listeners keep the previous snapshot intact
    const moving = !state.control.estopEngaged;

    // walking to a goal (go-to) or the tour's current stop
    const tourPoi = tourTarget
      ? state.pois.find((p) => p.id === tourTarget)
      : undefined;
    if (moving && state.planner.state === "following" && state.planner.goal) {
      const arrived = moveTowards(state.planner.goal, dt);
      const remaining = Math.hypot(
        state.planner.goal.x - state.pose.x,
        state.planner.goal.y - state.pose.y,
      );
      state.planner = {
        ...state.planner,
        remaining,
        state: arrived ? "arrived" : "following",
        message: arrived ? "arrived" : state.planner.message,
      };
      if (arrived) {
        state.navigation = { state: "GOAL_REACHED", message: "" };
        state.path = [];
      }
    } else if (moving && tourPoi) {
      moveTowards(tourPoi, dt);
    } else if (
      moving &&
      state.control.mode === "remote" &&
      clock - remoteVel.at < 0.5
    ) {
      const { x, y, yaw } = state.pose;
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      state.pose = {
        x: x + (c * remoteVel.vx - s * remoteVel.vy) * dt,
        y: y + (s * remoteVel.vx + c * remoteVel.vy) * dt,
        yaw: yaw + remoteVel.wz * dt,
      };
    }

    // telemetry jitter
    const t = clock;
    state.imu = {
      roll: Math.round((0.4 + Math.sin(t * 1.3) * 0.3) * 10) / 10,
      pitch: Math.round((1.1 + Math.cos(t * 0.9) * 0.4) * 10) / 10,
      yaw: Math.round(((state.pose.yaw * 180) / Math.PI) * 10) / 10,
    };
    state.health = {
      ...state.health,
      cpuTempC: Math.round(48 + Math.sin(t / 7) * 4),
      cpuPercent: Math.round(35 + Math.sin(t / 3) * 9),
      gpuPercent: Math.round(18 + Math.cos(t / 4) * 6),
      memoryUsedGb: Math.round((6.4 + Math.sin(t / 11) * 0.4) * 10) / 10,
    };
    state.lite3 = {
      ...state.lite3,
      moving: state.planner.state === "following" || !!tourPoi,
      ultrasoundFront: Math.round((2.4 + Math.sin(t / 2) * 0.6) * 100) / 100,
    };

    // a few visitors wandering behind and beside the robot
    const positions = [
      { x: -1.2 + Math.sin(t / 3) * 0.2, y: 0.3, confidence: 0.9 },
      { x: -1.6, y: -0.4 + Math.cos(t / 4) * 0.2, confidence: 0.8 },
      { x: 1.8 + Math.sin(t / 5) * 0.4, y: 1.0, confidence: 0.6 },
    ];
    const dists = positions.map((p) => Math.hypot(p.x, p.y));
    const front = positions.filter((p) => p.x > 0);
    const behind = positions.filter((p) => p.x <= 0);
    const nearestOf = (ps: typeof positions) =>
      ps.length ? Math.min(...ps.map((p) => Math.hypot(p.x, p.y))) : null;
    state.visitors = {
      positions,
      count: positions.length,
      front: front.length,
      behind: behind.length,
      nearest: Math.min(...dists),
      nearestFront: nearestOf(front),
      nearestBehind: nearestOf(behind),
    };

    if (state.mapping.active) {
      state.mapping = {
        ...state.mapping,
        scans: state.mapping.scans + 1,
        knownAreaM2: Math.min(30, state.mapping.knownAreaM2 + dt * 0.4),
      };
    }

    emit();
  };

  /* ------------------------------------------------------------------------
   * API
   * --------------------------------------------------------------------- */

  const api: RobotApi = {
    listSites: () =>
      later({ sites: state.site.sites, active: state.site.site }, 150),
    loadSite: async (site) => {
      if (!state.site.sites.includes(site)) return fail(`no site ${site}`);
      update({ site: { ...state.site, site } });
      return later(ok(`loaded ${site}`), 400);
    },
    startMapping: async (site, reset) => {
      const name = toId(site);
      if (!name) return fail("site name needed");
      const sites = state.site.sites.includes(name)
        ? state.site.sites
        : [...state.site.sites, name].sort();
      update({
        site: { ...state.site, site: name, sites, mapping: true },
        mapping: {
          ...state.mapping,
          active: true,
          site: name,
          scans: reset ? 0 : state.mapping.scans,
          knownAreaM2: reset ? 0 : state.mapping.knownAreaM2,
          message: "integrating scans",
        },
      });
      return later(ok(`mapping ${name}`));
    },
    stopMapping: async () => {
      update({
        site: { ...state.site, mapping: false },
        mapping: { ...state.mapping, active: false, message: "stopped" },
      });
      return later(ok("mapping stopped"));
    },
    saveMap: async () => {
      update({ site: { ...state.site, hasMap: true } });
      return later(ok(`saved map/${state.site.site}/map.pgm`), 500);
    },
    localize: async () => {
      update({
        localization: {
          source: "tag",
          localized: true,
          detail: "tag_0",
          raw: "tag:tag_0",
        },
      });
      return later(ok("localized from tag_0"));
    },
    recordTags: async () => {
      update({ site: { ...state.site, tagCount: state.site.tagCount + 1 } });
      return later(ok("recorded 1 tag"), 600);
    },

    savePoi: async (input, atRobotPose) => {
      const id =
        input.id ||
        uniqueId(
          input.name,
          state.pois.map((p) => p.id),
        );
      const saved: POI = {
        ...input,
        id,
        ...(atRobotPose
          ? { x: state.pose.x, y: state.pose.y, yaw: state.pose.yaw }
          : {}),
      };
      const exists = state.pois.some((p) => p.id === id);
      update({
        pois: exists
          ? state.pois.map((p) => (p.id === id ? saved : p))
          : [...state.pois, saved],
      });
      refreshSite();
      return later({ ...ok(`saved ${id}`), poi: saved });
    },
    deletePoi: async (id) => {
      if (!state.pois.some((p) => p.id === id)) return fail(`no POI ${id}`);
      update({
        pois: state.pois.filter((p) => p.id !== id),
        tours: state.tours.map((t) => ({
          ...t,
          poiIds: t.poiIds.filter((p) => p !== id),
          returnPoiId: t.returnPoiId === id ? "" : t.returnPoiId,
        })),
      });
      refreshSite();
      return later(ok(`deleted ${id}`));
    },
    saveTour: async (input) => {
      const id =
        input.id ||
        uniqueId(
          input.name,
          state.tours.map((t) => t.id),
        );
      const saved: TourDefinition = { ...input, id };
      const exists = state.tours.some((t) => t.id === id);
      update({
        tours: exists
          ? state.tours.map((t) => (t.id === id ? saved : t))
          : [...state.tours, saved],
      });
      refreshSite();
      return later({ ...ok(`saved ${id}`), tour: saved });
    },
    deleteTour: async (id) => {
      update({ tours: state.tours.filter((t) => t.id !== id) });
      refreshSite();
      return later(ok(`deleted ${id}`));
    },

    goToPoi: async (id) => {
      const target = state.pois.find((p) => p.id === id);
      if (!target) return fail(`no POI ${id}`);
      if (!state.localization.localized) return fail("not localized");
      startWalk(id, target);
      return later(ok(`walking to ${target.name}`));
    },
    goToPose: async (goal) => {
      startWalk("", goal);
      return later(ok("walking"));
    },
    cancelGoTo: async () => {
      update({
        planner: { ...state.planner, state: "cancelled", message: "cancelled" },
        navigation: { state: "NAV_INACTIVE", message: "" },
        path: [],
      });
      return later(ok("cancelled"));
    },
    pauseNavigation: async (pause) => {
      update({
        navigation: {
          state: pause ? "PAUSED" : "FOLLOWING",
          message: "",
        },
      });
      return later(ok(pause ? "paused" : "resumed"));
    },

    say: async (text, language) => {
      const id = speak(text, language);
      return later({ ...ok("queued"), id }, 100);
    },
    stopSpeech: async () => {
      if (speechTimer) clearTimeout(speechTimer);
      speechTimer = null;
      update({ speech: { ...state.speech, state: "cancelled" } });
      return later(ok("stopped"), 100);
    },
    gesture: async (name) => {
      update({ lite3: { ...state.lite3, gesture: name } });
      await later(null, 1500);
      update({ lite3: { ...state.lite3, gesture: "" } });
      return ok(`${name} done`);
    },
    greet: async () => {
      speak("Halo! Selamat datang, saya Molly.", "id");
      update({ greeter: { ...state.greeter, lastGreetAge: 0 } });
      return later(ok("greeted"));
    },
    setGreeter: async (enabled) => {
      update({
        greeter: {
          ...state.greeter,
          enabled,
          state: enabled ? "watching" : "off",
        },
      });
      return later(ok(enabled ? "greeter on" : "greeter off"), 100);
    },
    ask: async (question, language, speakAnswer) => {
      const answer =
        language === "en"
          ? `(mock) This site has ${state.pois.length} points of interest.`
          : `(mock) Tempat ini punya ${state.pois.length} titik menarik.`;
      await later(null, 900);
      if (speakAnswer) speak(answer, language);
      return { ...ok(""), answer: question ? answer : "" };
    },

    setMode: async (mode) => {
      update({ control: { ...state.control, mode } });
      return later(ok(mode), 100);
    },
    setEstop: async (engaged) => {
      update({
        control: {
          ...state.control,
          estopEngaged: engaged,
          estopReason: engaged ? "dashboard" : "",
        },
        planner:
          engaged && state.planner.state === "following"
            ? { ...state.planner, message: "e-stop" }
            : state.planner,
      });
      return later(ok(engaged ? "e-stop engaged" : "e-stop released"), 100);
    },
    robotCommand: async (name) => {
      if (name === "stand_up" || name === "sit_down") {
        const standing = name === "stand_up";
        update({
          lite3: {
            ...state.lite3,
            standing,
            basicState: standing ? "standing" : "sitting",
          },
        });
      } else if (name.startsWith("gait_")) {
        update({
          lite3: { ...state.lite3, gait: `flat_${name.slice(5)}` },
        });
      }
      return later(ok(name), 300);
    },
    drive: (vx, vy, wz) => {
      remoteVel = { vx, vy, wz, at: clock };
    },
    getWalkingSpeed: () => later(0.35, 100),
    setWalkingSpeed: async (speed) => later(ok(`speed ${speed} m/s`), 100),

    listNodes: () =>
      later([
        "/control_mux_node",
        "/guide_node",
        "/localization_node",
        "/path_follower_node",
        "/planner_node",
        "/rosbridge_websocket",
        "/site_manager_node",
        "/speech_node",
      ]),
    listTopics: () =>
      later([
        { name: "/map", type: "nav_msgs/msg/OccupancyGrid" },
        { name: "/site/pois", type: "molly_interfaces/msg/PoiArray" },
        { name: "/tour/state", type: "molly_interfaces/msg/TourState" },
      ]),
  };

  return {
    api,
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      listener(state);
      return () => {
        listeners.delete(listener);
      };
    },
    tick,
  };
}

let instance: MockRobot | null = null;

/** The single in-memory robot, created on first use. */
export function getMockRobot(): MockRobot {
  if (!instance) instance = createMockRobot();
  return instance;
}
