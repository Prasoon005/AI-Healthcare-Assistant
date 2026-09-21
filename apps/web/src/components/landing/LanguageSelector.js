import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
const SUPPORTED_LANGUAGES = [
    { code: "en-US", language: "en" },
    { code: "hi-IN", language: "hi" },
    { code: "es-ES", language: "es" },
    { code: "fr-FR", language: "fr" },
    { code: "de-DE", language: "de" },
];
const DEFAULT_LOCALE = "en-US";
const STORAGE_KEY = "landingLanguage";
const capitalize = (value) => value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
const formatLocaleLabel = (locale) => {
    try {
        const [language, region] = locale.split("-");
        const languageNames = new Intl.DisplayNames([locale], { type: "language" });
        const languageLabel = capitalize(languageNames.of(language) ?? language);
        if (!region)
            return languageLabel;
        const regionNames = new Intl.DisplayNames([locale], { type: "region" });
        const regionLabel = regionNames.of(region) ?? region;
        return `${languageLabel} (${regionLabel})`;
    }
    catch {
        return "English (United States)";
    }
};
const resolveInitialLocale = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored)
            return stored;
    }
    catch {
        // localStorage unavailable - fall through to detection
    }
    try {
        const browserLocales = navigator.languages && navigator.languages.length > 0
            ? navigator.languages
            : [navigator.language];
        for (const candidate of browserLocales) {
            const language = candidate.split("-")[0];
            const isSupported = SUPPORTED_LANGUAGES.some((option) => option.language === language);
            // Keep the browser's own region (e.g. en-GB) rather than forcing it
            // to one of the 5 default regions - only the language family needs
            // to be one we offer in the dropdown.
            if (isSupported)
                return candidate;
        }
    }
    catch {
        // navigator APIs unavailable - fall through to default
    }
    return DEFAULT_LOCALE;
};
const LanguageSelector = () => {
    const [locale, setLocale] = useState(resolveInitialLocale);
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const label = useMemo(() => formatLocaleLabel(locale), [locale]);
    useEffect(() => {
        const handlePointerDown = (event) => {
            if (containerRef.current &&
                !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape")
                setOpen(false);
        };
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    const selectLanguage = (option) => {
        setLocale(option.code);
        setOpen(false);
        try {
            localStorage.setItem(STORAGE_KEY, option.code);
        }
        catch {
            // ignore - selection still applies for this session
        }
    };
    return (_jsxs("div", { className: "landing-lang", ref: containerRef, children: [_jsxs("button", { type: "button", className: "landing-lang-trigger", "aria-haspopup": "listbox", "aria-expanded": open, "aria-label": "Change language", onClick: () => setOpen((prev) => !prev), children: [_jsx(Globe, { size: 13 }), _jsx("span", { children: label }), _jsx(ChevronDown, { size: 13 })] }), open && (_jsx("ul", { className: "landing-lang-menu", role: "listbox", children: SUPPORTED_LANGUAGES.map((option) => (_jsx("li", { children: _jsx("button", { type: "button", role: "option", "aria-selected": locale === option.code, className: `landing-lang-option ${locale === option.code ? "active" : ""}`, onClick: () => selectLanguage(option), children: formatLocaleLabel(option.code) }) }, option.code))) }))] }));
};
export default LanguageSelector;
