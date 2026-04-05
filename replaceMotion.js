const fs = require('fs');

const files = [
  "c:/Projects/grabme-pwa/app/worker/[id]/error.tsx",
  "c:/Projects/grabme-pwa/app/worker/[id]/components/LeadCaptureModal.tsx",
  "c:/Projects/grabme-pwa/app/register/page.tsx",
  "c:/Projects/grabme-pwa/app/register/components/steps/StepReference.tsx",
  "c:/Projects/grabme-pwa/app/register/components/steps/StepPhotos.tsx",
  "c:/Projects/grabme-pwa/app/register/components/steps/StepLocation.tsx",
  "c:/Projects/grabme-pwa/app/register/components/steps/StepIdentity.tsx",
  "c:/Projects/grabme-pwa/app/register/components/steps/StepExperience.tsx",
  "c:/Projects/grabme-pwa/app/register/components/steps/StepConfirmation.tsx",
  "c:/Projects/grabme-pwa/app/page.tsx",
  "c:/Projects/grabme-pwa/app/not-found.tsx",
  "c:/Projects/grabme-pwa/app/login/page.tsx",
  "c:/Projects/grabme-pwa/app/forgot-password/page.tsx",
  "c:/Projects/grabme-pwa/app/dashboard/profile/page.tsx",
  "c:/Projects/grabme-pwa/app/customer/register/page.tsx",
  "c:/Projects/grabme-pwa/app/dashboard/page.tsx",
  "c:/Projects/grabme-pwa/app/admin/page.tsx",
  "c:/Projects/grabme-pwa/app/admin/login/page.tsx",
  "c:/Projects/grabme-pwa/app/browse/page.tsx",
];

for (const file of files) {
  if (!fs.existsSync(file)) {
      console.log('Skipping ' + file);
      continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Replace component tags
  content = content.replace(/<motion\./g, '<m.');
  content = content.replace(/<\/motion\./g, '</m.');

  // Replace import statement
  content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]framer-motion['"];?/g, (match, p1) => {
    const parts = p1.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const newParts = parts.map(p => p === 'motion' ? 'm' : p);
    
    // Ensure semi-colon or not matches original, but for simplicity we can just use the match end
    // Actually match covers the full import statement. Let's match the exact original end.
    const isSemi = match.endsWith(';');
    return `import { ${newParts.join(', ')} } from 'framer-motion'` + (isSemi ? ';' : '');
  });

  fs.writeFileSync(file, content, 'utf8');
}

console.log("Done");
