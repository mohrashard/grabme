import sys

with open('app/admin/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<AnimatePresence mode="wait">' in line:
        start_idx = i
    if '</AnimatePresence>' in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_content = """                    <AnimatePresence mode="wait">
                        {tab === 'pipeline' && (
                            <PipelineTab
                                loading={loading} pipeline={pipeline} checklists={checklists} setChecklists={setChecklists}
                                imageErrors={imageErrors} setImageErrors={setImageErrors} signedUrls={signedUrls}
                                openLightbox={openLightbox} updateStatus={updateStatus} actionLoading={actionLoading}
                            />
                        )}
                        {tab === 'directory' && (
                            <DirectoryTab
                                loading={loading} directory={directory} checklists={checklists} setChecklists={setChecklists}
                                imageErrors={imageErrors} signedUrls={signedUrls} openLightbox={openLightbox}
                                updateStatus={updateStatus} actionLoading={actionLoading} setEditingWorker={setEditingWorker}
                                setDeletingWorker={setDeletingWorker} toggleFeatured={toggleFeatured} setTab={setTab}
                            />
                        )}
                        {tab === 'analytics' && (
                            <AnalyticsTab stats={stats} topDistricts={topDistricts} topTrades={topTrades} />
                        )}
                        {tab === 'audit' && (
                            <TrustAuditTab
                                workers={workers} selectedWorker={selectedWorker} setSelectedWorker={setSelectedWorker}
                                imageErrors={imageErrors} setImageErrors={setImageErrors} signedUrls={signedUrls}
                                auditOutcome={auditOutcome} setAuditOutcome={setAuditOutcome} auditNote={auditNote}
                                setAuditNote={setAuditNote} submitAuditNote={submitAuditNote} actionLoading={actionLoading}
                            />
                        )}
                        {tab === 'leads' && (
                            <CustomerLeadsTab
                                leadsSubTab={leadsSubTab} setLeadsSubTab={setLeadsSubTab} filteredLeads={filteredLeads}
                                filteredClicks={filteredClicks} confirmingDeleteId={confirmingDeleteId} setConfirmingDeleteId={setConfirmingDeleteId}
                                deleteCustomer={deleteCustomer} deleteClick={deleteClick}
                            />
                        )}
                        {tab === 'taxonomy' && (
                            <TaxonomyTab
                                taxonomy={taxonomy} fetchTaxonomy={fetchTaxonomy} taxLoading={taxLoading}
                                setIsBulkImportOpen={setIsBulkImportOpen} newServiceName={newServiceName} setNewServiceName={setNewServiceName}
                                selectedServiceId={selectedServiceId} setSelectedServiceId={setSelectedServiceId} setTaxDeleting={setTaxDeleting}
                                newSkillName={newSkillName} setNewSkillName={setNewSkillName} newKeyword={newKeyword} setNewKeyword={setNewKeyword}
                            />
                        )}
                    </AnimatePresence>
"""
    lines[start_idx:end_idx+1] = [new_content]
    
    with open('app/admin/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully replaced tabs")
else:
    print("Could not find start or end tags")
