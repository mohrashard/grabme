import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { getAdminContactAction } from '../../actions/getAdminContactAction'
import { registerWorkerAction } from '../actions/registrationActions';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
];

async function validateFileBuffer(
  file: File,
  fieldName: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Convert File to buffer for MIME check
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Detect actual MIME from file magic bytes
    const detected = await fileTypeFromBuffer(buffer);
    
    if (!detected) {
      return { 
        valid: false, 
        error: `${fieldName}: Could not detect file type. Please upload a clear photo.` 
      };
    }
    
    if (!ALLOWED_IMAGE_TYPES.includes(detected.mime)) {
      return { 
        valid: false, 
        error: `${fieldName}: Only JPG, PNG, or WebP images are accepted.` 
      };
    }
    
    return { valid: true };
  } catch {
    return { 
      valid: false, 
      error: `${fieldName}: File validation failed. Please try again.` 
    };
  }
}

export function useRegistrationForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
    // Updated: Store bucket alongside file metadata
    const [pendingFiles, setPendingFiles] = useState<{ file: File; type: string; path: string; bucket: string }[]>([]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        nicNumber: '',
        dob: '',
        address: '',
        emergencyContact: '',
        profilePhotoUrl: '',
        nicFrontUrl: '',
        nicBackUrl: '',
        selfieUrl: '',
        pastWorkPhotos: [] as string[],
        certificateUrl: '',
        tradeCategory: '',
        subSkills: [] as string[],
        yearsExperience: 0,
        shortBio: '',
        previousEmployer: '',
        town: '',
        homeDistrict: '',
        districtsCovered: [] as string[],
        referenceName: '',
        referencePhone: '',
        agreedConduct: false,
        agreedTruth: false,
        travelRadius: 25,
    });

    const previewsRef = useRef(previews);
    useEffect(() => {
        previewsRef.current = previews;
    }, [previews]);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) router.push('/dashboard');
        };
        checkSession();

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            Object.values(previewsRef.current).forEach(url => URL.revokeObjectURL(url));
        };
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleSubSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            subSkills: prev.subSkills.includes(skill)
                ? prev.subSkills.filter(s => s !== skill)
                : [...prev.subSkills, skill]
        }));
    };

    const toggleDistrictCovered = (district: string) => {
        setFormData(prev => ({
            ...prev,
            districtsCovered: prev.districtsCovered.includes(district)
                ? prev.districtsCovered.filter(d => d !== district)
                : [...prev.districtsCovered, district]
        }));
    };

    const setSubSkills = (skills: string[]) => {
        setFormData(prev => ({ ...prev, subSkills: skills }));
    };

    const setDistrictsCovered = (districts: string[]) => {
        setFormData(prev => ({ ...prev, districtsCovered: districts }));
    };

    const handleFileUpload = async (filesOrEvent: any, type: string) => {
        // Fallback checks just in case the input passes the React SyntheticEvent
        let files: File[] = [];
        
        if (filesOrEvent && filesOrEvent.target && filesOrEvent.target.files) {
            files = Array.from(filesOrEvent.target.files);
        } else if (Array.isArray(filesOrEvent)) {
            files = filesOrEvent;
        } else if (filesOrEvent instanceof File) {
            files = [filesOrEvent];
        }

        if (files.length === 0) return;

        // Synchronous check for max photos before starting
        if (type === 'pastWorkPhotos') {
            const currentCount = formData.pastWorkPhotos.length;
            if (currentCount >= 5) {
                toast.error('Maximum 5 photos allowed for past work.');
                return;
            }
            if (currentCount + files.length > 5) {
                const allowedCount = 5 - currentCount;
                toast.warning(`Only ${allowedCount} more photos allowed. Some files will be skipped.`);
                files = files.slice(0, allowedCount);
            }
        }

        setUploading(type);
        try {
            const TARGET_SIZE_MB = 0.3;
            const options = {
                maxSizeMB: TARGET_SIZE_MB,
                maxWidthOrHeight: 1024,
                useWebWorker: false, // Turbopack/Next.js 16 often has issues resolving worker scripts
            };

            for (const file of files) {
                try {
                    let processedFile: File | Blob = file;
                    
                    // Cloud-sync placeholder / corrupted file check
                    // Ghost files from Android/Google Photos have a valid size metadata but are unreadable
                    if (!file || file.size === 0) {
                        toast.error(`"${file?.name || 'File'}" is empty or hasn't fully downloaded. Tap "Browse" to find it.`);
                        continue;
                    }

                    try {
                        // Quick check to see if the file bytes are actually physically present/readable on device
                        await file.slice(0, 1).arrayBuffer();
                    } catch (readError) {
                        toast.error(`"${file.name}" is a cloud-only file and hasn't downloaded to your phone. Tap "Browse" at the top to select fully downloaded photos.`);
                        continue;
                    }
                    
                    // Only compress if the file is larger than our target AND size is accessible
                    if (file && file.size && file.size > TARGET_SIZE_MB * 1024 * 1024) {
                        try {
                            processedFile = await imageCompression(file, options);
                        } catch (compressionError) {
                            console.warn("Compression failed, using uncompressed file", compressionError);
                            processedFile = file; // Fallback to raw file if compression fails
                        }
                    }

                    let fallbackExt = file?.type?.split('/')?.[1] || 'jpg';
                    if (fallbackExt === 'jpeg') fallbackExt = 'jpg';
                    
                    let fileExt = (file?.name?.split('.')?.pop()?.toLowerCase()) || fallbackExt;
                    if (fileExt === 'jpeg') fileExt = 'jpg';

                    // Strict whitelist to match RLS policies exactly
                    const allowedExts = ['png', 'jpg', 'webp'];
                    if (!allowedExts.includes(fileExt)) {
                        toast.error(`"${file.name}" is an unsupported format (${fileExt}). Please use standard JPEG, PNG, or WebP images.`);
                        continue;
                    }
                    
                    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().split('-')[0] : Math.random().toString(36).substring(2, 8);
                    const fileName = `${formData.nicNumber || 'anon'}_${type}_${Date.now()}_${uniqueId}.${fileExt}`;
                    const filePath = `workers/${fileName}`;

                    // Ensure processed file has a valid MIME type, otherwise Android Chrome refuses to render the blob!
                    const fileBlob = processedFile instanceof File && processedFile.type
                        ? processedFile 
                        : new File([processedFile], fileName, { type: file.type || 'image/jpeg' });

                    const PRIVATE_TYPES = ['nicFrontUrl', 'nicBackUrl', 'selfieUrl'];
                    const bucket = PRIVATE_TYPES.includes(type) ? 'worker-documents' : 'avatars';

                    const previewKey = type === 'pastWorkPhotos' ? `pastWorkPhotos_${filePath}` : type;
                    
                    // For single-upload fields, revoke the previous preview if it exists
                    if (type !== 'pastWorkPhotos') {
                        setPreviews(prev => {
                            if (prev[type]) {
                                try { URL.revokeObjectURL(prev[type]); } catch(e) {}
                            }
                            return prev;
                        });
                    }
                    
                    const previewUrl = URL.createObjectURL(fileBlob);
                    setPreviews(prev => ({ ...prev, [previewKey]: previewUrl }));

                    setPendingFiles(prev => {
                        const filtered = type === 'pastWorkPhotos' 
                            ? prev 
                            : prev.filter(p => p.type !== type);
                        
                        return [...filtered, { file: fileBlob, type, path: filePath, bucket }];
                    });

                    setFormData(prev => {
                        if (type === 'pastWorkPhotos') {
                            if (prev.pastWorkPhotos.length >= 5) return prev;
                            return { ...prev, pastWorkPhotos: [...prev.pastWorkPhotos, filePath] };
                        }
                        return { ...prev, [type]: filePath };
                    });
                } catch (fileError: any) {
                    console.error('File Error [Raw]:', fileError);
                    let errorMessage = 'Image processing error';
                    try {
                        errorMessage = String(fileError) || errorMessage;
                    } catch (e) {}
                    
                    toast.error(`Error processing file. Try a different format. ${errorMessage}`);
                }
            }
        } catch (error: any) {
            console.error('Batch Process Error:', error);
            toast.error('Upload process failed.');
        } finally {
            setUploading(null);
        }
    };

    const handleFileRemove = (type: string, path?: string) => {
        const previewKey = type === 'pastWorkPhotos' ? `pastWorkPhotos_${path}` : type;
        const previewUrl = previews[previewKey];
        
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviews(prev => {
                const next = { ...prev };
                delete next[previewKey];
                return next;
            });
        }

        const targetPath = path || (formData as any)[type];
        setPendingFiles(prev => prev.filter(p => p.path !== targetPath));

        setFormData(prev => {
            if (type === 'pastWorkPhotos') {
                return { ...prev, pastWorkPhotos: prev.pastWorkPhotos.filter(p => p !== path) };
            }
            return { ...prev, [type]: '' };
        });
    };

    const canMoveToNext = (): boolean => {
        if (step === 1) return !!(formData.fullName && formData.email && formData.password && formData.phone && formData.nicNumber && formData.emergencyContact);
        if (step === 2) return !!(formData.profilePhotoUrl && formData.nicFrontUrl && formData.nicBackUrl);
        if (step === 3) return !!(formData.tradeCategory && formData.yearsExperience >= 0);
        if (step === 4) return !!(formData.homeDistrict && formData.town && formData.districtsCovered.length > 0);
        if (step === 5) return !!(formData.referenceName && formData.referencePhone);
        return true;
    };

    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const submitForm = async () => {
        if (loading) return; // Prevention: Multiple clicks
        setLoading(true);
        setFieldErrors({}); 
        try {
            // Create a copy of the current form data to populate with final paths
            const finalFormData = { ...formData };
            
            // Rebuild the array fields to ensure only the final uploaded paths are included
            finalFormData.pastWorkPhotos = [];
            finalFormData.subSkills = [...formData.subSkills];
            finalFormData.districtsCovered = [...formData.districtsCovered];

            for (const { file, bucket, type, path } of pendingFiles) {
                // 1. Double-check validation before touching storage
                const validation = await validateFileBuffer(file, type);
                if (!validation.valid) {
                    throw new Error(validation.error);
                }

                // 2. Generate a TRULY unique path at the exact moment of upload
                // This prevents "Resource already exists" on re-submissions
                // Extracting the extension safely from the previously sanitized `path`, NOT the raw `file.name`
                let fileExt = path?.split('.')?.pop()?.toLowerCase() || 'jpg';
                if (fileExt === 'jpeg') fileExt = 'jpg';
                
                const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
                    ? crypto.randomUUID() 
                    : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
                
                const finalPath = `workers/${uniqueId}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(finalPath, file, { upsert: false });
                
                if (uploadError) {
                    console.error(`Upload error [${bucket}]:`, uploadError.message);
                    throw new Error(`Upload to ${bucket} failed: ${uploadError.message}`);
                }

                // 3. Determine the value to store (Public URL vs Raw Path)
                let finalValue = finalPath;
                if (bucket === 'avatars') {
                    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(finalPath);
                    finalValue = publicUrl;
                }

                // 4. Update the specific field in our submission object
                if (type === 'pastWorkPhotos') {
                    finalFormData.pastWorkPhotos.push(finalValue);
                } else if (type === 'profilePhotoUrl') {
                    finalFormData.profilePhotoUrl = finalValue;
                } else if (type === 'certificateUrl') {
                    finalFormData.certificateUrl = finalValue;
                } else {
                    // Private document paths (NIC, Selfie)
                    (finalFormData as any)[type] = finalValue;
                }
            }

            console.log('--- SUBMITTING REGISTRATION ---', {
                name: finalFormData.fullName,
                nic: finalFormData.nicNumber,
                email: finalFormData.email,
                phone: finalFormData.phone,
                photosCount: finalFormData.pastWorkPhotos.length
            });

            const result = await registerWorkerAction(finalFormData);

            if (!result.success) {
                if (result.errors) {
                    setFieldErrors(result.errors);
                    const firstError = Object.values(result.errors)[0] as string;
                    toast.error(firstError, { description: 'Please check the highlighted fields.' });
                } else {
                    toast.error('Registration Failure', { description: result.error });
                }
                return;
            }

            toast.success('Registration successful!', { description: 'Your profile is under review.' });
            setPendingFiles([]);
            setRegistrationSuccess(true);
        } catch (error: any) {
            toast.error('Critical Registration Error', { description: 'Please try again later: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const triggerWhatsAppActivation = async () => {
        try {
            const message = `Activate my Grab Me account: ${formData.fullName} | ${formData.tradeCategory} | ${formData.homeDistrict}`;
            const { url } = await getAdminContactAction(message);
            window.location.href = url;
        } catch {
            toast.error('Could not open WhatsApp. Please contact support manually.');
        }
    };

    return {
        step,
        setStep,
        loading,
        uploading,
        mobileOpen,
        setMobileOpen,
        scrolled,
        formData,
        setFormData,
        handleInputChange,
        toggleSubSkill,
        toggleDistrictCovered,
        setSubSkills,
        setDistrictsCovered,
        handleFileUpload,
        handleFileRemove,
        canMoveToNext,
        submitForm,
        registrationSuccess,
        triggerWhatsAppActivation,
        previews,
        fieldErrors
    };
}
