import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.7rem] font-mono uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "border-glass-border bg-glass-bg text-ivory-dim",
        gold: "border-gold/40 bg-gold/10 text-gold-soft",
        sage: "border-sage-bright/40 bg-sage/20 text-sage-mist",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
