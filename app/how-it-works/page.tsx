import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Briefcase, Star, ShieldCheck, CheckCircle2, ChevronLeft, Globe, Music, Share2, Award, Calendar, User, MessageCircle, Search, Info, Zap, Phone, Navigation, ChevronRight } from 'lucide-react'
import RegisterHeader from '../register/components/RegisterHeader'
import RegisterFooter from '../register/components/RegisterFooter'
import LanguageTabs from './LanguageTabs'

export const metadata: Metadata = {
    title: 'How It Works | Grab Me — Sri Lanka Home Services',
    description: 'Learn how to find verified home workers or register as a professional on Grab Me. Available in English, Sinhala and Tamil. Serving all 25 districts in Sri Lanka.',
    openGraph: {
        title: 'How Grab Me Works — Sri Lanka Home Services',
        description: 'Step by step guide for customers and workers. NIC verified professionals. Direct WhatsApp contact. No commission.',
        url: 'https://www.grabme.lk/how-it-works',
        locale: 'en_LK',
    },
}

interface PageProps {
    searchParams: Promise<{ lang?: string; role?: string }>;
}

export default async function HowItWorksPage({ searchParams }: PageProps) {
    const { lang = 'en', role = 'customer' } = await searchParams;

    // Content logic is based on role and lang
    const isWorker = role === 'worker';

    return (
        <div className="min-h-screen font-sans selection:bg-indigo-500/30 overflow-x-hidden" style={{ background: '#090A0F', color: '#FFFFFF' }}>
            <RegisterHeader scrolled={true} />

            <main className="pt-32 pb-24 px-6 relative">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto space-y-16 relative z-10">
                    {/* Hero Section */}
                    <div className="text-center space-y-6">
                        <nav className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-indigo-400">How It Works</span>
                        </nav>
                        
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">
                            {lang === 'en' ? 'How Grab Me Works' : lang === 'si' ? 'Grab Me ක්‍රියා කරන ආකාරය' : 'Grab Me எவ்வாறு செயல்படுகிறது'}
                        </h1>
                        <p className="text-white/40 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
                            {lang === 'en' 
                                ? 'Simple steps to find or offer home services across Sri Lanka' 
                                : lang === 'si' 
                                ? 'ශ්‍රී ලංකාව පුරා නිවාස සේවා සොයා ගැනීමට හෝ ලබා දීමට සරල පියවර' 
                                : 'இலங்கை முழுவதும் வீட்டுச் சேவைகளைக் கண்டறிய அல்லது வழங்க எளிய வழிமுறைகள்'}
                        </p>
                    </div>

                    {/* Interactive Toggles */}
                    <LanguageTabs currentLang={lang} currentRole={role} />

                    {/* Main Content Area */}
                    <div className="space-y-20">
                        {isWorker ? (
                             <WorkerContent lang={lang} />
                        ) : (
                            <CustomerContent lang={lang} />
                        )}
                    </div>

                    {/* Bottom CTA Section */}
                    <BottomCTA lang={lang} />
                </div>
            </main>

            <RegisterFooter />
        </div>
    )
}

