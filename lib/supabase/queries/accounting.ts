import { createClient } from '../server'
import { Account, JournalEntry } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

// Chart of Accounts
export async function getAllAccounts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .order('account_code')
  
  if (error) throw error
  return mapArrayToCamelCase(data) as Account[]
}

export const getAll = getAllAccounts;

export async function createAccount(account: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('chart_of_accounts')
    .insert({
      ...mapToSnakeCase(account),
      user_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return mapToCamelCase(data) as Account
}

// Journal Entries
export async function getAllJournalEntries() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*, journal_entry_lines(*, chart_of_accounts(name))')
    .order('entry_date', { ascending: false })
  
  if (error) throw error
  return mapArrayToCamelCase(data) as any[]
}

export async function createJournalEntry(entry: any, lines: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      ...mapToSnakeCase(entry),
      user_id: user?.id
    })
    .select()
    .single()

  if (error) throw error

  const entryLines = lines.map(line => ({
    ...mapToSnakeCase(line),
    journal_entry_id: data.id
  }))

  const { error: linesError } = await supabase
    .from('journal_entry_lines')
    .insert(entryLines)
  
  if (linesError) throw linesError
  
  return mapToCamelCase(data)
}
