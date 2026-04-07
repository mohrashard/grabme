import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Star, ShieldCheck, CheckCircle2, User, MessageCircle, Search, Info, Zap, Phone, Navigation, ChevronRight, Award } from 'lucide-react'
import RegisterHeader from '../register/components/RegisterHeader'
import Footer from '../components/Footer'
import LanguageTabs from './LanguageTabs'

export const metadata: Metadata = {
    title: 'How It Works | Grab Me — Sri Lanka Home Services',
    description: 'Learn how to find verified home workers or register as a professional on Grab Me. Available in English, Sinhala and Tamil. Serving all 25 districts in Sri Lanka.',
    openGraph: {
        title: 'How Grab Me Works — Sri Lanka Home Services',
        description: 'Step by step guide for customers and workers. NIC verified professionals. Direct WhatsApp contact. No commission.',
        url: 'https://www.grabme.page/how-it-works',
        locale: 'en_LK',
    },
}

interface PageProps {
    searchParams: Promise<{ lang?: string; role?: string }>;
}

export default async function HowItWorksPage({ searchParams }: PageProps) {
    const { lang = 'en', role = 'customer' } = await searchParams;
    const isWorker = role === 'worker';

    return (
        <div className="min-h-screen font-outfit bg-white text-[#334155] overflow-x-hidden">
            <RegisterHeader scrolled={true} />

            <main className="relative">
                {/* Hero Section */}
                <div className="pt-40 pb-20 px-6 bg-gradient-to-br from-[#1e3a8a] to-[#1d4ed8] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                        <nav className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#bfdbfe]">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-white">How It Works</span>
                        </nav>
                        
                        <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white uppercase">
                            {lang === 'en' ? 'How Grab Me Works' : lang === 'si' ? 'Grab Me ක්‍රියා කරන ආකාරය' : 'Grab Me எவ்வாறு செயல்படுகிறது'}
                        </h1>
                        <p className="text-[#bfdbfe] text-sm md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
                            {lang === 'en' 
                                ? 'Simple steps to find or offer home services across Sri Lanka' 
                                : lang === 'si' 
                                ? 'ශ්‍රී ලංකාව පුරා නිවාස සේවා සොයා ගැනීමට හෝ ලබා දීමට සරල පියවර' 
                                : 'இலங்கை முழுவதும் வீட்டுச் சேவைகளைக் கண்டறிய அல்லது வழங்க எளிய வழிமுறைகள்'}
                        </p>
                    </div>
                </div>

                {/* Tab Switcher Area */}
                <div className="bg-white border-b border-[#e2e8f0]">
                    <div className="max-w-4xl mx-auto">
                        <LanguageTabs currentLang={lang} currentRole={role} />
                    </div>
                </div>

                {/* Alternating Content Sections */}
                {isWorker ? <WorkerContent lang={lang} /> : <CustomerContent lang={lang} />}

                {/* Bottom CTA Section */}
                <BottomCTA lang={lang} />
            </main>

            <Footer />
        </div>
    )
}

function SectionHeading({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-4 mb-10">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#0f172a]">{title}</h2>
            <div className="h-[1px] flex-1 bg-[#e2e8f0]" />
        </div>
    )
}

