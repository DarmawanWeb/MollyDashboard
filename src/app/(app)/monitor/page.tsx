"use client";
import {
  Camera,
  ChartNoAxesColumnIncreasing,
  MapIcon,
  MessageSquare,
  Navigation,
  Users,
  Volume2,
} from "lucide-react";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";
import { RobotMap } from "@/components/map/robot-map";
import { CameraFeed } from "@/components/robot";
import { ConversationPanel } from "./_components/conversation-panel";
import { GoToPanel } from "./_components/go-to-panel";
import { RobotStatus } from "./_components/robot-status";
import { SpeechPanel } from "./_components/speech-panel";
import { TourControl } from "./_components/tour-control";
import { VisitorPanel } from "./_components/visitor-panel";

/**
 * Operator view during a tour: the robot and where it walks on the left
 * and center, the tour and everything Molly says and hears on the right.
 * Wide: three columns that each scroll; narrow: the map first, then the
 * cards.
 */
export default function MonitorPage() {
  return (
    <div className="@container flex min-h-0 flex-1 flex-col overflow-y-auto @5xl:overflow-hidden">
      <div className="grid grid-cols-1 gap-3 p-3 lg:gap-4 lg:p-4 @2xl:grid-cols-2 @5xl:min-h-0 @5xl:flex-1 @5xl:grid-cols-[18rem_minmax(0,1fr)_22rem] @5xl:grid-rows-[minmax(0,1fr)]">
        <div className="order-first h-[60vh] min-h-[22rem] @2xl:col-span-2 @5xl:order-none @5xl:col-span-1 @5xl:col-start-2 @5xl:row-start-1 @5xl:h-auto @5xl:min-h-0">
          <RobotMap className="rounded-xl" />
        </div>

        <AppSidebar className="@5xl:col-start-1 @5xl:row-start-1">
          <AppSection title="Camera" icon={<Camera />}>
            <CameraFeed label="Front" className="rounded-xl" />
          </AppSection>
          <AppSection
            title="Robot status"
            icon={<ChartNoAxesColumnIncreasing />}
          >
            <RobotStatus />
          </AppSection>
          <AppSection title="Walk to" icon={<Navigation />}>
            <GoToPanel />
          </AppSection>
        </AppSidebar>

        <AppSidebar className="@5xl:col-start-3 @5xl:row-start-1">
          <AppSection title="Tour control" icon={<MapIcon />}>
            <TourControl />
          </AppSection>
          <AppSection title="Speech" icon={<Volume2 />}>
            <SpeechPanel />
          </AppSection>
          <AppSection title="Visitors" icon={<Users />}>
            <VisitorPanel />
          </AppSection>
          <AppSection title="Ask Molly" icon={<MessageSquare />}>
            <ConversationPanel />
          </AppSection>
        </AppSidebar>
      </div>
    </div>
  );
}
