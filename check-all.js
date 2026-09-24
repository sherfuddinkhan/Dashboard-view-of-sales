const fs=require('fs');
const app=fs.readFileSync('src/App.js','utf8');
const imports=[...app.matchAll(/from\s+["']\.\/([^"']+)["']/g)].map(m=>m[1]);
console.log('Checking', imports.length, 'imports...\n');
let missing=[];
imports.forEach(p=>{
  const base='src/'+p;
  const tries=[base, base+'.js', base+'.jsx', base+'.js', base+'.jsx', base+'/index.js', base+'/index.jsx'];
  const found=tries.some(t=>fs.existsSync(t));
  if(!found){ missing.push(p); console.log('MISSING:', p); }
  else { console.log('OK:', p); }
});
if(missing.length===0) console.log('\nALL FOUND - should compile!');
else console.log('\nTotal missing:', missing.length, '\n', missing.join('\n'));
