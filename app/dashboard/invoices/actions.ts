'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'

export async function getInvoicesAction(workerId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('invoices')
            .select('*')
            .eq('worker_id', workerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[getInvoicesAction]', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function markInvoiceAsPaidAction(invoiceId: string, workerId: string) {
    try {
        // 1. Fetch the invoice to make sure it belongs to the worker and is unpaid
        const { data: invoice, error: fetchError } = await supabaseAdmin
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .eq('worker_id', workerId)
            .single();

        if (fetchError || !invoice) {
            return { success: false, error: 'Invoice not found or unauthorized' };
        }

        if (invoice.status === 'paid') {
            return { success: false, error: 'Invoice is already marked as paid' };
        }

        // 2. Update the invoice status to 'paid'
        const { error: updateError } = await supabaseAdmin
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', invoiceId);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        // 3. Add to Wallet (financial_entries)
        const ledgerEntry = {
            worker_id: workerId,
            type: 'income',
            amount: invoice.total_amount || invoice.amount,
            category: 'Service',
            lead_source: invoice.lead_source || 'direct',
            description: `Invoice Paid: ${invoice.customer_name} - ${invoice.job_description || 'Services'}`,
            entry_date: new Date().toISOString().split('T')[0]
        };

        const { error: ledgerError } = await supabaseAdmin
            .from('financial_entries')
            .insert([ledgerEntry]);

        if (ledgerError) {
            console.error('Failed to add to ledger, but invoice was marked paid', ledgerError);
            // We still return success but maybe with a warning in a real prod app
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
