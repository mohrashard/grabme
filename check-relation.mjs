import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            *,
            workers (
                full_name,
                trade_category,
                contact_number,
                profile_photo_url
            )
        `)
        .limit(1);
    console.log("Error:", error);
    console.log("Data:", data);
}

run();
