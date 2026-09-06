import { HeartPulse } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
        <HeartPulse size={20} />
      </div>

      <span className="text-lg font-semibold tracking-tight text-white">
        HealthAI
      </span>
    </div>
  );
};

export default Logo;