import { KineticIllustration } from "@/components/auth/kinetic-illustration";
import styles from "./brand-panel.module.scss";

interface BrandPanelProps {
  clinicName?: string;
  heading?: string;
  description?: string;
}

export function BrandPanel({
  clinicName = "Kathmandu Central Clinic",
  heading = "Empowering Physical Recovery",
  description = "High-throughput patient management, musculoskeletal scheduling, and precision telemetry in one terminal.",
}: BrandPanelProps) {
  return (
    <div className={styles.panel}>
      <span className={styles.pill}>
        <span className={styles.dot} />
        {clinicName}
      </span>

      <div className={styles.illustrationWrap}>
        <KineticIllustration size={180} />
      </div>

      <h2 className={styles.heading}>{heading}</h2>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
