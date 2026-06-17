import { createClient } from '@supabase/supabase-js';
import process from 'process';
process.loadEnvFile('.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('Fetching workers without slugs...');
    const { data: workers, error } = await supabaseAdmin
        .from('workers')
        .select('id, full_name')
        .is('slug', null);

    if (error) {
        console.error('Error fetching workers:', error);
        return;
    }

    console.log(`Found ${workers.length} workers needing slugs.`);

    for (const w of workers) {
        const baseSlug = w.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const randomString = Math.random().toString(36).substring(2, 6);
        const uniqueSlug = `${baseSlug}-${randomString}`;

        const { error: updateError } = await supabaseAdmin
            .from('workers')
            .update({ slug: uniqueSlug })
            .eq('id', w.id);
        
        if (updateError) {
            console.error(`Failed to update ${w.id}:`, updateError);
        } else {
            console.log(`Updated ${w.full_name} -> ${uniqueSlug}`);
        }
    }

    console.log('Done!');
}

run();
