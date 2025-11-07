import clsx from "clsx";
import styles from "./loader.module.css";

type LoaderProps = {
  className?: string;
  label?: string;
};

export default function Loader({ className, label = "Loading" }: LoaderProps) {
  return (
    <div
      className={clsx(styles.container, className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={styles.typewriter}>
        <div className={styles.slide}>
          <i />
        </div>
        <div className={styles.paper} />
        <div className={styles.keyboard} />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

