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
 */
export default function MonitorPage() {
  return (
    <div className="flex h-full w-full min-h-0">
      <AppSidebar side="left" width="w-[280px]">
        <AppSection title="Camera" icon={<Camera size={16} />}>
          <CameraFeed label="Front" />
        </AppSection>
        <AppSection
          title="Robot Status"
          icon={<ChartNoAxesColumnIncreasing size={16} />}
        >
          <RobotStatus />
        </AppSection>
        <AppSection title="Walk To" icon={<Navigation size={16} />}>
          <GoToPanel />
        </AppSection>
      </AppSidebar>

      <div className="flex-1 p-3 min-w-0">
        <RobotMap />
      </div>

      <AppSidebar width="w-[320px]">
        <AppSection title="Tour Control" icon={<MapIcon size={16} />}>
          <TourControl />
        </AppSection>
        <AppSection title="Speech" icon={<Volume2 size={16} />}>
          <SpeechPanel />
        </AppSection>
        <AppSection title="Visitors" icon={<Users size={16} />}>
          <VisitorPanel />
        </AppSection>
        <AppSection title="Conversation" icon={<MessageSquare size={16} />}>
          <ConversationPanel />
        </AppSection>
      </AppSidebar>
    </div>
  );
}
