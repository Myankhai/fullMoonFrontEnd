import * as React from "react";

const badgeVariants = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-slate-700 text-slate-200 hover:bg-slate-700/80",
  destructive: "bg-red-500/20 text-red-400 border border-red-500/50",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${badgeVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export { Badge, badgeVariants }; 