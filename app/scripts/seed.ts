import bcrypt from "bcryptjs";
import { db, schema } from "../lib/db";

async function main() {
  const existing = await db.select().from(schema.teamMembers).limit(1);
  if (existing.length > 0) {
    console.log(`✓ Team member already exists: ${existing[0].email}`);
    return;
  }

  const email = process.env.SEED_EMAIL ?? "camilla@kundaliniuniversity.com";
  const password = process.env.SEED_PASSWORD ?? "changeme";
  const name = process.env.SEED_NAME ?? "Camilla";

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(schema.teamMembers)
    .values({ email, passwordHash, name, role: "admin" })
    .returning();

  console.log(`✓ Seeded team member: ${user.email} (id: ${user.id})`);
  console.log(`  Default password: ${password}`);
  console.log(`  Change via Session 4 auth flow.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
