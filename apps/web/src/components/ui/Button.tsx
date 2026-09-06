import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const Button = ({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-white text-black hover:scale-[1.02] hover:bg-zinc-200",
    secondary:
      "border border-white/10 bg-white/5 text-white hover:bg-white/10",
    ghost:
      "text-zinc-400 hover:bg-white/5 hover:text-white",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;