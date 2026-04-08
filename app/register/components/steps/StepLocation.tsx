'use client'
import { useState } from 'react'
import { m } from 'framer-motion'
import { DISTRICTS } from '../../constants'
import { Check, MapPin, Navigation, X } from 'lucide-react'
import { toast } from 'sonner'
import { CustomSelect } from '@/app/components/ui/CustomSelect'

interface StepLocationProps {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    toggleDistrictCovered: (district: string) => void;
    setDistrictsCovered: (districts: string[]) => void;
}

export default function StepLocation({ formData, handleInputChange, toggleDistrictCovered, setDistrictsCovered }: StepLocationProps) {
    const [detecting, setDetecting] = useState(false);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setDetecting(true);
        const toastId = toast.loading("Detecting your location...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    if (data.address) {
                        const town = data.address.suburb || data.address.town || data.address.city || data.address.village || "";
                        const district = data.address.state_district || data.address.county || "";
                        
                        // Clean district name (Nominatim often includes ' District')
                        const cleanDistrict = district.replace(" District", "").trim();
                        const matchedDistrict = DISTRICTS.find(d => cleanDistrict.toLowerCase().includes(d.toLowerCase()));

                        handleInputChange({ target: { name: 'town', value: town } } as any);
                        if (matchedDistrict) {
                            handleInputChange({ target: { name: 'homeDistrict', value: matchedDistrict } } as any);
                        }

                        toast.success(`Detected: ${town}${matchedDistrict ? `, ${matchedDistrict}` : ''}`, { id: toastId });
                    } else {
                        throw new Error("Could not result location details");
                    }
                } catch (err) {
                    console.error("GPS Error:", err);
                    toast.error("Could not detect location. Please enter manually.", { id: toastId });
                } finally {
                    setDetecting(false);
                }
            },
            (error) => {
                setDetecting(false);
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error("Location access denied. Please select manually.", { id: toastId });
                } else {
                    toast.error("GPS Error. Please enter location manually.", { id: toastId });
                }
            },
            { timeout: 10000 }
        );
    };

    return (
        <m.div key="4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Base</label>
                    <button 
                        onClick={detectLocation}
                        disabled={detecting}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-[9px] font-black uppercase tracking-wider text-[#1d4ed8] active:scale-95 transition-all disabled:opacity-50 shadow-sm shadow-blue-500/5 group"
                    >
                        <Navigation className={`w-3 h-3 ${detecting ? 'animate-pulse' : ''}`} />
                        {detecting ? 'Analyzing...' : 'Auto Detect'}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Home Town</label>
                        <div className="relative">
                            <input 
                                name="town" 
                                value={formData.town} 
                                onChange={handleInputChange} 
                                placeholder="e.g. Maharagama" 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold placeholder:text-slate-300 transition-all font-outfit" 
                            />
                            <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Home District</label>
                        <CustomSelect
                            options={DISTRICTS}
                            value={formData.homeDistrict}
                            onChange={(val: string) => handleInputChange({ target: { name: 'homeDistrict', value: val } } as any)}
                            placeholder="Select District"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Service Coverage (Districts)</label>
                    
                    <CustomSelect
                        isMulti
                        options={DISTRICTS}
                        value={formData.districtsCovered}
                        onChange={(vals: string[]) => setDistrictsCovered(vals)}
                        placeholder="Select districts you cover"
                    />

                    {formData.districtsCovered.length > 0 && (
                        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2 px-1 snap-x">
                            {formData.districtsCovered.map((d: string) => (
                                <button
                                    key={d}
                                    onClick={() => toggleDistrictCovered(d)}
                                    className="flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 border border-blue-100 text-[#1d4ed8] flex items-center gap-2 active:bg-red-50 active:border-red-100 active:text-red-600 transition-all snap-start shadow-sm shadow-blue-500/5 group"
                                >
                                    {d} <X className="w-3 h-3 text-blue-400 group-active:text-red-400" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Travel Radius</label>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-[#1d4ed8]">{formData.travelRadius}</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">KM</span>
                        </div>
                    </div>
                    <div className="relative pt-2">
                        <input
                            type="range" min="5" max="100" step="5"
                            value={formData.travelRadius}
                            onChange={(e) => handleInputChange({ target: { name: 'travelRadius', value: e.target.value } } as any)}
                            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#1d4ed8] focus:outline-none"
                        />
                        <div className="flex justify-between mt-3">
                            <span className="text-[8px] font-black text-slate-300 uppercase">5KM</span>
                            <span className="text-[8px] font-black text-slate-300 uppercase">Local Range</span>
                            <span className="text-[8px] font-black text-slate-300 uppercase">100KM</span>
                        </div>
                    </div>
                </div>
            </div>
        </m.div>
    );
}
