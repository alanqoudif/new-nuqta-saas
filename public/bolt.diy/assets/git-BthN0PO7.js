import{a as R,r as l,j as t}from"./components-DOpQnLEK.js";import{u as I,g as $,B as j,C as y,h as v,j as G,k as w,l as T,m as D,n as F,o as x,q as M,r as O,H}from"./Header-DDwFk0S3.js";import"./index-C3f7dkqv.js";const N=["node_modules/**",".git/**",".github/**",".vscode/**","**/*.jpg","**/*.jpeg","**/*.png","dist/**","build/**",".next/**","coverage/**",".cache/**",".vscode/**",".idea/**","**/*.log","**/.DS_Store","**/npm-debug.log*","**/yarn-debug.log*","**/yarn-error.log*","**/*lock.json","**/*lock.yaml"];function _(){const[d]=R(),{ready:s,importChat:m}=I(),{ready:a,gitClone:b}=$(),[u,C]=l.useState(!1),[k,g]=l.useState(!0),S=async o=>{if(!(!a&&!s)&&o){const r=T().add(N);try{const{workdir:n,data:f}=await b(o);if(m){const A=Object.keys(f).filter(e=>!r.ignores(e)),B=new TextDecoder("utf-8"),p=A.map(e=>{const{data:c,encoding:P}=f[e];return{path:e,content:P==="utf8"?c:c instanceof Uint8Array?B.decode(c):""}}).filter(e=>e.content),E=await D(p),h=F(E),i=[{role:"assistant",content:`Cloning the repo ${o} into ${n}
<boltArtifact id="imported-files" title="Git Cloned Files"  type="bundled">
${p.map(e=>`<boltAction type="file" filePath="${e.path}">
${M(e.content)}
</boltAction>`).join(`
`)}
</boltArtifact>`,id:x(),createdAt:new Date}];h&&(i.push({role:"user",id:x(),content:"Setup the codebase and Start the application"}),i.push(h)),await m(`Git Project:${o.split("/").slice(-1)[0]}`,i,{gitUrl:o})}}catch(n){console.error("Error during import:",n),j.error("Failed to import repository"),g(!1),window.location.href="/";return}}};return l.useEffect(()=>{if(!s||!a||u)return;const o=d.get("url");if(!o){window.location.href="/";return}S(o).catch(r=>{console.error("Error importing repo:",r),j.error("Failed to import repository"),g(!1),window.location.href="/"}),C(!0)},[d,s,a,u]),t.jsx(y,{fallback:t.jsx(w,{}),children:()=>t.jsxs(t.Fragment,{children:[t.jsx(v,{}),k&&t.jsx(G,{message:"Please wait while we clone the repository..."})]})})}const K=()=>[{title:"Bolt"},{name:"description",content:"Talk with Bolt, an AI assistant from StackBlitz"}];function Q(){return t.jsxs("div",{className:"flex flex-col h-full w-full bg-bolt-elements-background-depth-1",children:[t.jsx(O,{}),t.jsx(H,{}),t.jsx(y,{fallback:t.jsx(w,{}),children:()=>t.jsx(_,{})})]})}export{Q as default,K as meta};
