import styles from "./kinetic-illustration.module.scss";

interface KineticIllustrationProps {
  size?: number;
  className?: string;
}

export function KineticIllustration({
  size = 180,
  className,
}: KineticIllustrationProps) {
  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="88" stroke="#14B8A6" strokeOpacity="0.12" strokeWidth="1" />
        <circle cx="100" cy="100" r="68" stroke="#14B8A6" strokeOpacity="0.18" strokeWidth="1" />

        <ellipse cx="100" cy="100" rx="70" ry="26" stroke="#14B8A6" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 3" />
        <ellipse cx="100" cy="100" rx="26" ry="70" stroke="#14B8A6" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 3" />

        <circle cx="100" cy="100" r="6" fill="#14B8A6" />
        <circle cx="100" cy="100" r="14" stroke="#14B8A6" strokeOpacity="0.4" strokeWidth="1" />

        <circle cx="100" cy="30" r="5" fill="#0D8578" />
        <circle cx="100" cy="170" r="5" fill="#0D8578" />
        <circle cx="30" cy="100" r="5" fill="#0D8578" />
        <circle cx="170" cy="100" r="5" fill="#0D8578" />
      </svg>
    </div>
  );
}
