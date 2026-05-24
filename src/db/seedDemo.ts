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
type TransactionInsert = typeof schema.transactions.$inferInsert;

async function seed() {
  console.log('Seeding data for demotest@gmail.com...');

 
  const userProfiles = await db.select().from(schema.profiles).where(eq(schema.profiles.email, 'demotest@gmail.com')).limit(1);

  if (userProfiles.length === 0) {
    console.error('No user found with email demotest@gmail.com. Please make sure you registered it.');
    process.exit(1);
  }

  const userId = userProfiles[0].id;
  console.log(`Found user: ${userId}`);

 
  console.log('Cleaning existing data...');
  await db.delete(schema.transactions).where(eq(schema.transactions.userId, userId));
  await db.delete(schema.budgets).where(eq(schema.budgets.userId, userId));
  await db.delete(schema.goals).where(eq(schema.goals.userId, userId));
  await db.delete(schema.subscriptions).where(eq(schema.subscriptions.userId, userId));
  await db.delete(schema.debts).where(eq(schema.debts.userId, userId));
  await db.delete(schema.accounts).where(eq(schema.accounts.userId, userId));
  await db.delete(schema.categories).where(eq(schema.categories.userId, userId));

 
  console.log('Inserting accounts...');
  const accountsData = [
    { id: uuidv4(), userId, name: 'Chase Checking', type: 'bank' as const, balance: '6420.50', color: '#1E3A8A' },
    { id: uuidv4(), userId, name: 'Chase Savings', type: 'bank' as const, balance: '15200.00', color: '#10B981' },
    { id: uuidv4(), userId, name: 'Amex Gold', type: 'credit_card' as const, balance: '-1240.25', color: '#B45309' },
    { id: uuidv4(), userId, name: 'Fidelity Inv', type: 'investment' as const, balance: '42500.00', color: '#8B5CF6' }
  ];
  await db.insert(schema.accounts).values(accountsData);

 
  console.log('Inserting categories...');
  const catHousing = { id: uuidv4(), userId, name: 'Housing', type: 'expense' as const, isDefault: true, icon: 'home', color: '#3b82f6' };
  const catGroceries = { id: uuidv4(), userId, name: 'Groceries', type: 'expense' as const, isDefault: true, icon: 'groceries', color: '#10b981' };
  const catDining = { id: uuidv4(), userId, name: 'Dining Out', type: 'expense' as const, isDefault: true, icon: 'dining', color: '#f59e0b' };
  const catTransport = { id: uuidv4(), userId, name: 'Transportation', type: 'expense' as const, isDefault: true, icon: 'transport', color: '#6366f1' };
  const catShopping = { id: uuidv4(), userId, name: 'Shopping', type: 'expense' as const, isDefault: true, icon: 'shopping', color: '#ec4899' };
  const catUtilities = { id: uuidv4(), userId, name: 'Utilities', type: 'expense' as const, isDefault: true, icon: 'utilities', color: '#eab308' };
  const catSubs = { id: uuidv4(), userId, name: 'Subscriptions', type: 'expense' as const, isDefault: true, icon: 'subscriptions', color: '#d946ef' };
  const catSalary = { id: uuidv4(), userId, name: 'Salary', type: 'income' as const, isDefault: true, icon: 'salary', color: '#10b981' };
  const catBonus = { id: uuidv4(), userId, name: 'Bonus', type: 'income' as const, isDefault: true, icon: 'bonus', color: '#f59e0b' };

  const categoriesData = [catHousing, catGroceries, catDining, catTransport, catShopping, catUtilities, catSubs, catSalary, catBonus];
  await db.insert(schema.categories).values(categoriesData);

 
  console.log('Inserting transactions...');
  const txData: TransactionInsert[] = [];
  const now = new Date();
  
 
  for (let m = 0; m < 4; m++) {
    txData.push({ id: uuidv4(), userId, accountId: accountsData[0].id, categoryId: catSalary.id, amount: '3250.00', currency: 'USD', type: 'income', merchant: 'Tech Corp Inc.', date: new Date(now.getFullYear(), now.getMonth() - m, 1), status: 'cleared', source: 'manual' });
    txData.push({ id: uuidv4(), userId, accountId: accountsData[0].id, categoryId: catSalary.id, amount: '3250.00', currency: 'USD', type: 'income', merchant: 'Tech Corp Inc.', date: new Date(now.getFullYear(), now.getMonth() - m, 15), status: 'cleared', source: 'manual' });
   
    txData.push({ id: uuidv4(), userId, accountId: accountsData[0].id, categoryId: catHousing.id, amount: '2100.00', currency: 'USD', type: 'expense', merchant: 'Downtown Apartments', date: new Date(now.getFullYear(), now.getMonth() - m, 2), status: 'cleared', source: 'manual' });
   
    txData.push({ id: uuidv4(), userId, accountId: accountsData[0].id, categoryId: catUtilities.id, amount: '125.50', currency: 'USD', type: 'expense', merchant: 'City Water & Power', date: new Date(now.getFullYear(), now.getMonth() - m, 5), status: 'cleared', source: 'manual' });
    txData.push({ id: uuidv4(), userId, accountId: accountsData[0].id, categoryId: catUtilities.id, amount: '75.00', currency: 'USD', type: 'expense', merchant: 'Comcast Internet', date: new Date(now.getFullYear(), now.getMonth() - m, 8), status: 'cleared', source: 'manual' });
  }

 
  const merchants = [
    { name: 'Whole Foods', cat: catGroceries, min: 40, max: 150 },
    { name: "Trader Joe's", cat: catGroceries, min: 30, max: 90 },
    { name: 'Starbucks', cat: catDining, min: 4, max: 12 },
    { name: 'Chipotle', cat: catDining, min: 12, max: 25 },
    { name: 'Sweetgreen', cat: catDining, min: 15, max: 22 },
    { name: 'Uber', cat: catTransport, min: 10, max: 40 },
    { name: 'Shell Gas', cat: catTransport, min: 30, max: 60 },
    { name: 'Amazon', cat: catShopping, min: 15, max: 110 },
    { name: 'Target', cat: catShopping, min: 25, max: 85 },
    { name: 'Apple Store', cat: catShopping, min: 9.99, max: 9.99 },
  ];

  for (let i = 0; i < 150; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(now.getDate() - randomDaysAgo);
    
    const merchantRef = merchants[Math.floor(Math.random() * merchants.length)];
    const amount = (Math.random() * (merchantRef.max - merchantRef.min) + merchantRef.min).toFixed(2);
    
   
    const acc = Math.random() > 0.3 ? accountsData[2] : accountsData[0];
    
    txData.push({
      id: uuidv4(),
      userId,
      accountId: acc.id,
      categoryId: merchantRef.cat.id,
      amount,
      currency: 'USD',
      type: 'expense',
      merchant: merchantRef.name,
      description: '',
      date,
      status: 'cleared',
      source: 'manual'
    });
  }
  
 
  txData.push({ id: uuidv4(), userId, accountId: accountsData[1].id, categoryId: catBonus.id, amount: '5000.00', currency: 'USD', type: 'income', merchant: 'Annual Bonus', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5), status: 'cleared', source: 'manual' });

  await db.insert(schema.transactions).values(txData);

 
  console.log('Inserting budgets...');
  await db.insert(schema.budgets).values([
    { id: uuidv4(), userId, categoryId: catGroceries.id, periodType: 'monthly', periodStart: new Date(now.getFullYear(), now.getMonth(), 1), limitAmount: '600.00', spent: '425.30', status: 'active' },
    { id: uuidv4(), userId, categoryId: catDining.id, periodType: 'monthly', periodStart: new Date(now.getFullYear(), now.getMonth(), 1), limitAmount: '350.00', spent: '280.50', status: 'active' },
    { id: uuidv4(), userId, categoryId: catShopping.id, periodType: 'monthly', periodStart: new Date(now.getFullYear(), now.getMonth(), 1), limitAmount: '300.00', spent: '315.00', status: 'active' },
  ]);

 
  console.log('Inserting goals...');
  await db.insert(schema.goals).values([
    { id: uuidv4(), userId, name: 'Emergency Fund', targetAmount: '20000.00', currentAmount: '15200.00', status: 'active', color: '#10B981', icon: '🏦' },
    { id: uuidv4(), userId, name: 'European Vacation', targetAmount: '4500.00', currentAmount: '2100.00', status: 'active', color: '#3B82F6', icon: '✈️' },
    { id: uuidv4(), userId, name: 'New Laptop', targetAmount: '2500.00', currentAmount: '2500.00', status: 'completed', color: '#8B5CF6', icon: '💻' },
  ]);

 
  console.log('Inserting subscriptions...');
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  await db.insert(schema.subscriptions).values([
    { id: uuidv4(), userId, merchant: 'Netflix', amount: '15.49', interval: 'monthly', status: 'active', nextChargeDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4), categoryId: catSubs.id, linkedAccountId: accountsData[2].id },
    { id: uuidv4(), userId, merchant: 'Spotify Premium', amount: '10.99', interval: 'monthly', status: 'active', nextChargeDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12), categoryId: catSubs.id, linkedAccountId: accountsData[2].id },
    { id: uuidv4(), userId, merchant: 'Equinox Gym', amount: '185.00', interval: 'monthly', status: 'active', nextChargeDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), categoryId: catSubs.id, linkedAccountId: accountsData[0].id },
    { id: uuidv4(), userId, merchant: 'Amazon Prime', amount: '139.00', interval: 'yearly', status: 'active', nextChargeDate: new Date(now.getFullYear(), now.getMonth() + 5, 20), categoryId: catSubs.id, linkedAccountId: accountsData[2].id },
  ]);

 
  console.log('Inserting debts...');
  await db.insert(schema.debts).values([
    { id: uuidv4(), userId, name: 'Student Loan', totalAmount: '35000.00', remainingAmount: '24500.00', interestRate: '4.50', minimumPayment: '350.00', dueDate: new Date(now.getFullYear(), now.getMonth(), 28) },
    { id: uuidv4(), userId, name: 'Tesla Model 3', totalAmount: '42000.00', remainingAmount: '31200.00', interestRate: '3.99', minimumPayment: '640.00', dueDate: new Date(now.getFullYear(), now.getMonth(), 15) },
  ]);

  console.log('Realistic dummy data seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
