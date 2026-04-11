import { getDatabaseClient, isDatabaseConfigured } from "./database";
import { getDefaultSiteContent, normalizeSiteContent } from "./site-content-shared";

let siteContentReadyPromise;

async function ensureSiteContentReady() {
  if (!isDatabaseConfigured()) {
    return;
  }

  if (!siteContentReadyPromise) {
    const sql = getDatabaseClient();

    siteContentReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS site_content (
          id TEXT PRIMARY KEY,
          content JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      const [row] = await sql`
        SELECT id
        FROM site_content
        WHERE id = 'homepage'
      `;

      if (!row) {
        await sql`
          INSERT INTO site_content (id, content)
          VALUES ('homepage', ${JSON.stringify(getDefaultSiteContent())})
        `;
      }
    })();
  }

  return siteContentReadyPromise;
}

export async function getSiteContent() {
  if (!isDatabaseConfigured()) {
    return getDefaultSiteContent();
  }

  await ensureSiteContentReady();
  const sql = getDatabaseClient();
  const [row] = await sql`
    SELECT content
    FROM site_content
    WHERE id = 'homepage'
  `;

  return normalizeSiteContent(row?.content ?? {});
}

export async function saveSiteContent(content) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database connection is not configured.");
  }

  await ensureSiteContentReady();
  const normalizedContent = normalizeSiteContent(content);
  const sql = getDatabaseClient();

  await sql`
    INSERT INTO site_content (id, content, updated_at)
    VALUES ('homepage', ${JSON.stringify(normalizedContent)}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      updated_at = NOW()
  `;

  return normalizedContent;
}
