import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './index';
import { profiles, goals, accounts, categories } from './schema';

async function main() {
  const allProfiles = await db.select().from(profiles);
  console.log('Profiles in DB:', allProfiles);

  // If there are duplicate emails, we should delete them to let Drizzle push pass.
  // We can group by email and delete the ones that were created later.
  const emailCounts = new Map<string, any[]>();
  for (const p of allProfiles) {
    if (!emailCounts.has(p.email)) emailCounts.set(p.email, []);
    emailCounts.get(p.email)!.push(p);
  }

  for (const [email, userProfiles] of emailCounts.entries()) {
    if (userProfiles.length > 1) {
      console.log(`Found duplicate profiles for ${email}`);
      // Sort by createdAt ascending so we keep the oldest one
      userProfiles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const toDelete = userProfiles.slice(1);
      
      const { eq, inArray } = await import('drizzle-orm');
      
      for (const p of toDelete) {
        console.log(`Deleting duplicate profile ID: ${p.id}`);
        // We'll have to manually write clean up logic if needed, but for now just log it.
        // Uncomment to delete:
        // await db.delete(profiles).where(eq(profiles.id, p.id));
      }
    }
  }

  process.exit(0);
}
main().catch(console.error);
