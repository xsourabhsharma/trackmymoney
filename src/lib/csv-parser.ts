import { parse } from 'csv-parse/sync';
import { format, parse as dateParse, isValid } from 'date-fns';

export interface ParsedCsvRow {
  raw: any;
  date: string | null;
  description: string;
  amount: number | null;
  type: 'income' | 'expense' | null;
}

const DATE_HEADERS = ['date', 'posting date', 'transaction date', 'trans date', 'post date'];
const DESC_HEADERS = ['description', 'name', 'merchant', 'payee', 'memo', 'details'];
const AMOUNT_HEADERS = ['amount', 'value'];
const DEBIT_HEADERS = ['debit', 'withdrawal', 'outflow', 'spent'];
const CREDIT_HEADERS = ['credit', 'deposit', 'inflow', 'received'];


function mapRow(row: Record<string, string>): ParsedCsvRow {
  const keys = Object.keys(row);
  const lowerKeys = keys.map(k => k.toLowerCase().trim());
  
  let dateKey: string | null = null;
  let descKey: string | null = null;
  let amountKey: string | null = null;
  let debitKey: string | null = null;
  let creditKey: string | null = null;

 
  lowerKeys.forEach((lk, i) => {
    if (!dateKey && DATE_HEADERS.some(h => lk.includes(h))) dateKey = keys[i];
    if (!descKey && DESC_HEADERS.some(h => lk.includes(h))) descKey = keys[i];
    if (!amountKey && AMOUNT_HEADERS.some(h => lk === h || lk.includes('amount') || lk.includes('amount (usd)'))) amountKey = keys[i];
    if (!debitKey && DEBIT_HEADERS.some(h => lk.includes(h))) debitKey = keys[i];
    if (!creditKey && CREDIT_HEADERS.some(h => lk.includes(h))) creditKey = keys[i];
  });

 
  const rawDate = dateKey ? row[dateKey] : '';
  const rawDesc = descKey ? row[descKey] : Object.values(row).find(v => typeof v === 'string' && v.length > 3) || '';
  
 
  let amount: number | null = null;
  let type: 'income' | 'expense' | null = null;

  if (amountKey && row[amountKey]) {
    const cleanAmt = row[amountKey].replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleanAmt);
    if (!isNaN(num)) {
      amount = Math.abs(num);
      type = num < 0 ? 'expense' : 'income';
    }
  } 
 
  else if (debitKey && row[debitKey]) {
    const cleanAmt = row[debitKey].replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleanAmt);
    if (!isNaN(num) && num !== 0) {
      amount = Math.abs(num);
      type = 'expense';
    }
  } else if (creditKey && row[creditKey]) {
    const cleanAmt = row[creditKey].replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleanAmt);
    if (!isNaN(num) && num !== 0) {
      amount = Math.abs(num);
      type = 'income';
    }
  }

 
  let date: string | null = null;
  if (rawDate) {
    const parsed = new Date(rawDate);
    if (isValid(parsed)) {
      date = parsed.toISOString();
    } else {
     
      const altParse = dateParse(rawDate, 'MM/dd/yyyy', new Date());
      if (isValid(altParse)) date = altParse.toISOString();
    }
  }

  return {
    raw: row,
    date,
    description: rawDesc.trim(),
    amount,
    type,
  };
}

export function parseCsvFile(csvContent: string): { rows: ParsedCsvRow[]; error?: string } {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });

    if (records.length === 0) {
      return { rows: [], error: "CSV file is empty or headers could not be parsed." };
    }

    const mappedRows = records.map((r: any) => mapRow(r));
    return { rows: mappedRows };
  } catch (error: any) {
    console.error("CSV Parse Error:", error);
    return { rows: [], error: error.message || "Failed to parse CSV file." };
  }
}
