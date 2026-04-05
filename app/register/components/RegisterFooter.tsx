'use client'
import Image from 'next/image'

export default function RegisterFooter() {
    return (
        <footer className="py-20 px-6 lg:px-12 border-t" style={{ background: '#090A0F', borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-12 text-center lg:text-left mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                            <Image src="/grabme.png" alt="Logo" width={32} height={32} />
                            <span className="text-white text-xl font-black uppercase tracking-tighter">Grab Me</span>
                        </div>
                        <p className="text-sm text-white/20 font-bold uppercase tracking-widest">Sri Lanka's Preferred Home Service Network</p>
                    </div>
                </div>
                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-8" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">© 2026 Grab Me Logic (Pvt) Ltd.</span>
                    <div className="text-[10px] font-black uppercase tracking-[1em] text-white/30 flex items-center gap-4">
                        <div className="w-8 h-[1px] bg-white/10"></div>
                        Powered by Mr² Labs
                        <div className="w-8 h-[1px] bg-white/10"></div>
                    </div>
                    <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">Colombo · South Asia</span>
                </div>
            </div>
        </footer>
    );
}
