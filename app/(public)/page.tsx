import Image from "next/image";
import heroImage from "@/public/images/top-page.png";
import styles from "../page.module.css";

const newsItems = [
  {
    date: "2026.05.20",
    title: "ZENIX JAPAN OPEN 2026 のエントリーが開始されました",
  },
  {
    date: "2026.05.15",
    title: "JBBF 全日本ボディビル選手権大会の日程を公開しました",
  },
  {
    date: "2026.05.10",
    title: "大会カレンダーを更新しました",
  },
];

const featuredEvents = [
  {
    organization: "ZENIX",
    name: "ZENIX JAPAN OPEN 2026",
    date: "2026.06.15（日）",
    location: "東京都",
    tone: "red",
    position: "58% center",
  },
  {
    organization: "JBBF",
    name: "JBBF 全日本ボディビル選手権大会",
    date: "2026.07.20（月・祝）",
    location: "大阪府",
    tone: "green",
    position: "34% center",
  },
  {
    organization: "IFBB",
    name: "IFBB PRO LEAGUE JAPAN PRO 2026",
    date: "2026.08.10（月）",
    location: "東京都",
    tone: "gold",
    position: "74% center",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m7 4 6 6-6 6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="5" width="14" height="12" rx="1.5" />
      <path d="M6 3v4M14 3v4M3 9h14" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M16 8c0 4.5-6 9-6 9S4 12.5 4 8a6 6 0 1 1 12 0Z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
        <section className={styles.hero} id="top" aria-labelledby="hero-title">
          <Image
            className={styles.heroImage}
            src={heroImage}
            alt="ステージ上で背中のポーズをとるフィットネス競技者"
            fill
            priority
            sizes="100vw"
          />
          <div className={styles.heroShade} />
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <p className={styles.eyebrow}>THE STAGE IS YOURS.</p>
              <h1 id="hero-title">
                JAPAN FITNESS
                <br />
                CONTEST
              </h1>
              <p className={styles.heroLead}>
                日本のフィットネス・ボディビル大会情報を、ここに。
              </p>
              <p className={styles.heroDescription}>
                ZENIX・JBBF・IFBBを中心に、全国の大会日程と開催情報を掲載。
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#featured">
                  大会を探す
                  <ArrowIcon />
                </a>
                <a className={styles.secondaryButton} href="#calendar">
                  <CalendarIcon />
                  カレンダーを見る
                </a>
              </div>
            </div>
          </div>
          <a className={styles.scrollCue} href="#news" aria-label="お知らせへ移動">
            <span>SCROLL</span>
            <i />
          </a>
        </section>

        <section className={styles.newsSection} id="news" aria-labelledby="news-title">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeadingRow}>
              <div>
                <p className={styles.sectionLabel}>LATEST NEWS</p>
                <h2 id="news-title">お知らせ</h2>
              </div>
              <a className={styles.textLink} href="#news">
                すべて見る
                <ArrowIcon />
              </a>
            </div>
            <div className={styles.newsList}>
              {newsItems.map((item) => (
                <a className={styles.newsItem} href="#featured" key={item.date + item.title}>
                  <time dateTime={item.date.replaceAll(".", "-")}>{item.date}</time>
                  <span className={styles.newsBadge}>NEWS</span>
                  <span className={styles.newsTitle}>{item.title}</span>
                  <ArrowIcon />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.featuredSection} id="featured" aria-labelledby="featured-title">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeadingRow}>
              <div>
                <p className={styles.sectionLabel}>FEATURED EVENTS</p>
                <h2 id="featured-title">注目の大会</h2>
              </div>
              <div className={styles.eventSummary} aria-label="今月の公開大会数">
                <span>2026 JUNE</span>
                <strong>12</strong>
                <small>EVENTS</small>
              </div>
            </div>

            <div className={styles.eventGrid}>
              {featuredEvents.map((event, index) => (
                <article className={`${styles.eventCard} ${styles[event.tone]}`} key={event.name}>
                  <div className={styles.cardImageWrap}>
                    <Image
                      className={styles.cardImage}
                      src={heroImage}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 100vw, 33vw"
                      style={{ objectPosition: event.position }}
                    />
                    <div className={styles.cardImageShade} />
                    <span className={styles.organizationTag}>{event.organization}</span>
                    <span className={styles.cardNumber}>0{index + 1}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{event.name}</h3>
                    <div className={styles.eventMeta}>
                      <span><CalendarIcon />{event.date}</span>
                      <span><PinIcon />{event.location}</span>
                    </div>
                    <a href="#contact" aria-label={`${event.name}の詳細を見る`}>
                      詳細を見る
                      <ArrowIcon />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.centerAction} id="calendar">
              <a className={styles.outlineButton} href="#featured">
                すべての大会を見る
                <ArrowIcon />
              </a>
            </div>
          </div>
        </section>
    </>
  );
}
