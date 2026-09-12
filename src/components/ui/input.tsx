import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      suppressHydrationWarning
      className={cn(
        "h-11 w-full rounded-xl bg-surface-2 px-3.5 text-sm text-fg",
        "ring-1 ring-border placeholder:text-faint",
        "outline-none transition-[box-shadow,background-color] duration-150",
        "focus-visible:ring-2 focus-visible:ring-primary/70",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
