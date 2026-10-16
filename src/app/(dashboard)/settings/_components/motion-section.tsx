"use client";

import { Bot, Play } from "lucide-react";
import { MollyButton } from "@/components/ui/molly";
import { getRos, TOPICS } from "@/lib/ros";
import { MOTION_ACTIONS } from "../_data/options";
import { SettingsSection } from "./settings-section";

export function MotionSection() {
  const test = (motion: string) => {
    getRos().publish(TOPICS.MOTION, { data: motion });
  };

  return (
    <SettingsSection
      icon={<Bot size={18} />}
      title="Motion Expressions"
      iconColor="text-green"
    >
      <ul className="flex flex-col gap-1.5">
        {MOTION_ACTIONS.map((motion) => (
          <li
            key={motion}
            className="panel-inset px-3 py-2 flex items-center justify-between"
          >
            <span className="capitalize text-sm">{motion}</span>
            <MollyButton variant="ghost" size="xs" onClick={() => test(motion)}>
              <Play size={10} /> Test
            </MollyButton>
          </li>
        ))}
      </ul>
    </SettingsSection>
  );
}
