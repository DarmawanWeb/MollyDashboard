# Robot Side

What the robot has to run and expose for the dashboard. The authoritative list of names
and types is Molly's [docs/web.md](https://github.com/DarmawanRobotics/Molly/blob/main/docs/web.md)
(and [interfaces.md](https://github.com/DarmawanRobotics/Molly/blob/main/docs/interfaces.md));
`src/lib/ros/topics.ts` mirrors it. This page is the short version.

## Processes

```bash
ros2 launch molly robot.launch.py web:=true
```

`web:=true` (or `WEB=true` in the robot's env file) starts, next to the robot stack:

| Process | Port | Used for |
|---|---|---|
| `rosbridge_websocket` (+ `rosapi`) | 9090 | every topic and service below |
| `web_video_server` | 8080 | camera MJPEG `/stream?topic=/camera/camera/color/image_raw&type=mjpeg` |

rosbridge only exposes the names of the web contract (`molly_bridge/config/web_params.yaml`).
The dashboard never publishes the driver's `/<robot>/cmd_vel`: teleop goes to
`/bridge/remote_cmd_vel`, through the control mux (e-stop, speed envelope, protective field).
Keep the web ports on the robot's own network.

## Robot Namespace

Driver names live under a namespace, `robot` by default (`/robot/battery`, `/robot/state`,
`/robot/stand_up`). The registry writes them as `/{robot}/…` and the client resolves the
placeholder with the namespace from Settings.

## Subscribed (latched where it matters)

| Topic | Type | Shown in |
|---|---|---|
| `/map` | `nav_msgs/msg/OccupancyGrid` | maps (rows are bottom-up, flipped for the canvas) |
| `/localization/pose`, `/localization/status` | `geometry_msgs/msg/PoseStamped`, `std_msgs/msg/String` | robot on the map, localization |
| `/site/status`, `/site/pois`, `/site/tours` | `SiteStatus`, `PoiArray`, `TourArray` | site, POIs, tours |
| `/mapping/status` | `MappingStatus` | mapping panel |
| `/planner/status`, `/planner/path`, `/navigation/status` | `PlannerStatus`, `nav_msgs/msg/Path`, `NavigationStatus` | walk-to, path on the map |
| `/tour/state` | `TourState` | tour control |
| `/interaction/speech_status`, `/interaction/greeter`, `/interaction/conversation` | `SpeechStatus`, `String` (JSON), `String` (JSON) | speech, greeter, conversation |
| `/perception/visitors` | `Visitors` | visitors on the map and panel |
| `/bridge/mode`, `/bridge/estop_engaged`, `/bridge/estop_reason`, `/bridge/protective_field` | `String`, `Bool`, `String`, `String` | mode, e-stop, field |
| `/health/status`, `/odometry/status` | `String` (JSON), `String` | system page, footer |
| `/{robot}/battery`, `/{robot}/imu`, `/{robot}/state` | `BatteryState`, `Imu`, `lite3_interfaces/msg/RobotState` | robot status |
| `/rosout` | `rcl_interfaces/msg/Log` | log viewer |

`molly_interfaces` types are `molly_interfaces/msg/<Name>` on the wire.

## Published

| Topic | Type | Use |
|---|---|---|
| `/bridge/remote_cmd_vel` | `geometry_msgs/msg/Twist` | hold-to-drive at 10 Hz, zero on release (REMOTE mode only) |
| `/tour/cmd` | `TourCommand` | fallback when `/tour/control` does not answer |

## Services

| Service | Use |
|---|---|
| `/site/list`, `/site/load` | site picker |
| `/mapping/start`, `/mapping/stop`, `/mapping/save` | record a map |
| `/localization/start`, `/localization/record_tags` | localize from a tag, record the tags in view |
| `/site/save_poi`, `/site/delete_poi`, `/site/save_tour`, `/site/delete_tour` | POI and tour editors |
| `/planner/go_to`, `/planner/cancel` | walk to a POI |
| `/tour/control`, `/tour/get_state` | tour commands, state on (re)connect |
| `/interaction/say`, `/interaction/stop_speech`, `/interaction/gesture`, `/interaction/greet`, `/interaction/set_greeter`, `/interaction/ask` | speech, gestures, greeter, conversation |
| `/bridge/set_mode`, `/bridge/estop` | AUTO / REMOTE, software e-stop |
| `/{robot}/stand_up`, `/{robot}/sit_down`, `/{robot}/gait_slow`, `gait_medium`, `gait_fast` | robot actions (`std_srvs/srv/Trigger`) |
| `/path_follower_node/get_parameters`, `/path_follower_node/set_parameters` | walking speed (`target_linear_velocity`) |
| `/rosapi/nodes`, `/rosapi/topics` | system page |

Registered but not used by a page yet: `/planner/plan` (path preview), `/navigation/pause`,
`/interaction/say_text` (quick phrases go through `/interaction/say`) and
`/{robot}/diagnostics`.

## Tour Authority

The robot's guide node owns the tour state machine. The dashboard sends commands with
`/tour/control` (`START` with a `tour_id` or a list of `poi_ids`, `PAUSE`, `RESUME`, `SKIP`,
`STOP`), shows a short optimistic `STARTING` / `STOPPING`, and always takes `/tour/state` as
the truth. A refusal comes back in the service answer and shows as a toast; without an answer
in 3 s the dashboard shows `ERROR`.

## Checking From the Robot

```bash
ros2 topic echo /tour/state --once
ros2 service call /tour/get_state molly_interfaces/srv/GetTourState
ros2 topic echo /bridge/remote_cmd_vel     # while holding a drive key in REMOTE
```
