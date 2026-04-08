'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

/**
 * PROFANITY FILTER: Automated Troll Protection
 */
const PROFANITY_BLACKLIST = [
    'fuck', 'shit', 'motherfucker', 'asshole', 'pussy', 'dick', 'admin', 
    'test', 'troll', 'fake', 'ponnaya', 'kariya', 'paki' // Common local/global blocks
]

const containsProfanity = (val: string) => {
    const low = val.toLowerCase()
    return PROFANITY_BLACKLIST.some(word => low.includes(word))
}

/**
 * HYPER-ADVANCED REGISTRATION SCHEMA
 */
/**
 * HYPER-ADVANCED REGISTRATION SCHEMA
 */
const RegistrationSchema = z.object({
    fullName: z.string()
        .min(5, "Name too short (Min 5 chars)")
        .max(100, "Name too long")
        .regex(/^[a-zA-Z\s.]+$/, "Invalid Name: Only letters, periods, and spaces allowed.")
        .refine(val => !containsProfanity(val), "Invalid Name: Profanity detected."),
    
    email: z.string()
        .transform(val => val.trim().toLowerCase())
        .pipe(z.string().email("Invalid email format")),

    password: z.string()
        .min(8, "Password too weak: Minimum 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
               "Password MUST include: 1 Uppercase, 1 Lowercase, 1 Number, and 1 Special Char (@$!%*?&)"),

    phone: z.string()
        .transform(val => val.replace(/\D/g, '').replace(/^94/, '0').slice(0, 10))
        .pipe(z.string().regex(/^0\d{9}$/, "Invalid primary phone format")),

    referencePhone: z.string()
        .transform(val => val.replace(/\D/g, '').replace(/^94/, '0').slice(0, 10))
        .pipe(z.string().regex(/^0\d{9}$/, "Invalid reference phone format")),

    emergencyContact: z.string()
        .transform(val => val.replace(/\D/g, '').replace(/^94/, '0').slice(0, 10))
        .pipe(z.string().regex(/^0\d{9}$/, "Invalid emergency phone format")),

    nicNumber: z.string()
        .transform(val => val.replace(/\s+/g, '').toUpperCase())
        .pipe(z.string().regex(/^([0-9]{9}[VX]|[0-9]{12})$/, "Invalid NIC format")),

    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid Date of Birth"),

    address: z.string()
        .min(10, "Address must be at least 10 characters long")
        .regex(/^[0-9A-Z/].*,.*$/i, "Invalid format: Please follow 'House No, Street, City' (include commas)."),
    
    shortBio: z.string()
        .min(20, "Bio too short: Describe your skills in at least 20 chars.")
        .max(500, "Bio too long (Max 500 chars)")
        .refine(val => !containsProfanity(val), "Bio contains restricted language."),

    // File path enforcement
    profilePhotoUrl: z.string().min(1, "Profile photo required"),
    nicFrontUrl: z.string().regex(/^workers\/.*?\.(png|jpg|jpeg|webp)$/i, "Invalid NIC image path"),
    nicBackUrl: z.string().regex(/^workers\/.*?\.(png|jpg|jpeg|webp)$/i, "Invalid NIC image path"),
    selfieUrl: z.string().regex(/^workers\/.*?\.(png|jpg|jpeg|webp)$/i, "Invalid Selfie path"),

    // Categories
    tradeCategory: z.string().min(1, "Major Trade required"),
    yearsExperience: z.coerce.number().min(0, "Invalid experience").max(60, "Impossible experience"),
    homeDistrict: z.string().min(1, "District required"),
    referenceName: z.string().min(2, "Reference Name required"),

}).refine((data) => data.phone !== data.referencePhone, {
    message: "Self-Reference Error: You cannot provide your own number as a reference.",
    path: ["referencePhone"]
}).refine((data) => data.phone !== data.emergencyContact, {
    message: "Primary Phone cannot be same as Emergency Contact.",
    path: ["emergencyContact"]
}).refine((data) => {
    // NIC vs DOB Year Matching
    const nic = data.nicNumber;
    const dobYear = new Date(data.dob).getFullYear().toString();
    let nicBirthYear = '';

    if (nic.length === 10) {
        nicBirthYear = '19' + nic.substring(0, 2);
    } else if (nic.length === 12) {
        nicBirthYear = nic.substring(0, 4);
    }

    return nicBirthYear === dobYear;
}, {
    message: "Date of Birth year does not match your NIC.",
    path: ["dob"]
});

