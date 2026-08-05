import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import styles from "../page.module.css";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={styles.siteShell}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
