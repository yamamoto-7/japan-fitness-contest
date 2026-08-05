import styles from "../page.module.css";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={styles.logo}>
      <svg
        className={styles.logoMark}
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path d="M7 29 15 21l5 6 4-17 4 17 5-6 8 8-8 8-9-5-9 5Z" />
        <path d="M14 38h20M10 15l7 5M38 15l-7 5" />
      </svg>
      <span className={styles.logoText}>
        <span>JAPAN FITNESS</span>
        {!compact && <span>CONTEST</span>}
      </span>
    </span>
  );
}
