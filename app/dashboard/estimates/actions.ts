'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'

export async function getEstimatesAction(workerId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('estimates')
            .select('*')
            .eq('worker_id', workerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[getEstimatesAction]', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function rejectEstimateAction(estimateId: string, workerId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('estimates')
            .update({ status: 'rejected' })
            .eq('id', estimateId)
            .eq('worker_id', workerId);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function deleteEstimateAction(estimateId: string, workerId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('estimates')
            .delete()
            .eq('id', estimateId)
            .eq('worker_id', workerId);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function acceptEstimateFlowAction(
    estimateId: string, 
    workerId: string, 
    createInvoice: boolean, 
    addToWallet: boolean
) {
    try {
        // 1. Fetch estimate
        const { data: estimate, error: fetchErr } = await supabaseAdmin
            .from('estimates')
            .select('*')
            .eq('id', estimateId)
            .eq('worker_id', workerId)
            .single();

        if (fetchErr || !estimate) return { success: false, error: 'Estimate not found' };

        // 2. Update to accepted (we will also update generated_invoice_id if applicable below, but let's do status first)
        const { error: updateErr } = await supabaseAdmin
            .from('estimates')
            .update({ status: 'accepted' })
            .eq('id', estimateId);

        if (updateErr) return { success: false, error: updateErr.message };

        let newInvoiceId = null;

        // 3. Create Invoice if requested
        if (createInvoice) {
            const invoiceData = {
                worker_id: workerId,
                customer_name: estimate.customer_name,
                customer_contact: estimate.customer_contact,
                amount: estimate.amount,
                total_amount: estimate.total_amount,
                status: addToWallet ? 'paid' : 'unpaid',
                lead_source: estimate.lead_source,
                job_description: estimate.job_description,
                line_items: estimate.line_items
            };

            const { data: invData, error: invErr } = await supabaseAdmin
                .from('invoices')
                .insert([invoiceData])
                .select('id')
                .single();
            
            if (invErr) {
                console.error('Failed to create invoice from estimate', invErr);
            } else if (invData) {
                newInvoiceId = invData.id;
                
                // Update the estimate with the generated invoice ID
                await supabaseAdmin
                    .from('estimates')
                    .update({ generated_invoice_id: newInvoiceId })
                    .eq('id', estimateId);
            }
        }

        // 4. Add to Wallet if requested
        if (addToWallet) {
            const ledgerEntry = {
                worker_id: workerId,
                type: 'income',
                amount: estimate.total_amount || estimate.amount,
                category: 'Service',
                lead_source: estimate.lead_source || 'direct',
                description: `Estimate Accepted: ${estimate.customer_name} - ${estimate.job_description}`,
                entry_date: new Date().toISOString().split('T')[0]
            };

            const { error: ledgerErr } = await supabaseAdmin.from('financial_entries').insert([ledgerEntry]);
            if (ledgerErr) console.error('Failed to add estimate to ledger', ledgerErr);
        }

        return { success: true, newInvoiceId };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
