'use client'
import { useState } from 'react'
import { m } from 'framer-motion'
import { DISTRICTS } from '../../constants'
import { Check, MapPin, Navigation } from 'lucide-react'
import { toast } from 'sonner'

interface StepLocationProps {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    toggleDistrictCovered: (district: string) => void;
}

export default function StepLocation({ formData, handleInputChange, toggleDistrictCovered }: StepLocationProps) {
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
                    <h2 className="text-xl font-bold text-white">Service Area</h2>
                    <p className="text-sm text-white/30">Where do you work?</p>
                </div>
                <button 
                    onClick={detectLocation}
                    disabled={detecting}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50 active:scale-95"
                >
                    <Navigation className={`w-3 h-3 ${detecting ? 'animate-pulse' : ''}`} />
                    {detecting ? 'Detecting...' : 'Detect My District'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Home Town</label>
                    <input name="town" value={formData.town} onChange={handleInputChange} placeholder="Maharagama" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] outline-none text-sm placeholder:text-white/10" />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Home District</label>
                    <select name="homeDistrict" value={formData.homeDistrict} onChange={handleInputChange} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#4F46E5] outline-none text-sm [color-scheme:dark]">
                        <option value="" className="bg-[#18181B]">Select District</option>
                        {DISTRICTS.map(d => <option key={d} value={d} className="bg-[#18181B]">{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Districts Covered (Multi-select)</label>
                    <span className="text-indigo-400 font-black text-xs uppercase tracking-widest">{formData.districtsCovered.length} Selected</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {DISTRICTS.map(d => (
                        <button
                            key={d}
                            onClick={() => toggleDistrictCovered(d)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${formData.districtsCovered.includes(d)
                                ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'
                            }`}
                        >
                            {formData.districtsCovered.includes(d) && <Check className="w-3 h-3 text-white" />}
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Service Radius</label>
                    <span className="text-indigo-400 font-black text-xs">{formData.travelRadius} KM</span>
                </div>
                <input
                    type="range" min="5" max="100" step="5"
                    value={formData.travelRadius}
                    onChange={(e) => handleInputChange({ target: { name: 'travelRadius', value: e.target.value } } as any)}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#4F46E5]"
                />
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </m.div>
    );
}
