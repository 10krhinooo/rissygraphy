const ts=require(process.env.TSPATH||'typescript');const fs=require('fs');const path=require('path');
const dir=process.argv[2]||'src';
const order=['core.js','data.js','content.js','Resume.jsx','Camera3D.jsx','app-head.jsx','Admin.jsx','app.jsx'];
let js='';
for(const f of order){const r=ts.transpileModule(fs.readFileSync(path.join(dir,f),'utf8'),{reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2019,module:ts.ModuleKind.ESNext}});
 if(r.diagnostics.length){console.log(f,r.diagnostics.map(d=>d.messageText));process.exit(1)}
 js+='\n/* ===== '+f+' ===== */\n'+r.outputText.replace(/^"use strict";\s*/,'').replace(/export \{\};\s*/g,'');}
const html=fs.readFileSync(path.join(dir,'shell.html'),'utf8').replace('__META_JSON__',fs.readFileSync(path.join(dir,'meta.json'),'utf8')).replace('__APP_JS__',()=>js);
fs.writeFileSync(process.argv[3]||'index.html',html);console.log('built',html.length);
