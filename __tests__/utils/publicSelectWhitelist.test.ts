import fs from 'fs';
import path from 'path';

describe('Public Select Whitelist Validation', () => {
  const browseFile = path.resolve(__dirname, '../../app/browse/page.tsx');
  const workerFile = path.resolve(__dirname, '../../app/worker/[id]/page.tsx');

  const sensitiveFields = [
    'phone', 
    'nic_number', 
    'password', 
    'email',
    'nic_front_url', 
    'nic_back_url', 
    'selfie_url', 
    'reference_phone', 
    'emergency_contact', 
    'address'
  ];

  it('browse/page.tsx NEVER contains sensitive fields in public select query', () => {
    const code = fs.readFileSync(browseFile, 'utf-8');
    const selectQueryMatch = code.match(/\.select\(`([\s\S]*?)`\)/);
    expect(selectQueryMatch).toBeTruthy();
    
    if (selectQueryMatch) {
      const whitelist = selectQueryMatch[1];
      sensitiveFields.forEach(field => {
        expect(whitelist).not.toContain(field);
      });
    }
  });

  it('worker/[id]/page.tsx NEVER contains sensitive fields in public select query', () => {
    const code = fs.readFileSync(workerFile, 'utf-8');
    const selectQueryMatch = code.match(/\.select\(`([\s\S]*?)`\)/);
    expect(selectQueryMatch).toBeTruthy();
    
    if (selectQueryMatch) {
      const whitelist = selectQueryMatch[1];
      sensitiveFields.forEach(field => {
        expect(whitelist).not.toContain(field);
      });
    }
  });
});
