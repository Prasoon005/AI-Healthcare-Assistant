import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({
  label,
  error,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}

      <input
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 transition-all focus:border-white/30 focus:bg-white/[0.07] ${className}`}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;