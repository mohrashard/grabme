const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkWorker() {
    const { data, error } = await supabase
        .from('workers')
        .select('full_name, account_status, is_identity_verified, is_reference_checked, is_certificate_verified')
        .eq('id', '0ab7742a-2a17-4e24-ae87-b1d6921cbcef')
        .single()

    if (error) {
        console.error(error)
        process.exit(1)
    }

    console.log(JSON.stringify(data, null, 2))
}

checkWorker()