function StepCard({ number, title, desc, icon: Icon }: { number: string; title: string; desc: string; icon: any }) {
    return (
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 md:p-10 space-y-6 group hover:border-[#1d4ed8]/30 hover:shadow-xl transition-all relative">
            <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#dbeafe] flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon className="w-6 h-6 text-[#1d4ed8]" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {number}
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#0f172a] uppercase tracking-tight">{title}</h3>
                <p className="text-[#334155] text-sm font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function TipBox({ title, desc, variant = 'indigo' }: { title: string; desc: string; variant?: 'indigo' | 'amber' }) {
    const isAmber = variant === 'amber';
    return (
        <div className={`p-8 rounded-3xl border ${isAmber ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'} space-y-3`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isAmber ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <Info className={`w-4 h-4 ${isAmber ? 'text-amber-600' : 'text-blue-600'}`} />
                </div>
                <h4 className={`text-xs font-bold uppercase tracking-widest ${isAmber ? 'text-amber-700' : 'text-blue-700'}`}>{title}</h4>
            </div>
            <p className="text-[#334155] text-xs font-semibold leading-relaxed uppercase tracking-wider">{desc}</p>
        </div>
    )
}

function SectionWrapper({ children, bg = 'white' }: { children: React.ReactNode, bg?: 'white' | 'slate' }) {
    return (
        <div className={`py-24 px-6 ${bg === 'slate' ? 'bg-[#f1f5f9]' : 'bg-white'}`}>
            <div className="max-w-4xl mx-auto">
                {children}
            </div>
        </div>
    )
}

function CustomerContent({ lang }: { lang: string }) {
    const isEn = lang === 'en';
    const isSi = lang === 'si';
    const isTa = lang === 'ta';

    return (
        <>
            <SectionWrapper bg="white">
                <SectionHeading title={isSi ? "වැඩකරුවෙකු සොයා ගන්නේ කෙසේද" : isTa ? "தொழிலாளியை எவ்வாறு கண்டுபிடிப்பது" : "Find a Worker"} />
                <div className="grid md:grid-cols-3 gap-6">
                    <StepCard number="01" title={isSi ? "නාමාවලිය සොයන්න" : isTa ? "அடைவை உலாவுங்கள்" : "Browse Directory"} desc={isSi ? "ශ්‍රී ලංකාව පුරා සිටින සියලු තහවුරු කළ වෘත්තිකයන් බැලීමට Browse පිටුවට යන්න." : isTa ? "இலங்கை முழுவதும் உள்ள அனைத்து சரிபார்க்கப்பட்ட நிபுணர்களையும் காண Browse பக்கத்திற்கு செல்லுங்கள்." : "Go to the Browse page to see all verified professionals across Sri Lanka."} icon={Search} />
                    <StepCard number="02" title={isSi ? "සේවාව තෝරන්න" : isTa ? "வடிகட்டுங்கள்" : "Filter by Need"} desc={isSi ? "ඔබට අවශ්‍ය සේවාව සහ ඔබේ දිස්ත්‍රික්කය තෝරන්න." : isTa ? "சேவை மற்றும் உங்கள் மாவட்டத்தை தேர்ந்தெடுங்கள்." : "Pick your service and your district."} icon={MapPin} />
                    <StepCard number="03" title={isSi ? "විස්තර පරීක්ෂා කරන්න" : isTa ? "சரிபாருங்கள்" : "Check Badges"} desc={isSi ? "නිල් පලිහ සහ කොළ සලකුණ සොයන්න." : isTa ? "நீல கேடயம் மற்றும் பச்சை சின்னம் தேடுங்கள்." : "Look for the blue shield and green badge."} icon={ShieldCheck} />
                </div>
            </SectionWrapper>

            <SectionWrapper bg="slate">
                <SectionHeading title={isSi ? "WhatsApp හරහා සම්බන්ධ වන්න" : isTa ? "WhatsApp மூலம் தொடர்பு கொள்ளுங்கள்" : "Contact on WhatsApp"} />
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white border border-[#e2e8f0] p-8 rounded-3xl space-y-6">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center"><MessageCircle className="w-6 h-6 text-green-600" /></div>
                        <p className="text-[#334155] font-medium leading-relaxed">
                            {isSi ? "\"WhatsApp හරහා සම්බන්ධ වන්න\" බොත්තම ක්ලික් කරන්න. WhatsApp ස්වයංක්රීයව විවෘත වේ." : isTa ? "\"WhatsApp இல் தொடர்பு கொள்ளுங்கள்\" பொத்தானை அழுத்துங்கள். WhatsApp தானாகவே திறக்கும்." : "Click the WhatsApp button on any profile. Your phone opens WhatsApp automatically."}
                        </p>
                    </div>
                    <TipBox variant="amber" title={isSi ? "ආරක්ෂිත ඉඟිය" : isTa ? "பாதுகாப்பு குறிப்பு" : "Safety Tip"} desc={isSi ? "වැඩකරු පැමිණීමට පෙර WhatsApp හරහා මිල තහවුරු කරන්න." : isTa ? "தொழிலாளி வருவதற்கு முன் WhatsApp மூலம் விலையை உறுதிப்படுத்துங்கள்." : "Always confirm the price over WhatsApp before the worker visits."} />
                </div>
            </SectionWrapper>

            {isEn && (
                <SectionWrapper bg="white">
                    <SectionHeading title="Review Before You Hire" />
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-3xl border border-[#e2e8f0] flex flex-col justify-center">
                            <ul className="space-y-4">
                                {['Real photos of past work', 'Years of experience', 'Districts covered', 'Social media (if linked)', 'Exact sub-skills'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[#334155] font-medium text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-[#1d4ed8]" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <TipBox title="Did you know?" desc="Partners with social proof links are 70% more likely to be hired." />
                    </div>
                </SectionWrapper>
            )}

            <SectionWrapper bg={isEn ? "slate" : "white"}>
                <SectionHeading title={isSi ? "ඔබේ ප්‍රදේශයේ කිසිවෙකු නැතිද?" : isTa ? "உங்கள் பகுதியில் யாரும் இல்லையா?" : "Can't Find Anyone?"} />
                <div className="bg-white border border-[#e2e8f0] p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center shrink-0">
                        <Navigation className="w-10 h-10 text-[#1d4ed8]" />
                    </div>
                    <div>
                        <p className="text-[#334155] font-medium leading-relaxed mb-4">
                            {isSi ? "Browse පිටුවේ \"Notify Me\" බොත්තම ක්ලික් කරන්න. ඔබව දැනුවත් කරමු." : isTa ? "Browse பக்கத்தில் \"Notify Me\" பொத்தானை அழுத்துங்கள். நாங்கள் உங்களுக்கு WhatsApp அனுப்புவோம்." : "Click the \"Notify Me\" button on the Browse page. We will WhatsApp you the moment a matching worker joins."}
                        </p>
                        <Link href="/customer/register" className="text-xs font-bold uppercase tracking-widest text-[#1d4ed8] hover:underline">Join the waitlist →</Link>
                    </div>
                </div>
            </SectionWrapper>

            {isEn && (
                <SectionWrapper bg="white">
                    <SectionHeading title="Safety & Fair Play" />
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            'Verify NIC: Ask to see their card to match photos.',
                            'Record of Agreement: Keep price discussions on WhatsApp.',
                            'Pay on Satisfaction: Pay directly after the job.',
                            'Zero Commission: We don\'t take a cut.'
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-[#f1f5f9] border border-[#e2e8f0] rounded-2xl text-[11px] font-bold text-[#334155] uppercase tracking-widest">
                                {item}
                            </div>
                        ))}
                    </div>
                </SectionWrapper>
            )}
        </>
    )
}

function WorkerContent({ lang }: { lang: string }) {
    const isEn = lang === 'en';
    const isSi = lang === 'si';
    const isTa = lang === 'ta';

    return (
        <>
            <SectionWrapper bg="white">
                <SectionHeading title={isSi ? "ලියාපදිංචි වන්නේ කෙසේද" : isTa ? "பதிவு செய்வது எப்படி" : "How to Register"} />
                <div className="grid md:grid-cols-3 gap-6">
                    <StepCard number="01" title={isSi ? "පෞද්ගලික තොරතුරු" : isTa ? "தனிப்பட்ட தகவல்" : "Personal Info"} desc={isSi ? "නම සහ WhatsApp අංකය." : isTa ? "பெயர் மற்றும் WhatsApp எண்." : "Name and WhatsApp number."} icon={User} />
                    <StepCard number="02" title={isSi ? "ඡායාරූප" : isTa ? "புகைப்படங்கள்" : "Identity Photos"} desc={isSi ? "පැතිකඩ ඡායාරූපය සහ NIC." : isTa ? "சுயவிவர புகைப்படத்தை வழங்கவும்." : "Profile photo + NIC card photos."} icon={Award} />
                    <StepCard number="03" title={isSi ? "වෘත්තීය පැතිකඩ" : isTa ? "சுயவிவரம்" : "Pro Profile"} desc={isSi ? "වැඩවල ඡායාරූප උඩුගත කරන්න." : isTa ? "புகைப்படங்கள் பதிவேற்றவும்." : "Skills, bio, and work photos."} icon={Star} />
                </div>
            </SectionWrapper>

            <SectionWrapper bg="slate">
                <SectionHeading title={isSi ? "සක්රිය කිරීම" : isTa ? "செயல்படுத்தல்" : "The Activation"} />
                <div className="bg-white border border-amber-100 p-10 rounded-[3rem] space-y-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                             <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0f172a] uppercase italic">Critical Step</h3>
                    </div>
                    <p className="text-[#334155] font-medium leading-relaxed">
                        {isSi ? "Admin ව WhatsApp කරන්න. ගිණුම සක්රිය කරනු ඇත." : isTa ? "நிர்வாகியை WhatsApp செய்யுங்கள். செயல்படுத்தவார்." : "Click \"Contact Admin for Activation\" on success. We manually verify and flip the switch to make you LIVE."}
                    </p>
                </div>
            </SectionWrapper>

            {isEn && (
                <SectionWrapper bg="white">
                    <SectionHeading title="Your Partner Portal" />
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-[#f1f5f9] p-10 rounded-3xl border border-[#e2e8f0] space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-[#1d4ed8]">Manage Everything</h4>
                            <ul className="space-y-4">
                                {['Check account status', 'See trust level', 'Live preview profile', 'Message admin'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[#334155] text-xs font-bold uppercase tracking-wider">
                                        <div className="w-2 h-2 bg-[#1d4ed8] rounded-full" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <TipBox title="Pro Tip" desc="Profiles with social media links build 70% more trust." />
                    </div>
                </SectionWrapper>
            )}
        </>
    )
}

function BottomCTA({ lang }: { lang: string }) {
    const translations = {
        en: {
            heading: 'Ready to get started?',
            worker: 'Register as a Worker',
            customer: 'Find a Worker Now',
            small: 'Free to use. No commission. No hidden fees.'
        },
        si: {
            heading: 'ආරම්භ කිරීමට සූදානම්ද?',
            worker: 'වැඩකරුවෙකු ලෙස ලියාපදිංචි වන්න',
            customer: 'දැන් වැඩකරුවෙකු සොයන්න',
            small: 'නොමිලේ. කොමිස් නැත. සැඟවුණු ගාස්තු නැත.'
        },
        ta: {
            heading: 'தொடங்க தயாரா?',
            worker: 'தொழிலாளியாக பதிவு செய்யுங்கள்',
            customer: 'இப்போது தொழிலாளியை கண்டுபிடியுங்கள்',
            small: 'இலவசம். கமிஷன் இல்லை. மறைமுக கட்டணம் இல்லை.'
        }
    };
    const content = translations[(lang as 'en' | 'si' | 'ta')] || translations.en;

    return (
        <section className="py-24 px-6 bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)] opacity-5 pointer-events-none" />
            
            <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                <h2 className="text-3xl md:text-6xl font-bold tracking-tight text-white uppercase">{content.heading}</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register" className="px-10 py-5 bg-white text-[#1d4ed8] rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm hover:bg-[#dbeafe] transition-all">
                        {content.worker}
                    </Link>
                    <Link href="/browse" className="px-10 py-5 bg-white/10 border border-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all">
                        {content.customer}
                    </Link>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bfdbfe]">{content.small}</p>
            </div>
        </section>
    )
}
