"use client";

import { useTheme } from "@/context/theme-context";
import React from "react";
import { FaPlane } from "react-icons/fa";
import styles from "./theme-switch.module.css";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <label
      className={`${styles.switch} fixed bottom-5 right-5 z-50 drop-shadow-lg`}
      aria-label="Toggle color theme"
      role="switch"
      aria-checked={theme === "light"}
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "Space" ||
          event.key === "Spacebar"
        ) {
          event.preventDefault();
          toggleTheme();
        }
      }}
    >
      <input
        type="checkbox"
        checked={theme === "light"}
        onChange={toggleTheme}
      />
      <div>
        <span className={styles["street-middle"]} />
        <span className={styles.cloud} />
        <span className={`${styles.cloud} ${styles.two}`} />
        <div>
          <FaPlane aria-hidden="true" focusable="false" />
        </div>
      </div>
    </label>
  );
}
