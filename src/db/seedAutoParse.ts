import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('Seeding AI Auto-Parse data for demotest@gmail.com...');

  const userProfiles = await db.select().from(schema.profiles).where(eq(schema.profiles.email, 'demotest@gmail.com')).limit(1);

  if (userProfiles.length === 0) {
    console.error('No user found with email demotest@gmail.com.');
    process.exit(1);
  }

  const userId = userProfiles[0].id;
  
 
  console.log('Cleaning existing import jobs...');
  await db.delete(schema.importRows).where(eq(schema.importRows.userId, userId));
  await db.delete(schema.importJobs).where(eq(schema.importJobs.userId, userId));

 
  const categories = await db.select().from(schema.categories).where(eq(schema.categories.userId, userId));
  
  const catGroceries = categories.find(c => c.name === 'Groceries');
  const catDining = categories.find(c => c.name === 'Dining Out');
  const catTransport = categories.find(c => c.name === 'Transportation');
  const catHousing = categories.find(c => c.name === 'Housing');

  if (!catGroceries || !catDining) {
    console.error('Required categories not found for user.');
    process.exit(1);
  }

  const now = new Date();

 
  console.log('Inserting CSV Import Job...');
  const csvJobId = uuidv4();
  await db.insert(schema.importJobs).values({
    id: csvJobId,
    userId,
    status: 'ready_for_review',
    source: 'csv',
    filePath: 'uploads/demo-bank-statement-aug.csv',
    rowCount: 4,
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
    updatedAt: now,
  });

  const csvRows = [
    {
      id: uuidv4(),
      importJobId: csvJobId,
      userId,
      rawRow: { Date: '2026-03-20', Description: 'UBER *TRIP NYC', Amount: '-24.50' },
      parsedDate: new Date('2026-03-20'),
      parsedDescription: 'UBER *TRIP NYC',
      parsedAmount: '24.50',
      parsedCurrency: 'USD',
      parsedType: 'expense',
      parsedMerchant: 'Uber',
      parsedCategoryId: catTransport?.id || null,
      aiConfidence: '0.96',
      aiPayload: { reasoning: "Identified 'UBER' as a transportation/rideshare merchant." },
      isSelectedForImport: true,
      hasError: false,
    },
    {
      id: uuidv4(),
      importJobId: csvJobId,
      userId,
      rawRow: { Date: '2026-03-21', Description: 'TARGET STORE #1042', Amount: '-114.20' },
      parsedDate: new Date('2026-03-21'),
      parsedDescription: 'TARGET STORE #1042',
      parsedAmount: '114.20',
      parsedCurrency: 'USD',
      parsedType: 'expense',
      parsedMerchant: 'Target',
      parsedCategoryId: catGroceries?.id || null,
      aiConfidence: '0.88',
      aiPayload: { reasoning: "'Target' can be groceries or shopping. Defaulted to Groceries based on typical user behavior." },
      isSelectedForImport: true,
      hasError: false,
    },
    {
      id: uuidv4(),
      importJobId: csvJobId,
      userId,
      rawRow: { Date: '2026-03-22', Description: 'SQ *LOCAL COFFEE ROAST', Amount: '-6.50' },
      parsedDate: new Date('2026-03-22'),
      parsedDescription: 'SQ *LOCAL COFFEE ROAST',
      parsedAmount: '6.50',
      parsedCurrency: 'USD',
      parsedType: 'expense',
      parsedMerchant: 'Local Coffee Roasters',
      parsedCategoryId: catDining?.id || null,
      aiConfidence: '0.92',
      aiPayload: { reasoning: "Square payment for a coffee shop categorized as Dining Out." },
      isSelectedForImport: true,
      hasError: false,
    },
    {
      id: uuidv4(),
      importJobId: csvJobId,
      userId,
      rawRow: { Date: '2026-03-23', Description: 'UNKNOWN XFER 9901', Amount: '-500.00' },
      parsedDate: new Date('2026-03-23'),
      parsedDescription: 'UNKNOWN XFER 9901',
      parsedAmount: '500.00',
      parsedCurrency: 'USD',
      parsedType: 'transfer',
      parsedMerchant: 'Unknown Transfer',
      parsedCategoryId: null,
      aiConfidence: '0.45',
      aiPayload: { reasoning: "Ambiguous description. AI could not reliably determine category; categorized as transfer with low confidence." },
      hasError: true,
      errorMessage: "Category could not be determined automatically.",
      isSelectedForImport: false,
    }
  ];

  await db.insert(schema.importRows).values(csvRows);

 
  console.log('Inserting Receipt Import Job...');
  const receiptJobId = uuidv4();
  await db.insert(schema.importJobs).values({
    id: receiptJobId,
    userId,
    status: 'ready_for_review',
    source: 'receipt',
    filePath: 'scans/receipt-wholefoods-mar.jpg',
    rowCount: 2,
    createdAt: new Date(now.getTime() - 1000 * 60 * 30),
    updatedAt: now,
  });

  const receiptRows = [
    {
      id: uuidv4(),
      importJobId: receiptJobId,
      userId,
      rawRow: { "OCR_Text": "WHOLE FOODS MARKET\\nTOTAL $84.22" },
      parsedDate: new Date('2026-03-26'),
      parsedDescription: 'Whole Foods Market Grocery Run',
      parsedAmount: '84.22',
      parsedCurrency: 'USD',
      parsedType: 'expense',
      parsedMerchant: 'Whole Foods',
      parsedCategoryId: catGroceries?.id || null,
      aiConfidence: '0.98',
      aiPayload: { reasoning: "OCR specifically extracted 'WHOLE FOODS MARKET' and matching TOTAL. High confidence grocery expense." },
      isSelectedForImport: true,
      hasError: false,
    },
    {
      id: uuidv4(),
      importJobId: receiptJobId,
      userId,
      rawRow: { "OCR_Text": "HD SUPPLY\\nPLUMBING PARTS\\nTOTAL $12.50" },
      parsedDate: new Date('2026-03-26'),
      parsedDescription: 'Home Depot Plumbing Parts',
      parsedAmount: '12.50',
      parsedCurrency: 'USD',
      parsedType: 'expense',
      parsedMerchant: 'Home Depot',
      parsedCategoryId: catHousing?.id || null,
      aiConfidence: '0.85',
      aiPayload: { reasoning: "Identified 'HD SUPPLY' and 'PLUMBING' mapped to Home Repair / Housing." },
      isSelectedForImport: true,
      hasError: false,
    }
  ];

  await db.insert(schema.importRows).values(receiptRows);

  console.log('Successfully seeded AI Auto-Parse data!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Auto-Parse seeding failed:', err);
  process.exit(1);
});
