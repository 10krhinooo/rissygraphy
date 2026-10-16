const ts=require(process.env.TSPATH||'typescript');const fs=require('fs');const path=require('path');
const dir=process.argv[2]||'src';
const order=['core.js','data.js','content.js','Resume.jsx','Camera3D.jsx','app-head.jsx','Admin.jsx','app.jsx'];
let js='';
for(const f of order){const r=ts.transpileModule(fs.readFileSync(path.join(dir,f),'utf8'),{reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2019,module:ts.ModuleKind.ESNext}});
 if(r.diagnostics.length){console.log(f,r.diagnostics.map(d=>d.messageText));process.exit(1)}
 js+='\n/* ===== '+f+' ===== */\n'+r.outputText.replace(/^"use strict";\s*/,'').replace(/export \{\};\s*/g,'');}
const html=fs.readFileSync(path.join(dir,'shell.html'),'utf8').replace('__META_JSON__',fs.readFileSync(path.join(dir,'meta.json'),'utf8')).replace('__APP_JS__',()=>js);
const out=process.argv[3]||'index.html';fs.writeFileSync(out,html);console.log('built',html.length);
// the error pages reuse the site's stylesheet so they can never drift apart from it
const style=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const tpl=fs.readFileSync(path.join(dir,'error.html'),'utf8');
const ERROR_PAGES={
  404:{TITLE:'Page not found',EYEBROW:'Error 404 · Page not found',H1A:'Out of',H1B:'frame',CODE:'404',LCD:'No image',
    LEDE:'This page is not on the card. The link may have a typo, or the page has moved somewhere else on the site.',
    CTA:'<a class="btn solid" href="/">Back to home <span aria-hidden="true">→</span></a>\n        <a class="btn" href="/#gallery">Open the gallery</a>',
    // /gallery, /cv, /about and /contact are pages inside the site, so send them there
    HEAD:"<script>(function () { var seg = location.pathname.replace(/\\/+$/, '').split('/').pop().toLowerCase(); if (['gallery', 'cv', 'about', 'contact'].indexOf(seg) > -1) location.replace('/#' + seg); })();</script>"},
  500:{TITLE:'Something went wrong',EYEBROW:'Error 500 · Something went wrong',H1A:'Shutter',H1B:'jammed',CODE:'500',LCD:'Err',
    LEDE:'The site hit a problem on our side. Reloading usually clears it, the same way switching a camera off and on does.',
    CTA:'<button class="btn solid" onclick="location.reload()">Reload the page <span aria-hidden="true">↻</span></button>\n        <a class="btn" href="/">Back to home</a>',
    HEAD:''},
};
for(const [code,v] of Object.entries(ERROR_PAGES)){
  const page=tpl.replace('__STYLE__',()=>style).replace(/__([A-Z0-9]+)__/g,(m,k)=>(k in v?v[k]:m));
  fs.writeFileSync(path.join(path.dirname(out),code+'.html'),page);console.log('built',code,page.length);
}
