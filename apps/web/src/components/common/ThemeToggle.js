import { jsx as _jsx } from "react/jsx-runtime";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
const ThemeToggle = ({ className = "landing-theme-toggle" }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    return (_jsx("button", { type: "button", className: className, onClick: toggleTheme, "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode", title: isDark ? "Switch to light mode" : "Switch to dark mode", children: isDark ? _jsx(Sun, { size: 14 }) : _jsx(Moon, { size: 14 }) }));
};
export default ThemeToggle;
