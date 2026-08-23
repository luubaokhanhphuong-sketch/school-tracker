import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Reveal({ children, as: Tag = "div", className, stagger = 0.07, y = 18 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.children;
    if (REDUCED || els.length === 0) return;
    const tween = gsap.fromTo(
      els,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger,
        ease: "power3.out",
        overwrite: true,
      }
    );
    return () => {
      tween.kill();
      gsap.set(els, { clearProps: "all" });
    };
  }, [stagger, y]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

export function usePageEnter() {
  const ref = useRef(null);
  useEffect(() => {
    if (REDUCED || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return ref;
}