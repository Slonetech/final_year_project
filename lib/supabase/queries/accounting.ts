import { createClient } from '../server';
import { Account, AccountType, JournalEntry } from '@/lib/types';

// --- CHART OF ACCOUNTS ---

const mapAccountFromDb = (data: any): Account => {
  return {
    id: data.id,
    code: data.account_code,
    name: data.account_name,
    type: (data.account_type || 'asset') as AccountType,
    category: (data.account_type || 'other') as any, // category not in DB schema natively, defaulting
    description: '',
    balance: 0, // In a real app, this should be computed by aggregating journal entries
    isSubAccount: !!data.parent_id,
    parentId: data.parent_id || undefined,
    status: data.is_active ? 'active' : 'inactive',
    createdAt: data.created_at,
    updatedAt: data.created_at,
  };
};

export async function getAllAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('chart_of_accounts').select('*').order('account_code');
  if (error) throw error;
  return (data || []).map(mapAccountFromDb);
}

// Keeping `getAll` for backwards compatibility with previous imports
export const getAll = getAllAccounts;

export async function getAccountById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('chart_of_accounts').select('*').eq('id', id).single();
  if (error) throw error;
  return mapAccountFromDb(data);
}
export const getById = getAccountById;

export async function createAccount(record: any) {
  const supabase = await createClient();
  const dbRecord = {
    account_code: record.code,
    account_name: record.name,
    account_type: record.type,
    parent_id: record.parentId || null,
    is_active: record.status === 'active',
  };
  const { data, error } = await supabase.from('chart_of_accounts').insert(dbRecord).select().single();
  if (error) throw error;
  return mapAccountFromDb(data);
}
export const create = createAccount;

export async function updateAccount(id: string, record: any) {
  const supabase = await createClient();
  const dbRecord = {
    account_code: record.code,
    account_name: record.name,
    account_type: record.type,
    parent_id: record.parentId || null,
    is_active: record.status === 'active',
  };
  const { data, error } = await supabase.from('chart_of_accounts').update(dbRecord).eq('id', id).select().single();
  if (error) throw error;
  return mapAccountFromDb(data);
}
export const update = updateAccount;

export async function removeAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('chart_of_accounts').delete().eq('id', id);
  if (error) throw error;
  return true;
}
export const remove = removeAccount;

// --- JOURNAL ENTRIES ---

const mapJournalEntryFromDb = (data: any): JournalEntry => {
  return {
    id: data.id,
    entryNumber: `JE-${data.id.substring(0, 6).toUpperCase()}`,
    date: data.entry_date,
    description: data.description,
    reference: data.reference || undefined,
    status: 'posted', 
    lines: (data.journal_entry_lines || []).map((line: any) => ({
      id: line.id,
      accountId: line.account_id,
      accountName: line.chart_of_accounts?.account_name || 'Unknown',
      accountCode: line.chart_of_accounts?.account_code || '',
      debit: Number(line.debit) || 0,
      credit: Number(line.credit) || 0,
      description: line.description || '',
    })),
    totalDebits: Number(data.total_debit) || 0,
    totalCredits: Number(data.total_credit) || 0,
    isBalanced: Number(data.total_debit) === Number(data.total_credit),
    createdBy: 'System',
    createdAt: data.created_at,
    updatedAt: data.created_at,
  };
};

export async function getAllJournalEntries() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('journal_entries').select(`
    *,
    journal_entry_lines (
      *,
      chart_of_accounts ( account_name, account_code )
    )
  `).order('entry_date', { ascending: false });
  
  if (error) throw error;
  return (data || []).map(mapJournalEntryFromDb);
}

export async function getJournalEntryById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('journal_entries').select(`
    *,
    journal_entry_lines (
      *,
      chart_of_accounts ( account_name, account_code )
    )
  `).eq('id', id).single();
  
  if (error) throw error;
  return mapJournalEntryFromDb(data);
}

export async function createJournalEntry(record: any) {
  const supabase = await createClient();
  
  // Need to calculate totals here
  const totalDebit = record.lines.reduce((sum: number, line: any) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = record.lines.reduce((sum: number, line: any) => sum + (Number(line.credit) || 0), 0);
  
  const entryData = {
    entry_date: record.date || new Date().toISOString(),
    description: record.description,
    reference: record.reference || null,
    total_debit: totalDebit,
    total_credit: totalCredit,
  };

  const { data: entry, error: entryError } = await supabase.from('journal_entries').insert(entryData).select().single();
  if (entryError) throw entryError;

  const linesData = record.lines.map((line: any) => ({
    journal_entry_id: entry.id,
    account_id: line.accountId,
    debit: line.debit || 0,
    credit: line.credit || 0,
    description: line.description || null,
  }));

  const { error: linesError } = await supabase.from('journal_entry_lines').insert(linesData);
  if (linesError) {
    // Attempt rollback
    await supabase.from('journal_entries').delete().eq('id', entry.id);
    throw linesError;
  }
  
  return getJournalEntryById(entry.id);
}
