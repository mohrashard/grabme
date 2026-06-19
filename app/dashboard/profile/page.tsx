'use client'

import React, { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import {
    LayoutDashboard,
    Briefcase,
    User,
    Settings,
    LogOut,
    ShieldCheck,
    MapPin,
    Phone,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Award,
    Star,
    Globe,
    Music,
    Save,
    Share2,
    Calendar,
    BriefcaseIcon,
    ChevronLeft,
    HelpCircle,
    Plus,
    Trash2,
    DollarSign,
    Tag,
    X,
    Edit2,
    Wrench,
    CreditCard,
    Lock,
    Clipboard,
    ClipboardCheck,
    Sparkles,
    ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { updateWorkerSocialsAction } from '../actions/updateWorkerSocialsAction'
import { updateWorkerPricingAction } from '../actions/updateWorkerPricingAction'
import { updateWorkerSkillsAction } from '../actions/updateWorkerSkillsAction'
import { updateWorkerMainDetailsAction } from '../actions/updateWorkerMainDetailsAction'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { DISTRICTS } from '../../register/constants'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getAdminContactAction } from '../../actions/getAdminContactAction'
import { updateWorkerPhotoAction } from '../actions/updateWorkerPhotoAction'
import { updateWorkerCertificateAction } from '../actions/updateWorkerCertificateAction'
import imageCompression from 'browser-image-compression'
import { Camera, Loader2 } from 'lucide-react'
import { fetchTaxonomyAction } from '../../lib/taxonomyActions'

export default function WorkerProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [savingSocials, setSavingSocials] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingCert, setUploadingCert] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const certInputRef = React.useRef<HTMLInputElement>(null);
    const [socialLinks, setSocialLinks] = useState({
        video_pitch_url: '',
        instagram_url: '',
        tiktok_url: '',
        facebook_url: ''
    });

    // ── Pricing state ──
    const [savingPricing, setSavingPricing] = useState(false);
    const [baseVisitingFee, setBaseVisitingFee] = useState<string>('');
    const [priceEstimates, setPriceEstimates] = useState<{ label: string; min: string; max: string }[]>([]);
    const [allTrades, setAllTrades] = useState<string[]>([]);

    // ── Skills state ──
    const [savingSkills, setSavingSkills] = useState(false);
    const [editingSkills, setEditingSkills] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [availableSkills, setAvailableSkills] = useState<string[]>([]);
    const [skillsByService, setSkillsByService] = useState<any>({});

    // ── Bio Generator state ──
    const [showBioGenerator, setShowBioGenerator] = useState(false);
    const [bioPromptCopied, setBioPromptCopied] = useState(false);

    // ── Main Details state ──
    const [savingMainDetails, setSavingMainDetails] = useState(false);
    const [editingMainDetails, setEditingMainDetails] = useState(false);
    const [mainDetails, setMainDetails] = useState({
        years_experience: '',
        phone: '',
        short_bio: '',
        home_district: '',
        districts_covered: [] as string[],
        languages_spoken: [] as string[],
        service_warranty: '',
        education_history: [] as string[],
        certificate_name: '',
        secondary_trade: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const localUserRaw = localStorage.getItem('grabme_user');
            if (!localUserRaw) {
                router.push('/login');
                return;
            }

            const localUser = JSON.parse(localUserRaw);
            setUser(localUser);

            // Fetch the FULL profile
            const { data, error } = await supabase
                .from('workers')
                .select(`
  id,
  full_name,
  email,
  phone,
  nic_number,
  trade_category,
  sub_skills,
  years_experience,
  short_bio,
  home_district,
  specific_areas,
  districts_covered,
  languages_spoken,
  profile_photo_url,
  nic_front_url,
  nic_back_url,
  selfie_url,
  certificate_url,
  video_pitch_url,
  account_status,
  is_featured,
  is_identity_verified,
  is_reference_checked,
  reference_name,
  reference_phone,
  previous_employer,
  address,
  emergency_contact,
  agreed_to_code_of_conduct,
  whatsapp_pinged_at,
  activated_at,
  created_at,
  instagram_url,
  tiktok_url,
  facebook_url,
  base_visiting_fee,
  price_estimates,
  service_warranty,
  education_history,
  certificate_url,
  certificate_name,
  secondary_trade,
  subscription_tier
`)
                .eq('id', localUser.id)
                .maybeSingle();

            if (data) {
                setFullProfile(data);
                setSocialLinks({
                    video_pitch_url: data.video_pitch_url || '',
                    instagram_url: data.instagram_url || '',
                    tiktok_url: data.tiktok_url || '',
                    facebook_url: data.facebook_url || ''
                });
                setBaseVisitingFee(data.base_visiting_fee != null ? String(data.base_visiting_fee) : '');
                setPriceEstimates(
                    Array.isArray(data.price_estimates) && data.price_estimates.length > 0
                        ? data.price_estimates.map((e: any) => ({ label: e.label, min: String(e.min), max: String(e.max) }))
                        : []
                );
                // Sync session just in case
                localStorage.setItem('grabme_user', JSON.stringify({ ...localUser, ...data }));

                // Fetch taxonomy to get available skills
                const taxonomy = await fetchTaxonomyAction();
                setSkillsByService(taxonomy.skillsByService || {});
                setAllTrades(Object.keys(taxonomy.skillsByService || {}));
                
                let tradeSkills = taxonomy.skillsByService[data.trade_category]?.map((s: any) => s.name) || [];
                if (data.secondary_trade && taxonomy.skillsByService[data.secondary_trade]) {
                    tradeSkills = [...tradeSkills, ...taxonomy.skillsByService[data.secondary_trade].map((s: any) => s.name)];
                }
                
                setAvailableSkills(tradeSkills);
                setSelectedSkills(data.sub_skills || []);
                
                setMainDetails({
                    years_experience: data.years_experience != null ? String(data.years_experience) : '',
                    phone: data.phone || '',
                    short_bio: data.short_bio || '',
                    home_district: data.home_district || '',
                    districts_covered: data.districts_covered || [],
                    languages_spoken: data.languages_spoken || [],
                    service_warranty: data.service_warranty || '',
                    education_history: data.education_history || [],
                    certificate_name: data.certificate_name || '',
                    secondary_trade: data.secondary_trade || ''
                });
            }

            setLoading(false);
        };
        fetchProfile();
    }, [router]);

    useEffect(() => {
        if (!fullProfile?.trade_category || !skillsByService || Object.keys(skillsByService).length === 0) return;
        
        let tradeSkills = skillsByService[fullProfile.trade_category]?.map((s: any) => s.name) || [];
        
        // If they are currently editing, use the draft secondary trade, otherwise use the saved one
        const currentSecondary = editingMainDetails ? mainDetails.secondary_trade : fullProfile.secondary_trade;
        
        if (currentSecondary && skillsByService[currentSecondary]) {
            tradeSkills = [...tradeSkills, ...skillsByService[currentSecondary].map((s: any) => s.name)];
        }
        
        setAvailableSkills(tradeSkills);
    }, [mainDetails.secondary_trade, fullProfile?.secondary_trade, fullProfile?.trade_category, skillsByService, editingMainDetails]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('grabme_user');
        router.push('/login');
    };

    const handleSocialSave = async () => {
        if (!fullProfile?.id) return;
        setSavingSocials(true);
        const toastId = toast.loading('Updating social profiles...');

        try {
            const res = await updateWorkerSocialsAction({
                workerId: fullProfile.id,
                ...socialLinks
            });

            if (res.success) {
                toast.success('Social profiles updated!', { id: toastId });
                setFullProfile((prev: any) => ({ ...prev, ...socialLinks }));
            } else {
                toast.error(res.error || 'Failed to update', { id: toastId });
            }
        } catch (err) {
            toast.error('Connection error', { id: toastId });
        } finally {
            setSavingSocials(false);
        }
    };

    const handlePricingSave = async () => {
        if (!fullProfile?.id) return;
        setSavingPricing(true);
        const toastId = toast.loading('Saving pricing info...');
        try {
            const estimates = priceEstimates
                .filter(e => e.label.trim())
                .map(e => ({ label: e.label.trim(), min: parseInt(e.min) || 0, max: parseInt(e.max) || 0 }));

            const res = await updateWorkerPricingAction({
                workerId: fullProfile.id,
                base_visiting_fee: baseVisitingFee.trim() !== '' ? parseInt(baseVisitingFee) : null,
                price_estimates: estimates,
            });

            if (res.success) {
                toast.success('Pricing saved!', { id: toastId });
                setFullProfile((prev: any) => ({ ...prev, base_visiting_fee: baseVisitingFee, price_estimates: estimates }));
            } else {
                toast.error(res.error || 'Failed to save', { id: toastId });
            }
        } catch {
            toast.error('Connection error', { id: toastId });
        } finally {
            setSavingPricing(false);
        }
    };

    const handleSkillsSave = async () => {
        if (!fullProfile?.id) return;
        setSavingSkills(true);
        const toastId = toast.loading('Saving expertise & skills...');
        try {
            const res = await updateWorkerSkillsAction({
                workerId: fullProfile.id,
                sub_skills: selectedSkills,
            });

            if (res.success) {
                toast.success('Skills updated successfully!', { id: toastId });
                setFullProfile((prev: any) => ({ ...prev, sub_skills: selectedSkills }));
                setEditingSkills(false);
            } else {
                toast.error(res.error || 'Failed to save', { id: toastId });
            }
        } catch {
            toast.error('Connection error', { id: toastId });
        } finally {
            setSavingSkills(false);
        }
    };

    const toggleSubSkill = (skill: string) => {
        setSelectedSkills(prev => 
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const handleMainDetailsSave = async () => {
        if (!fullProfile?.id) return;
        setSavingMainDetails(true);
        const toastId = toast.loading('Saving details...');
        try {
            const res = await updateWorkerMainDetailsAction({
                workerId: fullProfile.id,
                years_experience: mainDetails.years_experience,
                phone: mainDetails.phone,
                short_bio: mainDetails.short_bio,
                home_district: mainDetails.home_district,
                districts_covered: mainDetails.districts_covered,
                languages_spoken: mainDetails.languages_spoken,
                service_warranty: mainDetails.service_warranty,
                education_history: mainDetails.education_history,
                certificate_name: mainDetails.certificate_name,
                secondary_trade: mainDetails.secondary_trade
            });

            if (res.success) {
                toast.success('Details updated successfully!', { id: toastId });
                setFullProfile((prev: any) => ({ ...prev, ...mainDetails }));
                setEditingMainDetails(false);
            } else {
                toast.error(res.error || 'Failed to save', { id: toastId });
            }
        } catch {
            toast.error('Connection error', { id: toastId });
        } finally {
            setSavingMainDetails(false);
        }
    };

    const toggleDistrictCovered = (district: string) => {
        setMainDetails(prev => ({
            ...prev,
            districts_covered: prev.districts_covered.includes(district)
                ? prev.districts_covered.filter(d => d !== district)
                : [...prev.districts_covered, district]
        }));
    };

    const toggleLanguage = (lang: string) => {
        setMainDetails(prev => ({
            ...prev,
            languages_spoken: prev.languages_spoken.includes(lang)
                ? prev.languages_spoken.filter(l => l !== lang)
                : [...prev.languages_spoken, lang]
        }));
    };

    const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !fullProfile?.id) return;

        setUploadingPhoto(true);
        const toastId = toast.loading('Uploading new profile photo...');

        try {
            // Compress
            const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1024, useWebWorker: false };
            let processedFile: File | Blob = file;
            if (file.size > 0.3 * 1024 * 1024) {
                try {
                    processedFile = await imageCompression(file, options);
                } catch (err) {
                    console.warn("Compression failed", err);
                }
            }

            let fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            if (fileExt === 'jpeg') fileExt = 'jpg';
            if (!['jpg', 'png', 'webp'].includes(fileExt)) {
                toast.error('Unsupported format. Use JPG, PNG or WebP.', { id: toastId });
                setUploadingPhoto(false);
                return;
            }

            const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
                ? crypto.randomUUID().split('-')[0] 
                : Math.random().toString(36).substring(2, 8);
            
            const fileName = `${fullProfile.id}_photo_${Date.now()}_${uniqueId}.${fileExt}`;
            const filePath = `workers/${fileName}`;

            // Ensure valid Blob
            const fileBlob = processedFile instanceof File && processedFile.type
                ? processedFile 
                : new File([processedFile], fileName, { type: file.type || 'image/jpeg' });

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, fileBlob, { upsert: false });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            const res = await updateWorkerPhotoAction({ workerId: fullProfile.id, photoUrl: publicUrl });

            if (res.success) {
                setFullProfile((prev: any) => ({ ...prev, profile_photo_url: publicUrl }));
                toast.success('Profile photo updated!', { id: toastId });
                // Clean up old object url if we had a local preview
            } else {
                toast.error(res.error || 'Failed to update photo', { id: toastId });
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error uploading photo', { id: toastId });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !fullProfile?.id) return;

        setUploadingCert(true);
        const toastId = toast.loading('Uploading certificate...');

        try {
            let processedFile: File | Blob = file;
            let fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
            
            // Only compress if it's an image
            if (file.type.startsWith('image/')) {
                const options = { maxSizeMB: 1.5, maxWidthOrHeight: 2048, useWebWorker: false };
                if (file.size > 0.5 * 1024 * 1024) {
                    try { processedFile = await imageCompression(file, options); } catch (err) { console.warn("Compression failed", err); }
                }
                if (fileExt === 'jpeg') fileExt = 'jpg';
            }

            if (!['jpg', 'png', 'webp', 'pdf'].includes(fileExt)) {
                toast.error('Unsupported format. Use PDF, JPG, PNG or WebP.', { id: toastId });
                setUploadingCert(false);
                return;
            }

            const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().split('-')[0] : Math.random().toString(36).substring(2, 8);
            const fileName = `${fullProfile.id}_cert_${Date.now()}_${uniqueId}.${fileExt}`;
            const filePath = `workers/${fileName}`;

            const fileBlob = processedFile instanceof File && processedFile.type ? processedFile : new File([processedFile], fileName, { type: file.type || 'application/pdf' });

            const { error: uploadError } = await supabase.storage.from('worker-documents').upload(filePath, fileBlob, { upsert: false });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('worker-documents').getPublicUrl(filePath);

            const res = await updateWorkerCertificateAction({ workerId: fullProfile.id, certificateUrl: publicUrl, certificateName: mainDetails.certificate_name || 'My Certificate' });

            if (res.success) {
                setFullProfile((prev: any) => ({ ...prev, certificate_url: publicUrl, certificate_name: mainDetails.certificate_name || 'My Certificate' }));
                toast.success('Certificate uploaded successfully!', { id: toastId });
            } else {
                toast.error(res.error || 'Failed to update certificate', { id: toastId });
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error uploading certificate', { id: toastId });
        } finally {
            setUploadingCert(false);
            if (certInputRef.current) certInputRef.current.value = '';
        }
    };

    const addEducationRow = () => {
        setMainDetails(prev => ({ ...prev, education_history: [...prev.education_history, ''] }));
    };
    const updateEducationRow = (index: number, val: string) => {
        setMainDetails(prev => {
            const newArr = [...prev.education_history];
            newArr[index] = val;
            return { ...prev, education_history: newArr };
        });
    };
    const removeEducationRow = (index: number) => {
        setMainDetails(prev => ({ ...prev, education_history: prev.education_history.filter((_, i) => i !== index) }));
    };

    const addEstimateRow = () => {
        if (priceEstimates.length >= 10) return;
        setPriceEstimates(prev => [...prev, { label: '', min: '', max: '' }]);
    };

    const removeEstimateRow = (i: number) => setPriceEstimates(prev => prev.filter((_, idx) => idx !== i));

    const updateEstimateRow = (i: number, field: 'label' | 'min' | 'max', val: string) => {
        setPriceEstimates(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
    };

    const generateBioPrompt = () => {
        const name = fullProfile?.full_name || 'the worker';
        const trade = fullProfile?.trade_category || 'a skilled trade';
        const secondary = fullProfile?.secondary_trade ? ` and ${fullProfile.secondary_trade}` : '';
        const experience = fullProfile?.years_experience ? `${fullProfile.years_experience} years` : 'several years';
        const district = fullProfile?.home_district || 'Sri Lanka';
        const skills = fullProfile?.sub_skills?.slice(0, 5).join(', ') || 'various specialized skills';
        const languages = fullProfile?.languages_spoken?.join(', ') || 'local languages';
        const warranty = fullProfile?.service_warranty ? `\n- Service guarantee: ${fullProfile.service_warranty}` : '';

        return `Please write a short, professional, and trustworthy "About Me" bio for a skilled tradesperson. Keep it warm, confident, and customer-focused.

STRICT RULES:
- MAXIMUM 350 CHARACTERS TOTAL. It must be extremely short.
- DO NOT use any em dashes (—) or en dashes (–). Use commas or periods instead.
- Write in the first person ("I").
- 2 sentences maximum.

Here are their details:
- Name: ${name}
- Profession: ${trade}${secondary}
- Years of experience: ${experience}
- Based in: ${district}, Sri Lanka
- Key skills: ${skills}
- Languages spoken: ${languages}${warranty}

The bio should:
1. Highlight their experience and reliability
2. Mention their trade and key skills naturally
3. Sound human and trustworthy, not robotic
4. End with a call to action like inviting customers to get in touch`;
    };

    const handleCopyBioPrompt = () => {
        navigator.clipboard.writeText(generateBioPrompt());
        setBioPromptCopied(true);
        toast.success('Prompt copied! Paste it into ChatGPT.');
        setTimeout(() => setBioPromptCopied(false), 3000);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'active': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Verified Active' };
            case 'pending': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Under Review' };
            case 'suspended': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Suspended' };
            default: return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', label: 'Processing' };
        }
    };

    if (loading) return (
        <main className="flex-1 overflow-y-auto flex items-center justify-center pb-32 lg:pb-12">
            <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        </main>
    );

    const statusVis = getStatusStyles(fullProfile?.account_status || 'pending');

    return (
        <main className="flex-1 overflow-y-auto pb-32 lg:pb-12">
                <header className="h-20 border-b border-[#e2e8f0] flex items-center justify-between px-8 lg:px-12 bg-white/95 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-widest">My Partner Profile</h2>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-5xl mx-auto space-y-12">
                    {/* Public Preview Info Banner */}
                    <m.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#eff6ff] border border-[#bfdbfe] rounded-3xl p-6 flex items-center gap-6 shadow-sm"
                    >
                        <div className="w-12 h-12 bg-[#dbeafe] rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Eye className="w-6 h-6 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-black text-[#1e3a8a] uppercase tracking-tight">Public Preview Mode</h3>
                            <p className="text-[11px] font-bold text-[#1e3a8a]/70 uppercase tracking-widest leading-relaxed">
                                This is exactly how customers see your profile on the directory. To update your info or trade, contact Admin via WhatsApp.
                            </p>
                        </div>
                    </m.div>
                    {/* Profile Hero section */}
                    <div className="relative pt-20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-[#dbeafe]/50 to-transparent blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8">
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-[#bfdbfe] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
                                    <div 
                                        className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-white group cursor-pointer"
                                        onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                                    >
                                        <Image
                                            src={fullProfile?.profile_photo_url || '/grabme.png'}
                                            alt={fullProfile?.full_name || 'Profile'}
                                            fill
                                            className={`object-cover transition-all duration-300 ${uploadingPhoto ? 'opacity-50 grayscale blur-sm' : 'group-hover:opacity-80'}`}
                                        />
                                        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${uploadingPhoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            {uploadingPhoto ? (
                                                <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin drop-shadow-md" />
                                            ) : (
                                                <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm">
                                                    <Camera className="w-6 h-6 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/jpeg,image/png,image/webp" 
                                            onChange={handleProfilePhotoChange} 
                                            disabled={uploadingPhoto} 
                                        />
                                    </div>
                                    <div className={`absolute -bottom-2 -right-2 w-10 h-10 ${statusVis.bg} ${statusVis.border} border rounded-2xl flex items-center justify-center shadow-md bg-white`}>
                                        {fullProfile?.account_status === 'active' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 text-slate-400 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest leading-snug text-center max-w-[130px]">
                                        Headshots only. Invalid photos will cause deactivation.
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-3 pb-2 mt-4 md:mt-0">
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1 ${statusVis.bg} ${statusVis.border} border rounded-full text-xs font-black uppercase tracking-widest ${statusVis.text} bg-white shadow-sm`}>
                                        {statusVis.label}
                                    </span>
                                    {!editingMainDetails ? (
                                        <button 
                                            onClick={() => setEditingMainDetails(true)}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-transparent hover:border-blue-100"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit Basic Info
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleMainDetailsSave}
                                            disabled={savingMainDetails}
                                            className="text-[10px] font-black uppercase tracking-widest text-white bg-[#1d4ed8] hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                                        >
                                            <Save className="w-3.5 h-3.5" /> {savingMainDetails ? 'Saving...' : 'Save Info'}
                                        </button>
                                    )}
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-[#0f172a] ">{fullProfile?.full_name}</h1>
                                
                                {!editingMainDetails ? (
                                    fullProfile?.languages_spoken?.length > 0 ? (
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1 pb-1">
                                            {fullProfile.languages_spoken.map((lang: string) => (
                                                <span key={lang} className="px-2.5 py-1 bg-[#f1f5f9] border border-[#e2e8f0] text-[#475569] rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1 pb-1">
                                            <button onClick={() => setEditingMainDetails(true)} className="px-3 py-1.5 bg-blue-50/50 border border-blue-100 text-[#1d4ed8] hover:bg-blue-100/50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 shadow-sm">
                                                <Plus className="w-3 h-3" /> Add Spoken Languages
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1 pb-1">
                                        {['English', 'Sinhala (සිංහල)', 'Tamil (தமிழ்)'].map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => toggleLanguage(lang)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mainDetails.languages_spoken.includes(lang) ? 'bg-[#1d4ed8] text-white shadow-md' : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#1d4ed8]'}`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {fullProfile?.service_warranty && !editingMainDetails && (
                                    <div className="flex flex-wrap justify-center md:justify-start pt-1">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            {fullProfile.service_warranty}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-6 mt-4">
                                    <div className="flex flex-col items-center md:items-start gap-1 text-[#475569] text-sm font-bold uppercase tracking-widest">
                                        <p className="flex items-center gap-2"><BriefcaseIcon className="w-4 h-4" /> {fullProfile?.trade_category}</p>
                                        {fullProfile?.secondary_trade && fullProfile?.subscription_tier === 'pro' && (
                                            <p className="flex items-center gap-2 text-[#1d4ed8] text-[10px] mt-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                <BriefcaseIcon className="w-3 h-3" /> + {fullProfile.secondary_trade}
                                            </p>
                                        )}
                                    </div>
                                    <p className="flex items-center gap-2 text-[#475569] text-sm font-bold uppercase tracking-widest"><MapPin className="w-4 h-4" /> {fullProfile?.home_district}, {fullProfile?.town}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Summary */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white border border-[#e2e8f0] rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#1d4ed8] flex items-center gap-2">
                                    <Award className="w-4 h-4" /> Professional Pulse
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#64748b] text-sm font-bold uppercase tracking-widest">Experience</p>
                                        {!editingMainDetails ? (
                                            <p className="text-[#0f172a] font-black">{fullProfile?.years_experience}+ Years</p>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    value={mainDetails.years_experience} 
                                                    onChange={(e) => setMainDetails({ ...mainDetails, years_experience: e.target.value })}
                                                    className="w-20 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm font-black text-[#0f172a]"
                                                />
                                                <span className="text-[#0f172a] font-black text-xs uppercase">Yrs</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#64748b] text-sm font-bold uppercase tracking-widest">ID Verified</p>
                                        <p className={fullProfile?.is_identity_verified ? 'text-emerald-600 font-black' : 'text-[#64748b] font-bold'}>{fullProfile?.is_identity_verified ? 'YES' : 'PENDING'}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#64748b] text-sm font-bold uppercase tracking-widest">Reference</p>
                                        <p className={fullProfile?.is_reference_checked ? 'text-emerald-600 font-black' : 'text-[#64748b] font-bold'}>{fullProfile?.is_reference_checked ? 'VERIFIED' : 'PENDING'}</p>
                                    </div>
                                    

                                </div>
                            </div>

                            <div className="bg-white border border-[#e2e8f0] rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#1d4ed8] flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Identity Contact
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#64748b] mb-1">WhatsApp</p>
                                        {!editingMainDetails ? (
                                            <p className="text-sm font-bold text-[#0f172a]">{fullProfile?.phone}</p>
                                        ) : (
                                            <input 
                                                type="tel" 
                                                value={mainDetails.phone} 
                                                onChange={(e) => setMainDetails({ ...mainDetails, phone: e.target.value })}
                                                className="w-full px-3 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm font-bold text-[#0f172a]"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#64748b] mb-1">NIC Number</p>
                                        <p className="text-sm font-bold text-[#0f172a]">{fullProfile?.nic_number}</p>
                                    </div>
                                </div>
                            </div>

                            {/* SOCIAL MEDIA HUB */}
                            <div className="bg-white border border-[#e2e8f0] rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group shadow-sm">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#eff6ff] blur-3xl group-hover:scale-150 transition-transform" />

                                <div className="flex items-center justify-between relative z-10">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[#1d4ed8] flex items-center gap-2">
                                        <Share2 className="w-4 h-4" /> Digital Footprint
                                    </h3>
                                    <button
                                        onClick={handleSocialSave}
                                        disabled={savingSocials}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] hover:text-[#1e3a8a] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <Save className="w-3.5 h-3.5" /> {savingSocials ? 'Saving...' : 'Save Links'}
                                    </button>
                                </div>

                                {/* Trust Booster Nudge */}
                                <div className="p-4 bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl relative z-10">
                                    <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider leading-relaxed">
                                        💡 Tip: Partners with social links are <span className="text-[#1d4ed8] font-black">70% more likely</span> to be hired. It builds instant trust!
                                    </p>
                                </div>

                                <div className="space-y-5 relative z-10">
                                    {[
                                        { id: 'video_pitch_url', icon: Globe, label: 'Video Pitch URL', placeholder: 'https://youtube.com/...' },
                                        { id: 'instagram_url', icon: Globe, label: 'Instagram URL', placeholder: 'https://instagram.com/work...' },
                                        { id: 'tiktok_url', icon: Music, label: 'TikTok URL', placeholder: 'https://tiktok.com/@yourname...' },
                                        { id: 'facebook_url', icon: Share2, label: 'Facebook URL', placeholder: 'https://facebook.com/page...' },
                                    ].map((social) => (
                                        <div key={social.id} className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em] ml-1">
                                                <social.icon className="w-3 h-3 text-[#1d4ed8]" /> {social.label}
                                            </label>
                                            <input
                                                type="url"
                                                value={(socialLinks as any)[social.id]}
                                                onChange={(e) => setSocialLinks((prev: any) => ({ ...prev, [social.id]: e.target.value }))}
                                                placeholder={social.placeholder}
                                                className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1d4ed8] transition-all shadow-inner"
                                                title={social.id === 'video_pitch_url' ? 'Please upload a 16:9 landscape format video' : ''}
                                            />
                                            {social.id === 'video_pitch_url' && (
                                                <p className="text-[10px] font-bold text-[#1d4ed8] uppercase tracking-wider ml-1 mt-1 flex items-center gap-1.5">
                                                    <AlertCircle className="w-3 h-3" /> Please upload in 16:9 landscape format
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white border border-[#e2e8f0] shadow-sm rounded-[3rem] p-10 md:p-12 space-y-10">
                                {/* Bio Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#64748b] border-l-2 border-[#1d4ed8] pl-4 py-1">About My Craft</h3>
                                    {!editingMainDetails ? (
                                        <p className="text-lg text-[#0f172a] leading-relaxed font-medium italic">
                                            "{fullProfile?.short_bio || 'No bio provided.'}"
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            <textarea 
                                                value={mainDetails.short_bio} 
                                                onChange={(e) => setMainDetails({ ...mainDetails, short_bio: e.target.value })}
                                                rows={4}
                                                placeholder="Tell customers about your expertise..."
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-400 text-sm font-medium text-[#0f172a] resize-none no-scrollbar"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowBioGenerator(true)}
                                                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#7c3aed] bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-2.5 rounded-xl transition-all"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" /> Generate Bio with ChatGPT
                                            </button>
                                        </div>
                                    )}

                                    {/* Bio Generator Modal */}
                                    {showBioGenerator && (
                                        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBioGenerator(false)} />
                                            <div className="relative bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90dvh]">
                                                {/* Sticky Header */}
                                                <div className="flex items-start justify-between p-6 md:p-8 pb-4 border-b border-slate-100 flex-shrink-0">
                                                    <div>
                                                        <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2">
                                                            <Sparkles className="w-5 h-5 text-[#7c3aed]" /> AI Bio Generator
                                                        </h3>
                                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Copy prompt → Paste in ChatGPT → Copy result back</p>
                                                    </div>
                                                    <button onClick={() => setShowBioGenerator(false)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Scrollable Content */}
                                                <div className="overflow-y-auto flex-1 p-6 md:p-8 pt-5 space-y-5">
                                                    {/* Steps */}
                                                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4">
                                                        <div className="flex flex-wrap gap-3 text-xs font-black text-[#166534] uppercase tracking-wider">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                                                                Copy the prompt
                                                            </span>
                                                            <ChevronLeft className="w-3 h-3 text-emerald-400 rotate-180 self-center" />
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                                                                Open ChatGPT
                                                            </span>
                                                            <ChevronLeft className="w-3 h-3 text-emerald-400 rotate-180 self-center" />
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                                                                Paste &amp; get your bio!
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* The Prompt */}
                                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                                        {generateBioPrompt()}
                                                    </div>
                                                </div>

                                                {/* Sticky Footer Actions */}
                                                <div className="flex gap-3 p-6 md:p-8 pt-4 border-t border-slate-100 flex-shrink-0">
                                                    <button
                                                        onClick={handleCopyBioPrompt}
                                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${bioPromptCopied ? 'bg-emerald-500 text-white' : 'bg-[#1d4ed8] text-white hover:bg-blue-700'}`}
                                                    >
                                                        {bioPromptCopied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                                                        {bioPromptCopied ? 'Copied!' : 'Copy Prompt'}
                                                    </button>
                                                    <a
                                                        href="https://chatgpt.com/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest bg-[#10a37f] text-white hover:bg-emerald-700 transition-all"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Open ChatGPT
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Secondary Trade Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#64748b] border-l-2 border-[#1d4ed8] pl-4 py-1 flex items-center justify-between">
                                        <span>Secondary Trade</span>
                                        {fullProfile?.subscription_tier === 'pro' && (
                                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] flex items-center gap-1"><Star className="w-3 h-3" /> Pro Feature</span>
                                        )}
                                    </h3>
                                    
                                    {fullProfile?.subscription_tier !== 'pro' ? (
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                                            <Lock className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                                            <h4 className="text-sm font-bold text-slate-700">Multi-Trade is a Pro Feature</h4>
                                            <p className="text-xs text-slate-500 mt-1 mb-4">Upgrade your plan to appear in customer searches for a second trade category.</p>
                                            <Link href="/dashboard/billing" className="inline-flex items-center gap-2 bg-[#1d4ed8] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors">
                                                Upgrade to Pro
                                            </Link>
                                        </div>
                                    ) : (
                                        <>
                                            {!editingMainDetails ? (
                                                <p className="text-lg text-[#0f172a] leading-relaxed font-medium italic">
                                                    {fullProfile?.secondary_trade || 'No secondary trade selected. Edit Basic Info to add one.'}
                                                </p>
                                            ) : (
                                                <CustomSelect
                                                    options={[
                                                        { value: '', label: 'None' },
                                                        ...allTrades.filter(t => t !== fullProfile?.trade_category).map(t => ({ value: t, label: t }))
                                                    ]}
                                                    value={mainDetails.secondary_trade || ''}
                                                    onChange={(val: string) => setMainDetails({ ...mainDetails, secondary_trade: val })}
                                                    placeholder="Select a secondary trade"
                                                />
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Skills Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#64748b] border-l-2 border-[#1d4ed8] pl-4 py-1">Expertise & Skills</h3>
                                        {!editingSkills ? (
                                            <button 
                                                onClick={() => {
                                                    setSelectedSkills(fullProfile?.sub_skills || []);
                                                    setEditingSkills(true);
                                                }}
                                                className="text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Edit Skills
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={handleSkillsSave}
                                                disabled={savingSkills}
                                                className="text-[10px] font-black uppercase tracking-widest text-white bg-[#1d4ed8] hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                                            >
                                                <Save className="w-3.5 h-3.5" /> {savingSkills ? 'Saving...' : 'Save'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {!editingSkills ? (
                                        <div className="flex flex-wrap gap-2">
                                            {fullProfile?.sub_skills?.map((skill: string, i: number) => (
                                                <span key={i} className="px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#475569]">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">Select Your Services</label>
                                                <p className="text-[11px] font-medium text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-lg border border-blue-100 inline-block">
                                                    💡 <strong>Format Tip:</strong> When adding a custom skill, please use <strong>English (සිංහල)</strong> format.
                                                </p>
                                            </div>
                                            <CustomSelect
                                                isMulti
                                                allowCustom
                                                options={availableSkills}
                                                value={selectedSkills}
                                                onChange={(vals: string[]) => setSelectedSkills(vals)}
                                                placeholder="Add your specific skills..."
                                            />
                                            {selectedSkills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {selectedSkills.map((s: string) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => toggleSubSkill(s)}
                                                            className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-[#1d4ed8] text-[#1d4ed8] flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
                                                        >
                                                            {s} <X className="w-3 h-3" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Education & Certifications Section */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#64748b] border-l-2 border-[#1d4ed8] pl-4 py-1">Education & Certifications</h3>
                                    
                                    {/* Education History */}
                                    <div className="p-6 bg-white border border-[#e2e8f0] shadow-sm rounded-2xl space-y-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-widest mb-1 flex items-center gap-2"><Award className="w-4 h-4 text-[#1d4ed8]" /> Educational Background</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Add your O/L, A/L or technical studies</p>
                                            </div>
                                        </div>

                                        {!editingMainDetails ? (
                                            <div className="space-y-2">
                                                {fullProfile?.education_history?.length > 0 ? (
                                                    fullProfile.education_history.map((edu: string, i: number) => (
                                                        <div key={i} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-[#475569] uppercase tracking-widest">
                                                            • {edu}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-400 italic">No education details added yet.</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {mainDetails.education_history.map((edu, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <input 
                                                            type="text" 
                                                            value={edu}
                                                            onChange={(e) => updateEducationRow(i, e.target.value)}
                                                            placeholder="e.g. Zahira College Colombo O/L 2022"
                                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1d4ed8] text-xs font-bold text-[#0f172a] placeholder:text-slate-400 uppercase tracking-wider"
                                                        />
                                                        <button onClick={() => removeEducationRow(i)} className="w-10 h-10 flex flex-shrink-0 items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {mainDetails.education_history.length < 5 && (
                                                    <button onClick={addEducationRow} className="text-[10px] font-black uppercase tracking-widest text-[#1d4ed8] hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-dashed border-[#1d4ed8]">
                                                        <Plus className="w-3 h-3" /> Add Education Row
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Certificate Upload */}
                                    <div className="p-6 bg-white border border-[#e2e8f0] shadow-sm rounded-2xl space-y-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-widest mb-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-500" /> Trust Certification</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider max-w-sm">Boost client trust by uploading your best credential. <span className="text-amber-600">Free Version: 1 Certificate Allowed.</span></p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                            <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                                {fullProfile?.certificate_url ? (
                                                    fullProfile.certificate_url.endsWith('.pdf') ? (
                                                        <div className="flex flex-col items-center justify-center w-full h-full text-red-500">
                                                            <span className="text-[10px] font-black uppercase tracking-widest">PDF</span>
                                                        </div>
                                                    ) : (
                                                        <Image src={fullProfile.certificate_url} alt="Certificate" fill className="object-cover" />
                                                    )
                                                ) : (
                                                    <Award className="w-8 h-8 text-slate-300" />
                                                )}
                                                
                                                <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity cursor-pointer ${uploadingCert ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} onClick={() => !uploadingCert && certInputRef.current?.click()}>
                                                    {uploadingCert ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                                                </div>
                                                <input type="file" ref={certInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleCertificateUpload} disabled={uploadingCert} />
                                            </div>

                                            <div className="flex-1 w-full space-y-3">
                                                {!editingMainDetails ? (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Certificate Name</p>
                                                        <p className="text-sm font-black text-[#0f172a] uppercase tracking-widest">{fullProfile?.certificate_name || 'Unnamed Certificate'}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name this certificate</p>
                                                        <input 
                                                            type="text" 
                                                            value={mainDetails.certificate_name}
                                                            onChange={(e) => setMainDetails(prev => ({ ...prev, certificate_name: e.target.value }))}
                                                            placeholder="e.g. Technical College Electrician Diploma"
                                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#1d4ed8] text-xs font-bold text-[#0f172a] placeholder:text-slate-400 uppercase tracking-wider shadow-sm"
                                                        />
                                                    </div>
                                                )}
                                                {fullProfile?.certificate_url && (
                                                    <a href={fullProfile.certificate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
                                                        <Eye className="w-3 h-3" /> View Uploaded File
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Network Section */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#64748b] border-l-2 border-[#1d4ed8] pl-4 py-1">Service Coverage</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-4 p-4 bg-white border border-[#e2e8f0] shadow-sm rounded-2xl">
                                            <div className="w-10 h-10 bg-[#eff6ff] rounded-xl flex items-center justify-center text-[#1d4ed8]">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-1">Base District</p>
                                                {!editingMainDetails ? (
                                                    <p className="text-sm font-black text-[#0f172a]">{fullProfile?.home_district}</p>
                                                ) : (
                                                    <CustomSelect
                                                        options={DISTRICTS}
                                                        value={mainDetails.home_district}
                                                        onChange={(val: string) => setMainDetails({ ...mainDetails, home_district: val })}
                                                        placeholder="Select District"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white border border-[#e2e8f0] shadow-sm rounded-2xl">
                                            <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center text-emerald-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Partner Since</p>
                                                <p className="text-sm font-black text-[#0f172a]">{new Date(fullProfile?.created_at).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl">
                                        <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-4 px-1">Districts Covered</p>
                                        {!editingMainDetails ? (
                                            <div className="flex flex-wrap gap-2">
                                                {fullProfile?.districts_covered?.map((d: string, i: number) => (
                                                    <span key={i} className="text-[11px] font-bold text-[#0f172a] bg-white border border-[#e2e8f0] px-3 py-1 rounded-lg shadow-sm">
                                                        {d}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <CustomSelect
                                                    isMulti
                                                    options={DISTRICTS}
                                                    value={mainDetails.districts_covered}
                                                    onChange={(vals: string[]) => setMainDetails({ ...mainDetails, districts_covered: vals })}
                                                    placeholder="Select covered districts"
                                                />
                                                {mainDetails.districts_covered.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {mainDetails.districts_covered.map((d: string) => (
                                                            <button
                                                                key={d}
                                                                onClick={() => toggleDistrictCovered(d)}
                                                                className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-[#1d4ed8] text-[#1d4ed8] flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
                                                            >
                                                                {d} <X className="w-3 h-3" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Warranty Section */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#64748b] border-l-2 border-[#1d4ed8] pl-4 py-1">Service Guarantees</h3>
                                    <div className="p-6 bg-white border border-[#e2e8f0] shadow-sm rounded-2xl space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                                    Boost customer trust by offering a clear warranty. If you fix an item and it breaks again within your warranty period, you fix it for free.
                                                </p>
                                                {!editingMainDetails ? (
                                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                        <p className="text-sm font-black text-[#0f172a] uppercase tracking-widest">
                                                            {fullProfile?.service_warranty || 'No warranty offered'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. 7-Day Free Repair Guarantee"
                                                            value={mainDetails.service_warranty} 
                                                            onChange={(e) => setMainDetails({ ...mainDetails, service_warranty: e.target.value })}
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-sm font-bold text-[#0f172a] placeholder:text-slate-400 transition-all uppercase tracking-widest"
                                                        />
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                                                            <HelpCircle className="w-3 h-3" /> Examples: "48-Hour Leak Free Guarantee", "30-Day Service Warranty"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── PRICING TRANSPARENCY CARD ── */}
                            <div className="bg-white border border-[#e2e8f0] rounded-[2.5rem] p-8 md:p-12 space-y-8 relative overflow-hidden group shadow-sm">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fefce8] blur-3xl group-hover:scale-150 transition-transform" />

                                <div className="flex items-center justify-between relative z-10">
                                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#b45309] border-l-2 border-[#b45309] pl-4 py-1 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Pricing Transparency
                                    </h3>
                                    <button
                                        onClick={handlePricingSave}
                                        disabled={savingPricing}
                                        className="text-[10px] font-black uppercase tracking-widest text-white bg-[#b45309] hover:bg-[#92400e] px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                                    >
                                        <Save className="w-3.5 h-3.5" /> {savingPricing ? 'Saving...' : 'Save Pricing'}
                                    </button>
                                </div>

                                {/* Tip */}
                                <div className="p-5 bg-[#fef9c3] border border-[#fde68a] rounded-2xl relative z-10 flex items-start gap-4">
                                    <div className="text-2xl mt-0.5">💡</div>
                                    <p className="text-[11px] font-bold text-[#78350f] uppercase tracking-wider leading-relaxed">
                                        Workers who show their visiting fee get <span className="text-[#b45309] font-black">3x more inquiries</span>. Customers in Sri Lanka hate surprise fees! Be transparent to build trust.
                                    </p>
                                </div>

                                {/* Base Visiting Fee */}
                                <div className="space-y-3 relative z-10">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em] ml-1">
                                        <DollarSign className="w-3 h-3 text-[#b45309]" />
                                        Base Visiting / Inspection Fee (LKR)
                                        <span
                                            title="This is the fee you charge just to visit and inspect the job, even if no work is done. E.g. 1500. Leave blank if you don't charge one."
                                            className="cursor-help"
                                        >
                                            <HelpCircle className="w-3 h-3 text-[#94a3b8] hover:text-[#b45309] transition-colors" />
                                        </span>
                                    </label>
                                    <div className="relative max-w-sm">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#94a3b8]">LKR</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={baseVisitingFee}
                                            onChange={e => setBaseVisitingFee(e.target.value)}
                                            placeholder="e.g. 1500"
                                            className="w-full bg-white border border-[#e2e8f0] rounded-xl pl-14 pr-4 py-4 text-sm font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#b45309] transition-all shadow-inner"
                                        />
                                    </div>
                                    <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest ml-1">Leave blank if you don't charge a visiting fee</p>
                                </div>

                                {/* Price Estimates */}
                                <div className="space-y-4 relative z-10 pt-4 border-t border-[#e2e8f0]">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em] ml-1">
                                            <Tag className="w-3 h-3 text-[#b45309]" />
                                            Price Estimate Chart
                                            <span
                                                title="Add your standard job rates here. E.g. 'AC Gas Refill – LKR 6,000 to 8,000'. This helps customers know what to expect before they call. Max 10 rows."
                                                className="cursor-help"
                                            >
                                                <HelpCircle className="w-3 h-3 text-[#94a3b8] hover:text-[#b45309] transition-colors" />
                                            </span>
                                        </label>
                                        {priceEstimates.length < 10 && (
                                            <button
                                                onClick={addEstimateRow}
                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#b45309] hover:text-[#92400e] transition-colors bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Add Row
                                            </button>
                                        )}
                                    </div>

                                    {priceEstimates.length === 0 && (
                                        <div
                                            onClick={addEstimateRow}
                                            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-[#fde68a] rounded-2xl text-[#b45309] text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-[#fef9c3] transition-colors"
                                        >
                                            <Plus className="w-6 h-6" /> 
                                            <span>Add your first price estimate</span>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {/* Header row */}
                                        {priceEstimates.length > 0 && (
                                            <div className="grid grid-cols-[1fr_100px_100px_40px] gap-3 px-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Service / Job Type</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] text-center">Min (LKR)</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] text-center">Max (LKR)</span>
                                                <span />
                                            </div>
                                        )}
                                        {priceEstimates.map((row, i) => (
                                            <div key={i} className="grid grid-cols-[1fr_100px_100px_40px] gap-3 items-center">
                                                <input
                                                    type="text"
                                                    value={row.label}
                                                    onChange={e => updateEstimateRow(i, 'label', e.target.value)}
                                                    placeholder="e.g. AC Gas Refill"
                                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#b45309] focus:bg-white transition-all"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={row.min}
                                                    onChange={e => updateEstimateRow(i, 'min', e.target.value)}
                                                    placeholder="6000"
                                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-3 text-xs font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#b45309] focus:bg-white transition-all text-center"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={row.max}
                                                    onChange={e => updateEstimateRow(i, 'max', e.target.value)}
                                                    placeholder="8000"
                                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-3 text-xs font-bold text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#b45309] focus:bg-white transition-all text-center"
                                                />
                                                <button
                                                    onClick={() => removeEstimateRow(i)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-[#94a3b8] hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="px-12 py-10 border-t border-[#e2e8f0] flex justify-between items-center text-xs font-bold text-[#64748b] uppercase tracking-widest mt-12">
                    <span>© 2026 Grab Me Professional Portal</span>
                    <span className="text-[#334155]">Powered by Mr² Labs</span>
                </div>
            </main>
    );
}
