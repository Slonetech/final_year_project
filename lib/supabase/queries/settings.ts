import { createClient } from '../server'
import { CompanySettings, TaxSettings, InvoiceSettings } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase } from '../../utils/mapping'

export async function getCompanySettings(): Promise<CompanySettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('id', 'singleton')
    .single()

  if (error) throw error
  return mapToCamelCase(data) as CompanySettings
}

export async function updateCompanySettings(
  fields: Partial<Omit<CompanySettings, 'id' | 'updatedAt'>>
): Promise<CompanySettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('company_settings')
    .update(mapToSnakeCase(fields))
    .eq('id', 'singleton')
    .select()
    .single()

  if (error) throw error
  return mapToCamelCase(data) as CompanySettings
}

export async function getTaxSettings(): Promise<TaxSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_settings')
    .select('*')
    .eq('id', 'singleton')
    .single()
  if (error) throw error
  return {
    id: data.id,
    vatRate: data.vat_rate,
    withholdingTaxRates: {
      professionalFees: data.withholding_professional_fees,
      supplies: data.withholding_supplies,
      rent: data.withholding_rent,
      commissions: data.withholding_commissions,
    },
    updatedAt: data.updated_at,
  }
}

export async function updateTaxSettings(
  fields: Partial<Omit<TaxSettings, 'id' | 'updatedAt'>>
): Promise<TaxSettings> {
  const supabase = await createClient()
  const patch: Record<string, unknown> = {}
  if (fields.vatRate !== undefined) patch.vat_rate = fields.vatRate
  if (fields.withholdingTaxRates) {
    const w = fields.withholdingTaxRates
    if (w.professionalFees !== undefined) patch.withholding_professional_fees = w.professionalFees
    if (w.supplies !== undefined) patch.withholding_supplies = w.supplies
    if (w.rent !== undefined) patch.withholding_rent = w.rent
    if (w.commissions !== undefined) patch.withholding_commissions = w.commissions
  }
  const { data, error } = await supabase
    .from('tax_settings')
    .update(patch)
    .eq('id', 'singleton')
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    vatRate: data.vat_rate,
    withholdingTaxRates: {
      professionalFees: data.withholding_professional_fees,
      supplies: data.withholding_supplies,
      rent: data.withholding_rent,
      commissions: data.withholding_commissions,
    },
    updatedAt: data.updated_at,
  }
}

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoice_settings')
    .select('*')
    .eq('id', 'singleton')
    .single()
  if (error) throw error
  return {
    id: data.id,
    invoicePrefix: data.invoice_prefix,
    nextInvoiceNumber: data.next_invoice_number,
    paymentTerms: data.payment_terms,
    termsAndConditions: data.terms_and_conditions,
    footerText: data.footer_text ?? undefined,
    updatedAt: data.updated_at,
  }
}

export async function updateInvoiceSettings(
  fields: Partial<Omit<InvoiceSettings, 'id' | 'updatedAt'>>
): Promise<InvoiceSettings> {
  const supabase = await createClient()
  const patch: Record<string, unknown> = {}
  if (fields.invoicePrefix !== undefined) patch.invoice_prefix = fields.invoicePrefix
  if (fields.nextInvoiceNumber !== undefined) patch.next_invoice_number = fields.nextInvoiceNumber
  if (fields.paymentTerms !== undefined) patch.payment_terms = fields.paymentTerms
  if (fields.termsAndConditions !== undefined) patch.terms_and_conditions = fields.termsAndConditions
  if (fields.footerText !== undefined) patch.footer_text = fields.footerText
  const { data, error } = await supabase
    .from('invoice_settings')
    .update(patch)
    .eq('id', 'singleton')
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    invoicePrefix: data.invoice_prefix,
    nextInvoiceNumber: data.next_invoice_number,
    paymentTerms: data.payment_terms,
    termsAndConditions: data.terms_and_conditions,
    footerText: data.footer_text ?? undefined,
    updatedAt: data.updated_at,
  }
}
