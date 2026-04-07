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
        <m.div key="4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Service Area</h2>
                    <p className="text-sm text-slate-500">Where do you work?</p>
                </div>
                <button 
                    onClick={detectLocation}
                    disabled={detecting}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-700 hover:bg-blue-100 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                >
                    <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-pulse' : ''}`} />
                    {detecting ? 'Detecting...' : 'Detect My District'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Home Town</label>
                    <input name="town" value={formData.town} onChange={handleInputChange} placeholder="Maharagama" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-sm placeholder:text-slate-300 text-slate-900" />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Home District</label>
                    <CustomSelect
                        options={DISTRICTS}
                        value={formData.homeDistrict}
                        onChange={(val: string) => handleInputChange({ target: { name: 'homeDistrict', value: val } } as any)}
                        placeholder="Search and select district..."
                    />
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Districts Covered (Multi-select)</label>
                </div>
                
                <CustomSelect
                    isMulti
                    options={DISTRICTS}
                    value={formData.districtsCovered}
                    onChange={(vals: string[]) => setDistrictsCovered(vals)}
                    placeholder="Search and select districts..."
                />

                {formData.districtsCovered.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {formData.districtsCovered.map((d: string) => (
                            <button
                                key={d}
                                onClick={() => toggleDistrictCovered(d)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all bg-blue-50 border border-blue-100 text-blue-700 flex items-center gap-2 group hover:bg-red-50 hover:border-red-100 hover:text-red-600 shadow-sm"
                            >
                                {d} <X className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Service Radius</label>
                    <span className="text-blue-700 font-black text-xs">{formData.travelRadius} KM</span>
                </div>
                <input
                    type="range" min="5" max="100" step="5"
                    value={formData.travelRadius}
                    onChange={(e) => handleInputChange({ target: { name: 'travelRadius', value: e.target.value } } as any)}
                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </m.div>
    );
}
