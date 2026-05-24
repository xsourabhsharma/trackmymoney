import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { v4 as uuidv4 } from 'uuid';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });
type TransactionInsert = typeof schema.transactions.$inferInsert;

async function seed() {
  console.log('Seeding data...');

 
  const userProfiles = await db.select().from(schema.profiles).limit(1);
  let userId: string;

  if (userProfiles.length === 0) {
    console.log('No user profiles found. Creating a test profile...');
    userId = uuidv4();
    await db.insert(schema.profiles).values({
      id: userId,
      email: 'test@example.com',
      fullName: 'Test User',
      currency: 'USD',
      locale: 'en-US',
    });
  } else {
    userId = userProfiles[0].id;
    console.log(`Using existing profile: ${userProfiles[0].email}`);
  }

 
  console.log('Inserting accounts...');
  const accountsData = [
    { id: uuidv4(), userId, name: 'Main Checking', type: 'bank' as const, balance: '5200.50', color: '#3B82F6' },
    { id: uuidv4(), userId, name: 'Credit Card', type: 'credit_card' as const, balance: '-1250.00', color: '#EF4444' },
    { id: uuidv4(), userId, name: 'Savings', type: 'bank' as const, balance: '12500.00', color: '#10B981' },
    { id: uuidv4(), userId, name: 'Investment', type: 'investment' as const, balance: '45000.00', color: '#8B5CF6' }
  ];
  await db.insert(schema.accounts).values(accountsData).onConflictDoNothing();

 
  console.log('Inserting categories...');
  const categoriesData = [
    { id: uuidv4(), userId, name: 'Housing', type: 'expense' as const, isDefault: true, icon: '🏠', color: '#3b82f6' },
    { id: uuidv4(), userId, name: 'Food', type: 'expense' as const, isDefault: true, icon: '🍔', color: '#ef4444' },
    { id: uuidv4(), userId, name: 'Transportation', type: 'expense' as const, isDefault: true, icon: '🚗', color: '#10b981' },
    { id: uuidv4(), userId, name: 'Salary', type: 'income' as const, isDefault: true, icon: '💵', color: '#f59e0b' },
    { id: uuidv4(), userId, name: 'Entertainment', type: 'expense' as const, isDefault: true, icon: '🎬', color: '#8b5cf6' },
  ];
  await db.insert(schema.categories).values(categoriesData).onConflictDoNothing();

 
  console.log('Inserting transactions...');
  const txData: TransactionInsert[] = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const isIncome = Math.random() > 0.8;
    const cat = isIncome ? categoriesData[3] : categoriesData[Math.floor(Math.random() * 3)];
    const acc = accountsData[Math.floor(Math.random() * 2)];
    
    const date = new Date();
    date.setDate(now.getDate() - Math.floor(Math.random() * 30));
    
    txData.push({
      id: uuidv4(),
      userId,
      accountId: acc.id,
      categoryId: cat.id,
      amount: isIncome ? (Math.random() * 2000 + 1000).toFixed(2) : (Math.random() * 100 + 10).toFixed(2),
      currency: 'USD',
      type: isIncome ? 'income' : 'expense',
      merchant: isIncome ? 'Employer Inc' : ['Uber', 'Whole Foods', 'Netflix', 'Amazon', 'Starbucks'][Math.floor(Math.random() * 5)],
      description: 'Test transaction',
      date,
      status: 'cleared',
      source: 'manual'
    });
  }
  await db.insert(schema.transactions).values(txData).onConflictDoNothing();

 
  console.log('Inserting budgets...');
  await db.insert(schema.budgets).values([
    { id: uuidv4(), userId, categoryId: categoriesData[0].id, periodType: 'monthly', periodStart: new Date(now.getFullYear(), now.getMonth(), 1), limitAmount: '2000.00', spent: '1500.00', status: 'active' },
    { id: uuidv4(), userId, categoryId: categoriesData[1].id, periodType: 'monthly', periodStart: new Date(now.getFullYear(), now.getMonth(), 1), limitAmount: '600.00', spent: '450.00', status: 'active' },
  ]).onConflictDoNothing();

 
  console.log('Inserting goals...');
  await db.insert(schema.goals).values([
    { id: uuidv4(), userId, name: 'Emergency Fund', targetAmount: '10000.00', currentAmount: '4500.00', status: 'active', color: '#10B981' },
    { id: uuidv4(), userId, name: 'Vacation', targetAmount: '3000.00', currentAmount: '1200.00', status: 'active', color: '#3B82F6' },
  ]).onConflictDoNothing();

 
  console.log('Inserting subscriptions...');
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  await db.insert(schema.subscriptions).values([
    { id: uuidv4(), userId, merchant: 'Netflix', amount: '15.99', interval: 'monthly', status: 'active', nextChargeDate: nextMonth, categoryId: categoriesData[4].id },
    { id: uuidv4(), userId, merchant: 'Spotify', amount: '9.99', interval: 'monthly', status: 'active', nextChargeDate: nextMonth, categoryId: categoriesData[4].id },
  ]).onConflictDoNothing();

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
