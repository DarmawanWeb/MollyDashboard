# Robot-Side Requirements

What needs to exist on the robot (ROS 2 workspace) for the dashboard to function fully. The dashboard talks to the robot over **rosbridge_suite** WebSocket — all interactions are publish/subscribe or service calls.

## Required Packages

### Standard ROS 2

- `rosbridge_suite` — WebSocket bridge (this is the entire communication layer)
- `nav2_bringup` — for `/cmd_vel`, navigation, costmaps
- `slam_toolbox` — for `/map`, SLAM run/save
- `web_video_server` — for camera feeds

### Custom

- `molly_msgs` — see [molly_msgs package](#molly_msgs-package) below
- `tour_fsm` (node, not a package) — see [tour_fsm node](#tour_fsm-node)

## Topics — Subscribed by Dashboard

| Topic | Type | Purpose |
|---|---|---|
| `/map` | `nav_msgs/msg/OccupancyGrid` | SLAM map display |
| `/odom` | `nav_msgs/msg/Odometry` | Robot pose |
| `/imu/data` | `sensor_msgs/msg/Imu` | Orientation, accel |
| `/battery_state` | `sensor_msgs/msg/BatteryState` | Battery telemetry |
| `/camera/color/image_raw/compressed` | `sensor_msgs/msg/CompressedImage` | RGB stream |
| `/camera/depth/image_raw/compressed` | `sensor_msgs/msg/CompressedImage` | Depth stream |
| `/molly/fsm_state` | `std_msgs/msg/String` | Robot's internal FSM (granular) |
| `/tour/state` | `molly_msgs/msg/TourState` | Tour FSM authoritative state |

## Topics — Published by Dashboard

| Topic | Type | Purpose |
|---|---|---|
| `/cmd_vel` | `geometry_msgs/msg/Twist` | Teleop |
| `/molly/fsm_command` | `std_msgs/msg/String` | High-level FSM commands |
| `/molly/motion` | `std_msgs/msg/String` | Motion gestures (wave, bow, etc.) |
| `/tour/cmd` | `molly_msgs/msg/TourCommand` | Tour control intent |
| `/slam_toolbox/start_slam` | `std_msgs/msg/Empty` | SLAM start |
| `/slam_toolbox/stop_slam` | `std_msgs/msg/Empty` | SLAM stop |

## Services

| Service | Type | Purpose |
|---|---|---|
| `/slam_toolbox/save_map` | `slam_toolbox/srv/SaveMap` | Persist current map |
| `/nav2_param_server/set_parameters` | `rcl_interfaces/srv/SetParameters` | Update Nav2 config |
| `/tour/get_state` | `molly_msgs/srv/GetTourState` | Snapshot tour state on (re)connect |

## molly_msgs Package

Custom interfaces for tour FSM. Build skeleton:

```
molly_msgs/
├── CMakeLists.txt
├── package.xml
├── msg/
│   ├── TourCommand.msg
│   └── TourState.msg
└── srv/
    └── GetTourState.srv
```

A ready-to-build package is bundled separately. Drop into `~/ros2_ws/src/` and:

```bash
cd ~/ros2_ws
colcon build --packages-select molly_msgs
source install/setup.bash
```

Verify:

```bash
ros2 interface show molly_msgs/msg/TourState
ros2 interface show molly_msgs/msg/TourCommand
ros2 interface show molly_msgs/srv/GetTourState
```

## tour_fsm Node

Owns the authoritative tour state machine. Implementation responsibilities:

1. **Hold current state** as a member variable, defaulting to `STATE_IDLE`
2. **Subscribe** `/tour/cmd`:
   - Validate transition (see matrix below)
   - If valid: transition through pending state (`STARTING`/`STOPPING`) where applicable, execute primitives (nav2 goal, narration, motion), then land in terminal state
   - If invalid: silently ignore but **still republish current state** so dashboard reconciles
3. **Publish** `/tour/state` on every state change (recommended QoS: reliable, depth 1, transient_local so late-joining subscribers get last value)
4. **Implement** `/tour/get_state` service — returns the last-published state

### Transition Matrix

| Current state | START | PAUSE | RESUME | STOP | SKIP |
|---|---|---|---|---|---|
| IDLE | → STARTING | reject | reject | reject | reject |
| STARTING | reject | reject | reject | → STOPPING | reject |
| RUNNING | reject | → PAUSED | reject | → STOPPING | (no state change, advance idx) |
| PAUSED | reject | reject | → RUNNING | → STOPPING | reject |
| STOPPING | reject | reject | reject | reject | reject |
| ERROR | → STARTING | reject | reject | → IDLE | reject |

### Skeleton (Python)

```python
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy
from std_msgs.msg import Header
from molly_msgs.msg import TourState, TourCommand
from molly_msgs.srv import GetTourState


class TourFsm(Node):
    def __init__(self):
        super().__init__("tour_fsm")

        self.state = TourState()
        self.state.state = TourState.STATE_IDLE
        self.state.current_poi_index = -1
        self.poi_ids = []

        qos = QoSProfile(
            reliability=ReliabilityPolicy.RELIABLE,
            durability=DurabilityPolicy.TRANSIENT_LOCAL,
            depth=1,
        )
        self.state_pub = self.create_publisher(TourState, "/tour/state", qos)
        self.create_subscription(TourCommand, "/tour/cmd", self.on_cmd, 10)
        self.create_service(GetTourState, "/tour/get_state", self.on_get_state)

        self.publish_state()

    def on_cmd(self, msg: TourCommand):
        if not self.can_transition(msg.kind):
            self.publish_state()  # republish so dashboard reconciles
            return
        # ... transition + execute primitives
        self.publish_state()

    def on_get_state(self, _req, res):
        res.state = self.state
        return res

    def publish_state(self):
        self.state.header = Header()
        self.state.header.stamp = self.get_clock().now().to_msg()
        self.state_pub.publish(self.state)

    def can_transition(self, kind: int) -> bool:
        # Implement matrix above
        ...


def main():
    rclpy.init()
    rclpy.spin(TourFsm())


if __name__ == "__main__":
    main()
```

### Integration with Nav2 / TTS / Motion

When transitioning into `RUNNING`, the node should orchestrate:

- **`navigating`** — send `NavigateToPose` action to nav2 with the current POI's pose
- **`narrating`** — call TTS service or publish to TTS topic with POI's `narration_text`
- **`performing_motion`** — execute motion (wave, bow, etc.) based on POI's `motion_action`

Activity changes also republish `/tour/state` with updated `activity` field. Dashboard reflects these as status hints.

## Camera Streams

`web_video_server` publishes MJPEG over HTTP. Dashboard's `<CameraFeed>` consumes:

```
http://${VIDEO_SERVER_URL}/stream?topic=/camera/color/image_raw
```

Make sure the host running web_video_server is reachable from the dashboard host (CORS / firewall).

## Recommended QoS Settings

| Topic | Reliability | Durability | Depth | Notes |
|---|---|---|---|---|
| `/map` | reliable | transient_local | 1 | Latched so late subscribers get current map immediately |
| `/odom` | best_effort | volatile | 10 | High-rate, occasional drops OK |
| `/tour/state` | reliable | transient_local | 1 | Critical — late join must get current state |
| `/tour/cmd` | reliable | volatile | 10 | Critical |
| `/cmd_vel` | best_effort | volatile | 1 | Watchdog will zero on stale anyway |

## Network Setup

Dashboard connects via WebSocket. Default rosbridge runs on port 9090:

```bash
# On robot:
ros2 launch rosbridge_server rosbridge_websocket_launch.xml port:=9090
```

If accessing from a different machine, set `ROS_DOMAIN_ID` consistently and ensure port 9090 is open. The dashboard's connection settings (`/settings` → Connection) can point to any reachable rosbridge host — `ws://192.168.1.120:9090` for LAN deploys.

## Testing the Wire from CLI

Useful smoke tests without the dashboard:

```bash
# Verify rosbridge is up
curl -i http://your-robot:9090
# Should return 426 Upgrade Required (means WS is listening)

# Watch what dashboard sends:
ros2 topic echo /tour/cmd
ros2 topic echo /cmd_vel

# Send a fake state to dashboard:
ros2 topic pub /tour/state molly_msgs/msg/TourState "{...}" --once

# Test service:
ros2 service call /tour/get_state molly_msgs/srv/GetTourState "{}"
```
