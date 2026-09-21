import { useEffect, useRef, useState } from "react";
/*
 * Scroll-reveal primitive shared by the landing page's editorial sections.
 * Reveals once (never re-hides on scroll back up - a deliberate, calm
 * entrance rather than something that replays every time it re-enters
 * view) and resolves to "already visible" outright under
 * prefers-reduced-motion, so nothing depends on motion to be readable.
 */
export const useReveal = (threshold = 0.2) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const node = ref.current;
        if (!node)
            return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold });
        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold]);
    return { ref, visible };
};
