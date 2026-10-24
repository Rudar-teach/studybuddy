import { avatarColor, avatarInitials, cn } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  email?: string;
  seed?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

/** Deterministic color+initials avatar — no storage needed. */
export function Avatar({ name, email, seed, size = "md", className }: AvatarProps) {
  const label = name || email || seed || "?";
  const seedStr = seed || email || label;
  const color = avatarColor(seedStr);
  const initials = avatarInitials(name || email || label);

  return (
    <div
      title={name}
      className={`flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white flex-shrink-0 ${color} ${SIZES[size]} ${className || ""}`}
    >
      {initials}
    </div>
  );
}