function SectionHeading({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-black uppercase tracking-widest text-[#4F46E5]">{title}</h2>
            <div className="h-[1px] flex-1 bg-white/5" />
        </div>
    )
}

function StepCard({ number, title, desc, icon: Icon }: { number: string; title: string; desc: string; icon: any }) {
    return (
        <div className="bg-[#18181B] border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6 group hover:border-white/10 transition-all">
            <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:border-indigo-500/40 transition-colors">
                    <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-4xl font-black text-white/5">{number}</span>
            </div>
            <div className="space-y-3">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">{title}</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function TipBox({ title, desc, variant = 'indigo' }: { title: string; desc: string; variant?: 'indigo' | 'amber' }) {
    const isAmber = variant === 'amber';
    return (
        <div className={`p-8 rounded-[2rem] border ${isAmber ? 'bg-amber-500/5 border-amber-500/20' : 'bg-indigo-500/5 border-indigo-500/20'} space-y-3`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isAmber ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                    <Info className={`w-4 h-4 ${isAmber ? 'text-amber-400' : 'text-indigo-400'}`} />
                </div>
                <h4 className={`text-xs font-black uppercase tracking-widest ${isAmber ? 'text-amber-400' : 'text-indigo-400'}`}>{title}</h4>
            </div>
            <p className="text-white/40 text-xs font-bold leading-relaxed uppercase tracking-wider">{desc}</p>
        </div>
    )
}

function CustomerContent({ lang }: { lang: string }) {
    if (lang === 'si') {
        return (
            <div className="space-y-20">
                <section>
                    <SectionHeading title="වැඩකරුවෙකු සොයා ගන්නේ කෙසේද" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <StepCard number="01" title="නාමාවලිය සොයන්න" desc="ශ්‍රී ලංකාව පුරා සිටින සියලු තහවුරු කළ වෘත්තිකයන් බැලීමට Browse පිටුවට යන්න." icon={Search} />
                        <StepCard number="02" title="සේවාව තෝරන්න" desc="ඔබට අවශ්‍ය සේවාව (විදුලි, නළ, AC අලුත්වැඩියාව ආදිය) සහ ඔබේ දිස්ත්‍රික්කය තෝරන්න." icon={MapPin} />
                        <StepCard number="03" title="විස්තර පරීක්ෂා කරන්න" desc="නිල් පලිහ (NIC තහවුරු කළ) සහ කොළ සලකුණ (Reference පරීක්ෂා කළ) සොයන්න." icon={ShieldCheck} />
                    </div>
                </section>
                <section>
                    <SectionHeading title="WhatsApp හරහා සම්බන්ධ වන්න" />
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6 bg-[#18181B] p-8 rounded-[2.5rem] border border-white/5">
                             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center"><MessageCircle className="w-6 h-6 text-green-400" /></div>
                             <p className="text-white/60 font-medium leading-relaxed">"WhatsApp හරහා සම්බන්ධ වන්න" බොත්තම ක්ලික් කරන්න. WhatsApp ස්වයංක්රීයව විවෘත වේ. පූර්ව-පිරවූ පණිවිඩය යවන්න. වැඩකරු පැමිණීමට පෙර මිල ගැන එකඟ වන්න.</p>
                        </div>
                        <TipBox variant="amber" title="ආරක්ෂිත ඉඟිය" desc="වැඩකරු පැමිණීමට පෙර WhatsApp හරහා මිල තහවුරු කරන්න එවිට ඔබට එය ලිඛිතව පවතිනු ඇත." />
                    </div>
                </section>
                <section>
                    <SectionHeading title="ඔබේ ප්‍රදේශයේ කිසිවෙකු නැතිද?" />
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem]">
                        <p className="text-white/60 font-medium leading-relaxed">Browse පිටුවේ "Notify Me" බොත්තම ක්ලික් කරන්න. ඔබේ නම, දුරකතන අංකය සහ දිස්ත්‍රික්කය ඇතුළු කරන්න. ඔබේ ප්‍රදේශයට ගැළපෙන වැඩකරුවෙකු Grab Me හා සම්බන්ධ වූ වහාම අපි WhatsApp හරහා ඔබව දැනුවත් කරමු.</p>
                    </div>
                </section>
            </div>
        )
    }

    if (lang === 'ta') {
        return (
            <div className="space-y-20">
                <section>
                    <SectionHeading title="தொழிலாளியை எவ்வாறு கண்டுபிடிப்பது" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <StepCard number="01" title="அடைவை உலாவுங்கள்" desc="இலங்கை முழுவதும் உள்ள அனைத்து சரிபார்க்கப்பட்ட நிபுணர்களையும் காண Browse பக்கத்திற்கு செல்லுங்கள்." icon={Search} />
                        <StepCard number="02" title="வடிகட்டுங்கள்" desc="மின்சாரம், குழாய், AC பழுதுபார்ப்பு போன்ற சேவை மற்றும் உங்கள் மாவட்டத்தை தேர்ந்தெடுங்கள்." icon={MapPin} />
                        <StepCard number="03" title="சரிபாருங்கள்" desc="நீல கேடயம் (NIC சரிபார்க்கப்பட்டது) மற்றும் பச்சை சின்னம் (Reference சரிபார்க்கப்பட்டது) தேடுங்கள்." icon={ShieldCheck} />
                    </div>
                </section>
                <section>
                    <SectionHeading title="WhatsApp மூலம் தொடர்பு கொள்ளுங்கள்" />
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6 bg-[#18181B] p-8 rounded-[2.5rem] border border-white/5">
                             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center"><MessageCircle className="w-6 h-6 text-green-400" /></div>
                             <p className="text-white/60 font-medium leading-relaxed">"WhatsApp இல் தொடர்பு கொள்ளுங்கள்" பொத்தானை அழுத்துங்கள். WhatsApp தானாகவே திறக்கும். செய்தியை அனுப்புங்கள். தொழிலாளி வருவதற்கு முன் விலையை ஒப்புக்கொள்ளுங்கள்.</p>
                        </div>
                        <TipBox variant="amber" title="பாதுகாப்பு குறிப்பு" desc="தொழிலாளி வருவதற்கு முன் WhatsApp மூலம் விலையை உறுதிப்படுத்துங்கள்." />
                    </div>
                </section>
                <section>
                    <SectionHeading title="உங்கள் பகுதியில் யாரும் இல்லையா?" />
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem]">
                        <p className="text-white/60 font-medium leading-relaxed">Browse பக்கத்தில் "Notify Me" பொத்தானை அழுத்துங்கள். உங்கள் பெயர், தொலைபேசி எண் மற்றும் மாவட்டத்தை உள்ளிடுங்கள். தொழிலாளி Grab Me இல் சேரும்போது நாங்கள் உங்களுக்கு WhatsApp அனுப்புவோம்.</p>
                    </div>
                </section>
            </div>
        )
    }

    return (
        <div className="space-y-20">
            <section>
                <SectionHeading title="Find a Worker" />
                <div className="grid md:grid-cols-3 gap-6">
                    <StepCard number="01" title="Browse Directory" desc="Go to the Browse page to see all verified professionals across Sri Lanka." icon={Search} />
                    <StepCard number="02" title="Filter by Need" desc="Pick your service (Electrician, Plumber, AC Repair etc.) and your district." icon={MapPin} />
                    <StepCard number="03" title="Check Badges" desc="Look for the blue shield (NIC Verified) and green badge (Reference Checked)." icon={ShieldCheck} />
                </div>
            </section>

            <section>
                <SectionHeading title="Review Before You Hire" />
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#18181B] p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center">
                        <ul className="space-y-4">
                            {['Real photos of past work', 'Years of experience', 'Districts covered', 'Instagram or TikTok (if linked)', 'Exact sub-skills offered'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/60 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <TipBox title="Did you know?" desc="Partners with social proof links are 70% more likely to be hired than profiles without them." />
                </div>
            </section>

            <section>
                <SectionHeading title="Contact on WhatsApp" />
                <div className="grid md:grid-cols-3 gap-6">
                    <StepCard number="01" title="Click WhatsApp" desc="The big button on every profile. Your phone opens WhatsApp automatically." icon={MessageCircle} />
                    <StepCard number="02" title="Send Message" desc="A message is already written for you. Just tap send." icon={Zap} />
                    <StepCard number="03" title="Agree & Pay" desc="Share photos. Agree on price. Pay directly after the job." icon={Star} />
                </div>
                <div className="mt-8">
                    <TipBox variant="amber" title="Safety Tip" desc="Always confirm the price over WhatsApp before the worker visits so you have a written record." />
                </div>
            </section>

            <section>
                <SectionHeading title="Can't Find Anyone?" />
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center shrink-0">
                        <Navigation className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-white/60 font-medium leading-relaxed mb-4">Click the "Notify Me" button on the Browse page. Enter your details (or use GPS). We will WhatsApp you the moment a matching worker joins.</p>
                        <Link href="/customer/register" className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">Join the waitlist →</Link>
                    </div>
                </div>
            </section>

            <section>
                <SectionHeading title="Safety & Fair Play" />
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        'Verify NIC: Ask to see their card to match their verified profile photo.',
                        'Record of Agreement: Keep price discussions on WhatsApp for safety.',
                        'Pay on Satisfaction: Pay the worker directly once you are happy with the job.',
                        'Zero Commission: We don\'t take a cut. What you agree is what you pay.'
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                            {item}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

function WorkerContent({ lang }: { lang: string }) {
    if (lang === 'si') {
        return (
            <div className="space-y-20">
                <section>
                    <SectionHeading title="ලියාපදිංචි වන්නේ කෙසේද (පියවර 5)" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <StepCard number="01" title="පෞද්ගලික තොරතුරු" desc="නම, ඊමේල් සහ මුරපදය. WhatsApp අංකය නිවැරදිව ලබාදෙන්න." icon={User} />
                        <StepCard number="02" title="ඡායාරූප (පෞද්ගලික)" desc="පැතිකඩ ඡායාරූපය, NIC කාඩ්පත සහ selfie. මේවා admin පමණක් දකී." icon={Award} />
                        <StepCard number="03" title="වෘත්තීය පැතිකඩ" desc="ඔබේ කර්මාන්තය සහ දක්ෂතා තෝරන්න. වැඩවල ඡායාරූප 5ක් දක්වා උඩුගත කරන්න." icon={Star} />
                        <StepCard number="04" title="වැඩ කරන ස්ථාන" desc="වැඩ කිරීමට කැමති දිස්ත්‍රික්ක සහ නගර තෝරන්න." icon={MapPin} />
                        <StepCard number="05" title="නිරීක්ෂණ" desc="කලින් සේවාදායකයෙකුගේ නිර්දේශයක් ලබාදෙන්න." icon={ShieldCheck} />
                    </div>
                </section>
                <section>
                    <SectionHeading title="ඉදිරිපත් කිරීමෙන් පසු — සක්රිය කිරීම" />
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] space-y-4">
                        <p className="text-white/60 font-medium leading-relaxed">ඔබේ ගිණුම "Pending" — ගනුදෙනුකරුවන්ට තවම නොපෙනේ. සාර්ථකත්ව පිටුවේ "Admin ව WhatsApp කරන්න" බොත්තම ක්ලික් කරන්න. Admin ඔබේ තොරතුරු තහවුරු කළ පසු ඔබේ ගිණුම සක්රිය කරනු ඇත.</p>
                    </div>
                </section>
            </div>
        )
    }

    if (lang === 'ta') {
        return (
            <div className="space-y-20">
                <section>
                    <SectionHeading title="பதிவு செய்வது எப்படி (5 படிகள்)" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <StepCard number="01" title="தனிப்பட்ட தகவல்" desc="பெயர், மின்னஞ்சல் மற்றும் கடவுச்சொல். WhatsApp எண்ணை சரியாக வழங்கவும்." icon={User} />
                        <StepCard number="02" title="புகைப்படங்கள்" desc="சுயவிவர புகைப்படத்தை, NIC அட்டையின் புகைப்படங்களை வழங்கவும்." icon={Award} />
                        <StepCard number="03" title="சுயவிவரம்" desc="உங்கள் தொழிலைத் தேர்ந்தெடுத்து 5 புகைப்படங்கள் வரை பதிவேற்றவும்." icon={Star} />
                        <StepCard number="04" title="வேலை செய்யும் இடங்கள்" desc="நீங்கள் வேலை செய்யத் தயாராக உள்ள மாவட்டங்களைத் தேர்ந்தெடுக்கவும்." icon={MapPin} />
                        <StepCard number="05" title="ஒப்பந்தம்" desc="பரிந்துரை மற்றும் விதிமுறைகளை ஒப்புக்கொள்ளுங்கள்." icon={ShieldCheck} />
                    </div>
                </section>
                <section>
                    <SectionHeading title="சமர்ப்பித்த பிறகு — செயல்படுத்தல்" />
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem]">
                        <p className="text-white/60 font-medium leading-relaxed">வெற்றி பக்கத்தில் "நிர்வாகியை WhatsApp செய்யுங்கள்" பொத்தானை அழுத்துங்கள். நிர்வாகி உங்கள் NIC ஐ சரிபார்த்த பிறகு செயல்படுத்தவார்.</p>
                    </div>
                </section>
            </div>
        )
    }

    return (
        <div className="space-y-20">
            <section>
                <SectionHeading title="How to Register" />
                <div className="grid md:grid-cols-3 gap-6">
                    <StepCard number="01" title="Personal Info" desc="Name, email, and correct WhatsApp number for client contact." icon={User} />
                    <StepCard number="02" title="Identity Photos" desc="Clear profile photo + NIC card photos (Private — Admin Only)." icon={Award} />
                    <StepCard number="03" title="Pro Profile" desc="Main trade, sub-skills, bio, and up to 5 past work photos." icon={Star} />
                    <StepCard number="04" title="Service Area" desc="Home district and all areas you travel to for jobs." icon={MapPin} />
                    <StepCard number="05" title="Referral" desc="Name/Phone of a previous client or employer to vouch for you." icon={Phone} />
                </div>
            </section>

            <section>
                <SectionHeading title="The Activation" />
                <div className="bg-amber-500/5 border border-amber-500/10 p-10 rounded-[3rem] space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                             <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic">Critical Step</h3>
                    </div>
                    <p className="text-white/60 font-medium leading-relaxed">After submitting, your account is <span className="text-white">"Pending"</span>. Click <span className="text-white">"Contact Admin for Activation"</span> on the success screen. Founder will manually verify your data and flip the switch to make you LIVE.</p>
                </div>
            </section>

            <section>
                <SectionHeading title="Your Partner Portal" />
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#18181B] p-10 rounded-[2.5rem] border border-white/5 space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-[#4F46E5]">Manage Everything</h4>
                        <ul className="space-y-4">
                            {['Check account status (Active/Suspended)', 'See trust level (Starter/Elite)', 'Live preview of your public profile', 'Message admin for data updates'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/40 text-xs font-bold uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <TipBox title="Pro Tip" desc="Profiles with social media links like TikTok or Instagram uploaded build 70% more trust with homeowners." />
                </div>
            </section>
        </div>
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
        <section className="pt-12 border-t border-white/5 text-center space-y-10">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">{content.heading}</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="px-10 py-5 bg-[#4F46E5] text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all">
                    {content.worker}
                </Link>
                <Link href="/browse" className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/10 active:scale-95 transition-all">
                    {content.customer}
                </Link>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{content.small}</p>
        </section>
    )
}
