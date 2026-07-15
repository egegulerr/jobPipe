"use client";

import { useRef, useEffect, type TextareaHTMLAttributes } from "react";

type AutoHeightTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutoHeightTextarea(props: AutoHeightTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const adjust = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };

    adjust();

    el.addEventListener("input", adjust);
    return () => el.removeEventListener("input", adjust);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);

  return <textarea ref={ref} {...props} />;
}
