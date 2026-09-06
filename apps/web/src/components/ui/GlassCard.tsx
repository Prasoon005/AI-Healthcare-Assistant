import type { HTMLAttributes } from "react";

const GlassCard = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;