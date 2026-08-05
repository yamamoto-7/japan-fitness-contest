import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const seedEvents = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "サンプル・フィットネス東京大会 2026",
    organization: "SAMPLE FITNESS",
    startDate: "2026-08-23",
    endDate: "2026-08-23",
    location: "東京都（開発用会場）",
    officialUrl: "https://example.com/events/tokyo-2026",
    description: "開発環境での表示・操作確認に使用するサンプル大会です。",
    isPublished: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "サンプル・ボディメイク大阪大会 2026",
    organization: "DEMO PHYSIQUE",
    startDate: "2026-09-12",
    endDate: "2026-09-13",
    location: "大阪府（開発用会場）",
    officialUrl: "https://example.com/events/osaka-2026",
    description: "複数日開催を確認するための開発用データです。",
    isPublished: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "サンプル・フィジーク名古屋大会 2026",
    organization: "SAMPLE FITNESS",
    startDate: "2026-10-04",
    endDate: "2026-10-04",
    location: "愛知県（開発用会場）",
    officialUrl: null,
    description: "公式URL未登録状態を確認するための開発用データです。",
    isPublished: false,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "サンプル・ボディビル福岡大会 2026",
    organization: "TEST BODYBUILDING",
    startDate: "2026-11-15",
    endDate: "2026-11-15",
    location: "福岡県（開発用会場）",
    officialUrl: "https://example.com/events/fukuoka-2026",
    description: null,
    isPublished: false,
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    name: "サンプル・フィットネス横浜大会 2027",
    organization: "DEMO PHYSIQUE",
    startDate: "2027-01-17",
    endDate: "2027-01-17",
    location: "神奈川県（開発用会場）",
    officialUrl: "https://example.com/events/yokohama-2027",
    description: "翌年表示を確認するための開発用データです。",
    isPublished: true,
  },
] as const;

async function seed() {
  const { databaseClient, db, events } = await import("./client");

  try {
    await db.transaction(async (tx) => {
      for (const event of seedEvents) {
        await tx
          .insert(events)
          .values(event)
          .onConflictDoUpdate({
            target: events.id,
            set: {
              name: event.name,
              organization: event.organization,
              startDate: event.startDate,
              endDate: event.endDate,
              location: event.location,
              officialUrl: event.officialUrl,
              description: event.description,
              isPublished: event.isPublished,
              updatedAt: new Date(),
            },
          });
      }
    });

    console.log(`Seeded ${seedEvents.length} development events.`);
  } finally {
    await databaseClient.end();
  }
}

seed().catch((error) => {
  console.error("Failed to seed development events.", error);
  process.exitCode = 1;
});
