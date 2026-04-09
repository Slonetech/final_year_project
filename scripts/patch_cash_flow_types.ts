import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function patchCashFlowTypes() {
  console.log("Starting Cash Flow type patch...");

  // 1. Tag 'received' payments (those linked to invoices)
  const { data: receivedData, error: receivedError } = await supabase
    .from('payments')
    .update({ type: 'received' })
    .not('invoice_id', 'is', null)
    .is('type', null)
    .select();

  if (receivedError) {
    console.error("Error patching 'received' payments:", receivedError.message);
  } else {
    console.log(`Patched ${receivedData?.length || 0} payments as 'received'.`);
  }

  // 2. Tag 'made' payments (those linked to suppliers)
  const { data: madeData, error: madeError } = await supabase
    .from('payments')
    .update({ type: 'made' })
    .not('supplier_id', 'is', null)
    .is('type', null)
    .select();

  if (madeError) {
    console.error("Error patching 'made' payments:", madeError.message);
  } else {
    console.log(`Patched ${madeData?.length || 0} payments as 'made'.`);
  }

  console.log("Cash Flow patch completed.");
}

patchCashFlowTypes();
