import React from 'react';
import { m } from 'framer-motion';
import { Upload, RefreshCw, Briefcase, Plus, Trash2, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { addServiceAction, addSkillAction, addKeywordAction } from '../../actions/taxonomyActions';

export const TaxonomyTab = ({
    taxonomy,
    fetchTaxonomy,
    taxLoading,
    setIsBulkImportOpen,
    newServiceName,
    setNewServiceName,
    selectedServiceId,
    setSelectedServiceId,
    setTaxDeleting,
    newSkillName,
    setNewSkillName,
    newKeyword,
    setNewKeyword,
}: any) => {
    return (
        <m.div key="taxonomy" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2">Service Taxonomy</h2>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Manage services, skills, and smart search keywords dynamically.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsBulkImportOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                    >
                        <Upload className="w-4 h-4" />
                        Import JSON
                    </button>
                    <button
                        onClick={fetchTaxonomy}
                        disabled={taxLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-400 transition-all disabled:opacity-30"
                    >
                        <RefreshCw className={`w-4 h-4 ${taxLoading ? 'animate-spin' : ''}`} />
                        {taxonomy ? 'Refresh' : 'Load Taxonomy'}
                    </button>
                </div>
            </div>

            {!taxonomy ? (
                <div className="bg-[#18181B] border border-white/5 rounded-[2.5rem] p-32 text-center">
                    <Briefcase className="w-12 h-12 text-white/5 mx-auto mb-4" />
                    <p className="text-white/10 uppercase tracking-[0.2em] font-black">Click "Load Taxonomy" to begin</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {/* Add New Service */}
                    <div className="bg-[#18181B] border border-indigo-500/20 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
                        <input
                            placeholder="Add new service (e.g. Solar Technician)..."
                            value={newServiceName}
                            onChange={e => setNewServiceName(e.target.value)}
                            onKeyPress={async e => {
                                if (e.key === 'Enter' && newServiceName.trim()) {
                                    const res = await addServiceAction(newServiceName.trim());
                                    if (res && res.success) {
                                        setNewServiceName('');
                                        fetchTaxonomy();
                                        toast.success('Service synced/added!');
                                    } else {
                                        toast.error(res?.error || 'Failed to add service');
                                    }
                                }
                            }}
                            className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                        />
                        <button
                            onClick={async () => {
                                if (!newServiceName.trim()) return;
                                const res = await addServiceAction(newServiceName.trim());
                                if (res && res.success) {
                                    setNewServiceName('');
                                    fetchTaxonomy();
                                    toast.success('Service synced/added!');
                                } else {
                                    toast.error(res?.error || 'Failed to add service');
                                }
                            }}
                            className="px-5 py-3 w-full md:w-auto justify-center bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-400 transition-all flex items-center gap-2 shrink-0"
                        >
                            <Plus className="w-4 h-4" /> Add Service
                        </button>
                    </div>

                    {/* Services List */}
                    {taxonomy.services.map((svc: any) => {
                        const svcSkills = taxonomy.skills.filter((sk: any) => sk.service_id === svc.id);
                        const svcKeywords = taxonomy.keywords.filter((kw: any) => kw.service_id === svc.id);
                        const isExpanded = selectedServiceId === svc.id;

                        return (
                            <div key={svc.id} className="bg-[#18181B] border border-white/5 rounded-[2rem] overflow-hidden">
                                {/* Service Header */}
                                <div
                                    onClick={() => setSelectedServiceId(isExpanded ? null : svc.id)}
                                    className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-all cursor-pointer gap-2"
                                >
                                    <div className="flex flex-row items-center gap-3 md:gap-4 min-w-0">
                                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                                            <Briefcase className="w-5 h-5 text-indigo-400 shrink-0" />
                                        </div>
                                        <div className="text-left min-w-0 pr-2">
                                            <p className="text-white font-black text-sm truncate">{svc.name}</p>
                                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest truncate">
                                                {svcSkills.length} skills · {svcKeywords.length} keywords
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                        <button
                                            onClick={async e => {
                                                e.stopPropagation();
                                                setTaxDeleting({ id: svc.id, name: svc.name, type: 'Service' });
                                            }}
                                            className="p-1.5 md:p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all hover:scale-110 active:scale-95"
                                            title="Delete service"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </button>
                                        <ChevronRight className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>
                                </div>

                                {/* Expanded Skills + Keywords */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 p-6 space-y-6">
                                        {/* Skills Section */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {svcSkills.map((sk: any) => (
                                                    <div key={sk.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                                                        <span className="text-xs text-white/70 font-bold">{sk.name}</span>
                                                        <button
                                                            onClick={() => setTaxDeleting({ id: sk.id, name: sk.name, type: 'Skill' })}
                                                            className="text-red-400/60 hover:text-red-400 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Add skill (e.g. Drone Repair)..."
                                                    value={selectedServiceId === svc.id ? newSkillName : ''}
                                                    onChange={e => setNewSkillName(e.target.value)}
                                                    onKeyPress={async e => {
                                                        if (e.key === 'Enter' && newSkillName.trim()) {
                                                            const res = await addSkillAction(svc.id, newSkillName.trim());
                                                            if (res.success) { setNewSkillName(''); fetchTaxonomy(); toast.success('Skill added!'); }
                                                            else toast.error(res.error);
                                                        }
                                                    }}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        if (!newSkillName.trim()) return;
                                                        const res = await addSkillAction(svc.id, newSkillName.trim());
                                                        if (res.success) { setNewSkillName(''); fetchTaxonomy(); toast.success('Skill added!'); }
                                                        else toast.error(res.error);
                                                    }}
                                                    className="px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase rounded-xl hover:bg-white/10 transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Keywords Section */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Smart Search Keywords</p>
                                            <p className="text-[9px] text-white/20 font-bold">Users who type these words will find this service — e.g. add "bike", "broken", "engine" for Vehicle Mechanic</p>
                                            <div className="flex flex-wrap gap-2">
                                                {svcKeywords.map((kw: any) => (
                                                    <div key={kw.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/5 border border-green-500/20 rounded-lg">
                                                        <span className="text-xs text-green-400 font-bold">{kw.keyword}</span>
                                                        <button
                                                            onClick={() => setTaxDeleting({ id: kw.id, name: kw.keyword, type: 'Keyword' })}
                                                            className="text-red-400/60 hover:text-red-400 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Add keyword (e.g. bike, broken, engine)..."
                                                    value={selectedServiceId === svc.id ? newKeyword : ''}
                                                    onChange={e => setNewKeyword(e.target.value)}
                                                    onKeyPress={async e => {
                                                        if (e.key === 'Enter' && newKeyword.trim()) {
                                                            const res = await addKeywordAction(svc.id, newKeyword.trim());
                                                            if (res.success) { setNewKeyword(''); fetchTaxonomy(); toast.success('Keyword added!'); }
                                                            else toast.error(res.error);
                                                        }
                                                    }}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green-500 transition-all"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        if (!newKeyword.trim()) return;
                                                        const res = await addKeywordAction(svc.id, newKeyword.trim());
                                                        if (res.success) { setNewKeyword(''); fetchTaxonomy(); toast.success('Keyword added!'); }
                                                        else toast.error(res.error);
                                                    }}
                                                    className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-xl hover:bg-green-500/20 transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </m.div>
    );
};