import { headers } from 'next/headers'
import { registrationRateLimit } from '../../lib/rateLimit'

/**
 * SECURE REGISTRATION ACTION
 */
export async function registerWorkerAction(rawData: any) {
    try {
        // 0. SERVER SANITY CHECK (Production Defense)
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('CRITICAL: Supabase Service Role Key missing in environment.');
            return { success: false, error: 'Registration is currently unavailable (Server Config Error).' };
        }

        // 1. RATE LIMITING (IP-Based Protection)
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || '0.0.0.0';
        
        try {
            const { success } = await registrationRateLimit.limit(ip);
            if (!success) {
                return { success: false, error: 'Too many registration attempts (Max 10/hr). Please try again in an hour.' };
            }
        } catch (redisErr) {
            console.error('Rate Limit [Redis] Error:', redisErr);
            // Non-blocking: Fail-open if Redis is down, but log it.
        }

        // 2. VALIDATE PIPELINE (Strict Zod check)
        const parse = RegistrationSchema.safeParse(rawData)

        if (!parse.success) {
            const fieldErrors = parse.error.flatten().fieldErrors
            const flattenedErrors: Record<string, string> = {}
            Object.keys(fieldErrors).forEach(key => {
                const messages = fieldErrors[key as keyof typeof fieldErrors]
                if (messages && messages.length > 0) {
                    flattenedErrors[key] = messages[0]
                }
            })
            return { success: false, errors: flattenedErrors }
        }

        const data = parse.data

        // 3. CRYPTOGRAPHIC HASHING
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 4. SECURE ADMINISTRATIVE INSERT (Bypasses RLS)
        const { error } = await supabaseAdmin
            .from('workers')
            .insert([
                {
                    full_name: data.fullName,
                    email: data.email,
                    password: hashedPassword,
                    phone: data.phone,
                    nic_number: data.nicNumber,
                    address: data.address,
                    emergency_contact: (rawData.emergencyContact || '').trim(),
                    profile_photo_url: data.profilePhotoUrl,
                    nic_front_url: data.nicFrontUrl,
                    nic_back_url: data.nicBackUrl,
                    selfie_url: data.selfieUrl,
                    past_work_photos: rawData.pastWorkPhotos || [],
                    certificate_url: rawData.certificateUrl || '',
                    trade_category: data.tradeCategory,
                    sub_skills: rawData.subSkills || [],
                    years_experience: data.yearsExperience,
                    short_bio: data.shortBio,
                    previous_employer: (rawData.previousEmployer || '').trim(),
                    home_district: data.homeDistrict,
                    specific_areas: rawData.specific_areas || [rawData.town],
                    districts_covered: rawData.districts_covered || rawData.districtsCovered || [],
                    reference_name: (data.referenceName || rawData.referenceName || '').trim(),
                    reference_phone: data.referencePhone,
                    agreed_to_code_of_conduct: true,
                    account_status: 'pending',
                    whatsapp_pinged_at: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error('Supabase Insert Error:', error);

            // Handle Postgres Unique Violation (Code 23505)
            if (error.code === '23505') {
                const msg = error.message.toLowerCase();
                
                if (msg.includes('phone') || msg.includes('workers_phone_key')) {
                    return { success: false, errors: { phone: "This phone number is already registered." } };
                }
                if (msg.includes('nic') || msg.includes('workers_nic_number_key')) {
                    return { success: false, errors: { nicNumber: "This NIC is already registered." } };
                }
                if (msg.includes('email') || msg.includes('workers_email_key')) {
                    return { success: false, errors: { email: "This email is already registered." } };
                }
                
                return { success: false, error: "One of your unique details is already registered." };
            }

            // Generic Database Error Catch-all
            return { success: false, error: "Database error during registration." };
        }

        return { success: true }

    } catch (err: any) {
        console.error('Registration Exception [Full Trace]:', err);
        return { success: false, error: 'Registration failed due to a system error. Please contact support.' }
    }
}
