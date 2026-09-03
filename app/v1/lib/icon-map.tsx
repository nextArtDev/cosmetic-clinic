import {
  HeartPulse,
  Sparkles,
  Baby,
  Bone,
  Stethoscope,
  BrainCircuit,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  HeartPulse,
  Sparkles,
  Baby,
  Bone,
  Stethoscope,
  BrainCircuit,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = iconMap[name] ?? Stethoscope;
  return <Cmp className={className} />;
}
