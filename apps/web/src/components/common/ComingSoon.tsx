import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const ComingSoon = ({ icon: Icon, title, description }: ComingSoonProps) => {
  return (
    <section className="coming-soon-card glass-card">
      <div className="coming-soon-icon">
        <Icon size={26} />
      </div>

      <h2>{title}</h2>
      <p>{description}</p>

      <span className="coming-soon-badge">Coming soon</span>
    </section>
  );
};

export default ComingSoon;
