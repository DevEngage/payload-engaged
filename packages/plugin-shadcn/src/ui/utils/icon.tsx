// "use client";

import type { LucideIcon } from "lucide-react";
import { icons } from "lucide-react";

export type IconName = keyof typeof icons;

export const Icon = ({
  name,
  color,
  size,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) => {
  const LucideIcon: LucideIcon = icons[name as keyof typeof icons];

  return (
    <div>
      <LucideIcon color={color} size={size} />
    </div>
  );
};

export default Icon;
