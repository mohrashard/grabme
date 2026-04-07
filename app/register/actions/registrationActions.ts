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
const RegistrationSchema = z.object({
    fullName: z.string()
        .min(5, "Name too short (Min 5 chars)")
        .max(100, "Name too long")
        .regex(/^[a-zA-Z\s.]+$/, "Invalid Name: Only letters, periods, and spaces allowed.")
        .refine(val => !containsProfanity(val), "Invalid Name: Profanity detected."),
    
    email: z.string()
        .email("Invalid Email Format")
        .transform(val => val.toLowerCase().trim()),

    password: z.string()
        .min(8, "Password too weak: Minimum 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
               "Password MUST include: 1 Uppercase, 1 Lowercase, 1 Number, and 1 Special Char (@$!%*?&)"),

    phone: z.string()
        .regex(/^(\+94|0)?7[0-9]{8}$/, "Invalid Primary WhatsApp Number"),

    referencePhone: z.string()
        .regex(/^(\+94|0)?7[0-9]{8}$/, "Invalid Reference WhatsApp Number"),

    nicNumber: z.string()
        .transform(val => val.trim().toUpperCase()),

    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid Date of Birth"),

    address: z.string().min(10, "Full residential address required for verification."),
    shortBio: z.string()
        .min(20, "Bio too short: Describe your skills in at least 20 chars.")
        .max(500, "Bio too long (Max 500 chars)")
        .refine(val => !containsProfanity(val), "Bio contains restricted language."),

    // File path enforcement (profilePhoto is now a full URL, others are raw paths)
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
}).superRefine((data, ctx) => {
    /**
     * SRI LANKAN SMART NIC LOGIC
     */
    let nicBirthYear: number | null = null
    const nic = data.nicNumber
    const dobObj = new Date(data.dob)
    const dobYear = dobObj.getFullYear()

    if (/^[0-9]{9}[VvXx]$/.test(nic)) {
        // Old NIC: 19xx
        nicBirthYear = 1900 + parseInt(nic.substring(0, 2))
    } else if (/^[0-9]{12}$/.test(nic)) {
        // New NIC: Full year
        nicBirthYear = parseInt(nic.substring(0, 4))
    } else {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid NIC: Use Old (9 digits + V/X) or New (12 digits) format.", path: ["nicNumber"] })
        return
    }

    // 1. Age Gate (18 - 80)
    const currentYear = new Date().getFullYear()
    const age = currentYear - nicBirthYear
    if (age < 18 || age > 80) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `NIC indicates Age is ${age}. Must be between 18 and 80.`, path: ["nicNumber"] })
    }

    // 2. DOB Match Gate
    if (nicBirthYear !== dobYear) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `NIC birth year (${nicBirthYear}) doesn't match your DOB (${dobYear}).`, path: ["nicNumber"] })
    }
})

import { headers } from 'next/headers'
import { registrationRateLimit } from '../../lib/rateLimit'

/**
 * SECURE REGISTRATION ACTION
 */
export async function registerWorkerAction(rawData: any) {
    try {
        // 0. RATE LIMITING (IP-Based Protection)
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || '0.0.0.0';
        const { success } = await registrationRateLimit.limit(ip);
        if (!success) {
            return { success: false, error: 'Too many registration attempts. Please try again in an hour.' };
        }

        // 1. VALIDATE PIPELINE (Strict Zod check)
        const parse = RegistrationSchema.safeParse(rawData)

        if (!parse.success) {
            // Map structured errors to human-readable field errors
            const fieldErrors = parse.error.flatten().fieldErrors
            // Convert string[] to string for the UI alert/toast
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

        // 2. CRYPTOGRAPHIC HASHING
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // 3. SECURE ADMINISTRATIVE INSERT (Bypasses RLS)
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
            if (error.code === '23505') {
                const constraint = error.message.toLowerCase()
                if (constraint.includes('nic_number')) return { success: false, errors: { nicNumber: 'NIC already registered.' } }
                if (constraint.includes('phone')) return { success: false, errors: { phone: 'WhatsApp number already registered.' } }
            }
            throw error
        }

        return { success: true }

    } catch (err: any) {
        console.error('Registration Error [Code]:', err.code || 'SYSTEM_ERR', err.message || '');
        return { success: false, error: 'Registration failed due to a system error. Please try again later.' }
    }
}
