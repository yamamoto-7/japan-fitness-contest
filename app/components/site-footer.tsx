import Link from "next/link";
import styles from "../page.module.css";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <Logo />
          <p>
            日本のフィットネス・ボディビル大会情報をまとめた非公式サイトです。
          </p>
        </div>
        <div className={styles.footerLinks}>
          <div>
            <h3>メニュー</h3>
            <Link href="/#top">ホーム</Link>
            <Link href="/#featured">大会一覧</Link>
            <Link href="/events">カレンダー</Link>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <span>© 2026 Japan Fitness Contest. All Rights Reserved.</span>
        <span>UNOFFICIAL FITNESS MEDIA</span>
      </div>
    </footer>
  );
}
