import React,{useState} from "react";

const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";

async function pdfToImage(file){
  const arrayBuffer = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsArrayBuffer(file);});
  if(!window.pdfjsLib){
    await new Promise(res=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;document.head.appendChild(s);});
    window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
  const pdf = await window.pdfjsLib.getDocument({data:arrayBuffer}).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({scale:1.5});
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const canvasCtx = canvas.getContext("2d");
  await page.render({canvasContext:canvasCtx,viewport}).promise;
  return canvas.toDataURL("image/png");
}

export default function PartDashboardMobile({ctx,tab,setTab}){
const s=ctx.sess;
const leads=ctx.myLeadsPart||[];
const [selLead,setSelLead]=useState(null);
const [prixRefuse,setPrixRefuse]=useState(false);
const [showDevisCheck,setShowDevisCheck]=useState(false);
const [devisResult,setDevisResult]=useState(null);
const [devisLoading,setDevisLoading]=useState(false);
async function handleDevisFile(file){
  setDevisLoading(true);setDevisResult(null);
  try{
    let imageData=null;
    if(file.type.startsWith("image/")){
      imageData=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});
    }else if(file.type==="application/pdf"){
      imageData=await pdfToImage(file);
    }
    if(!imageData){setDevisResult({verdict:"non_analyse",raison:"Format non supporte, utilisez une image ou un PDF"});setDevisLoading(false);return;}
    const r=await fetch("https://www.click-fix.fr/api/check-devis",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:imageData})});
    const d=await r.json();
    setDevisResult(d);
  }catch(e){setDevisResult({verdict:"a_verifier",raison:"Erreur lors de l analyse"});}
  setDevisLoading(false);
}

const confirmed=leads.filter(l=>l.statut==="confirme"||l.statut==="confirmed"||l.statut==="confirmé");
const aValider=leads.filter(l=>l.paiement_statut==="en_attente_validation");
const ini=((s?.prenom||"")[0]||"")+(((s?.nom||"")[0])||"");
const now=new Date();
const days=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const months=["jan","fev","mars","avr","mai","juin","juil","aout","sep","oct","nov","dec"];
const dateStr=days[now.getDay()]+" "+now.getDate()+" "+months[now.getMonth()];
const TABS=[{id:"home",ico:"🏠",label:"Accueil"},{id:"demandes",ico:"📋",label:"Demandes"},{id:"profil",ico:"👤",label:"Profil"}];
const card={background:"#fff",borderRadius:16,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:"1px solid #EEEEF2"};

function statusColor(st){if(st==="confirme"||st==="confirmed"||st==="confirmé")return"#22C55E";if(st==="dispatche")return"#38bdf8";return"#FBC005";}

function badge(l){
  const ps=l.paiement_statut,as=l.artisan_statut,st=l.statut;
  if(ps==="paye")return{txt:"Payé",bg:"#E8FAF0",c:"#27AE60"};
  if(ps==="en_attente_validation")return{txt:"A valider",bg:"#FFF0E8",c:"#F26522"};
  if(ps==="en_litige")return{txt:"Litige",bg:"#FEE2E2",c:"#EF4444"};
  if(as==="en_cours")return{txt:"En cours",bg:"#EEF2FF",c:"#6366F1"};
  if(as==="en_route")return{txt:"En route",bg:"#EFF6FF",c:"#3B82F6"};
  if(st==="confirme"||st==="confirmed"||st==="confirmé")return{txt:"Confirmé",bg:"#E8FAF0",c:"#27AE60"};
  if(st==="dispatche")return{txt:"Artisan trouvé",bg:"#EFF6FF",c:"#3B82F6"};
  return{txt:"En attente",bg:"#FFF8E1",c:"#F59E0B"};
}

async function validerEtPayer(l){
  await fetch(SB+"/rest/v1/leads?id=eq."+l.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK},body:JSON.stringify({paiement_statut:"paye"})});
  fetch("https://www.click-fix.fr/api/capture-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({payment_intent_id:l.payment_intent_id,amount_final:l.prix_final,assigned_to:l.assigned_to})}).then(r=>r.json()).then(d=>ctx.notify(d.success?"Paiement de "+l.prix_final+"EUR confirme !":"Erreur paiement","err"));
}

async function refuserPrix(l){
  const nbRefus=(l.nb_refus||0)+1;
  const newSt=nbRefus>=2?"en_litige":"pre_autorise";
  await fetch(SB+"/rest/v1/leads?id=eq."+l.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK},body:JSON.stringify({paiement_statut:newSt,nb_refus:nbRefus})});
  ctx.notify(nbRefus>=2?"Litige ouvert - Click&fix va vous contacter":"Prix refuse - artisan peut modifier");
}

async function terminerIntervention(l){
  await fetch(SB+"/rest/v1/leads?id=eq."+l.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK},body:JSON.stringify({artisan_statut:"termine"})});
  ctx.notify("Intervention marquee comme terminee");
}

function voirFacture(l){
  const showInvoice=()=>{
    const doc=new window.jspdf.jsPDF();
    const prix=parseFloat(l.prix_final)||0;
    const ville=(l.ville||l.adresse||"France");
    const adresseClient=(l.adresse&&l.adresse!=="Géolocalisation"?l.adresse+", ":"")+ville;
    doc.setFillColor(29,29,31);doc.rect(0,0,210,28,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(16);doc.setTextColor(255,255,255);doc.text("Click&fix",20,16);
    doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(180,180,180);doc.text("Services a domicile",20,23);
    doc.setFont("helvetica","bold");doc.setFontSize(14);doc.setTextColor(255,255,255);doc.text("FACTURE",190,16,{align:"right"});
    doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(180,180,180);doc.text("N° CF-"+new Date().getFullYear()+"-"+String(l.id).padStart(4,"0"),190,23,{align:"right"});
    doc.setFontSize(9);doc.setTextColor(100,100,100);doc.text("Date: "+new Date(l.created_at).toLocaleDateString("fr-FR"),20,40);
    doc.text("Lieu d intervention: "+ville,20,47);
    doc.setDrawColor(230,230,230);doc.line(20,53,190,53);
    doc.setFillColor(248,248,250);doc.roundedRect(20,57,82,45,2,2,"F");doc.roundedRect(108,57,82,45,2,2,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(120,120,120);doc.text("CLIENT",25,64);doc.text("ARTISAN",113,64);
    doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(20,20,20);doc.text(l.client_nom||"Client",25,72);doc.text(l.artisan_nom||"Artisan",113,72);
    doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(100,100,100);
    if(l.client_email)doc.text(l.client_email,25,79);
    doc.text("Partenaire Click&fix",113,79);
    if(l.client_tel)doc.text(l.client_tel,25,86);
    doc.text("Adresse: "+adresseClient,25,93);
    doc.text("SIRET: sur demande",113,86);
    doc.setDrawColor(230,230,230);doc.line(20,108,190,108);
    doc.setFillColor(29,29,31);doc.rect(20,112,170,9,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(255,255,255);doc.text("DESCRIPTION",25,118);doc.text("QTE",138,118);doc.text("MONTANT",185,118,{align:"right"});
    doc.setFillColor(252,252,252);doc.rect(20,121,170,20,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(20,20,20);
    const trav=l.travaux||"Intervention";doc.text(trav.charAt(0).toUpperCase()+trav.slice(1),25,130);
    doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(120,120,120);
    const cleanDetails=((l.details||"").replace(/[|] Diagnostic IA:.*/,"").trim())||(l.analyse_ia&&l.analyse_ia.diagnostic?l.analyse_ia.diagnostic:"");
    if(cleanDetails){const det=doc.splitTextToSize(cleanDetails,95);doc.text(det,25,136);}
    doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(20,20,20);doc.text("1",140,130);doc.text(prix.toFixed(2)+" EUR",185,130,{align:"right"});
    doc.setDrawColor(230,230,230);doc.line(20,144,190,144);
    doc.setFontSize(9);doc.setTextColor(80,80,80);doc.text("Sous-total HT:",130,152);doc.text(prix.toFixed(2)+" EUR",185,152,{align:"right"});
    doc.setFont("helvetica","italic");doc.setFontSize(8);doc.setTextColor(140,140,140);doc.text("TVA non applicable - Art. 293 B du CGI",25,160);doc.text("0.00 EUR",185,160,{align:"right"});
    doc.setDrawColor(200,200,200);doc.line(130,164,190,164);
    doc.setFillColor(29,29,31);doc.roundedRect(120,167,70,14,2,2,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(255,255,255);doc.text("Total TTC: "+prix.toFixed(2)+" EUR",155,176,{align:"center"});
    doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(150,150,150);doc.text("Paiement securise via Stripe",20,192);
    doc.setDrawColor(200,200,200);doc.line(20,268,190,268);
    doc.setFontSize(7.5);doc.text("Click&fix — contact@click-fix.fr — www.click-fix.fr",105,273,{align:"center"});
    doc.text("Plateforme de mise en relation entre particuliers et artisans",105,279,{align:"center"});
    const url=doc.output("bloburl");
    const overlay=document.createElement("div");
    overlay.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;";
    const btn=document.createElement("button");btn.textContent="✕ Fermer";
    btn.style.cssText="margin-bottom:12px;padding:8px 20px;background:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;";
    btn.onclick=()=>document.body.removeChild(overlay);
    const iframe=document.createElement("iframe");iframe.src=url;
    iframe.style.cssText="width:92%;max-width:600px;height:75vh;border:none;border-radius:12px;";
    overlay.appendChild(btn);overlay.appendChild(iframe);document.body.appendChild(overlay);
  };
  if(window.jspdf){showInvoice();}else{
    const sc=document.createElement("script");sc.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";sc.onload=showInvoice;document.head.appendChild(sc);
  }
}

function LeadCard({l,onClick}){
  const b=badge(l);
  const init=(l.travaux||"?")[0].toUpperCase();
  return(<div onClick={onClick} style={{...card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:8}}>
    <div style={{width:42,height:42,borderRadius:"50%",background:"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#38bdf8",flexShrink:0}}>{init}</div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:15,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l.travaux||"Demande"}</div>
      <div style={{fontSize:12,color:"#9898A8",marginTop:2}}>{l.precision||l.ville||""}</div>
    </div>
    <span style={{padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:b.bg,color:b.c,flexShrink:0}}>{b.txt}</span>
  </div>);
}

function LeadDetail({l}){
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{...card}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#9898A8",marginBottom:10}}>Ma demande</div>
      <div style={{fontSize:14,fontWeight:700}}>{l.travaux||"Demande"}{l.precision?" - "+l.precision:""}</div>
      {l.details&&<div style={{fontSize:13,color:"#6B6B80",marginTop:6}}>{((l.details||"").replace(/[|] Diagnostic IA:.*/,"").trim())||(l.analyse_ia&&l.analyse_ia.diagnostic?l.analyse_ia.diagnostic:"")}</div>}
      {l.surface&&<div style={{fontSize:13,color:"#6B6B80",marginTop:4}}>📐 {l.surface}</div>}
      {l.budget&&<div style={{fontSize:13,color:"#6B6B80",marginTop:4}}>💶 {l.budget}</div>}
      {l.adresse&&<div style={{fontSize:13,color:"#6B6B80",marginTop:4}}>📍 {l.adresse}{l.ville?", "+l.ville:""}</div>}
      {l.nb_artisans&&<div style={{fontSize:13,color:"#6B6B80",marginTop:4}}>👥 {l.nb_artisans} artisans contactes</div>}
      {l.montant_pre_autorise&&<div style={{fontSize:13,color:"#F26522",marginTop:4,fontWeight:600}}>💳 Pre-autorisation: {l.montant_pre_autorise} EUR</div>}
    </div>

    {l.artisan_statut==="en_route"&&l.adresse&&<div style={{...card}}>
      <div style={{fontSize:13,fontWeight:700,color:"#3B82F6",marginBottom:10}}>🚗 Votre artisan est en route</div>
      <div style={{display:"flex",gap:8}}>
        <a href={"https://waze.com/ul?q="+encodeURIComponent((l.adresse||"")+" "+(l.ville||""))} target="_blank" rel="noreferrer" style={{flex:1,height:42,borderRadius:10,background:"#33CCFF1A",color:"#0099CC",border:"1px solid #33CCFF44",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,textDecoration:"none"}}>🗺 Suivre sur Waze</a>
      </div>
    </div>}

    {l.paiement_statut==="en_attente_validation"&&<div style={{...card,background:"#FFF8F0",border:"1px solid #FFD9C2"}}>
      <div style={{fontSize:11,fontWeight:700,color:"#F26522",marginBottom:8}}>ARTISAN A TERMINE</div>
      <div style={{fontSize:14,marginBottom:12}}>{l.artisan_nom||"L artisan"} propose : <strong style={{color:"#F26522"}}>{l.prix_final} EUR</strong></div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>validerEtPayer(l)} style={{flex:1,padding:12,background:"#22C55E",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>✓ Valider et payer</button>
        <button onClick={()=>refuserPrix(l)} style={{flex:1,padding:12,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,color:"#EF4444",fontWeight:700,fontSize:13,cursor:"pointer"}}>✕ Refuser</button>
      </div>
    </div>}

    {l.artisan_statut==="en_cours"&&l.paiement_statut==="pre_autorise"&&<div style={{...card,background:"#E8FAF0",border:"1px solid #B8F0D6"}}>
      <div style={{fontSize:13,fontWeight:700,color:"#27AE60",marginBottom:10}}>🔧 Intervention en cours</div>
      <button onClick={()=>terminerIntervention(l)} style={{width:"100%",padding:12,background:"#22C55E",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>✓ Marquer comme terminee</button>
    </div>}

    {l.paiement_statut==="paye"&&<div style={{...card,background:"#E8FAF0",border:"1px solid #B8F0D6"}}>
      <div style={{fontSize:13,fontWeight:700,color:"#27AE60",marginBottom:10}}>✅ Intervention payee - {l.prix_final} EUR</div>
      <button onClick={()=>voirFacture(l)} style={{width:"100%",padding:12,background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:10,color:"#22C55E",fontWeight:700,fontSize:13,cursor:"pointer"}}>📄 Voir la facture</button>
    </div>}

    {l.paiement_statut==="en_litige"&&<div style={{...card,background:"#FEE2E2",border:"1px solid #FECACA"}}>
      <div style={{fontSize:13,fontWeight:700,color:"#EF4444"}}>⚠️ Litige en cours - Click&fix va vous contacter</div>
    </div>}
  </div>);
}

function HomeTab(){return(<main style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
  <div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.4px"}}>Bonjour, <span style={{color:"#38bdf8"}}>{s?.prenom}</span> 👋</div><div style={{fontSize:13,color:"#9898A8",marginTop:3}}>{dateStr}</div></div>

  <div style={{display:"flex",gap:10}}>
    <button onClick={()=>ctx.setPage("urgence")} style={{flex:1,padding:"13px",background:"#EF4444",border:"none",borderRadius:14,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>🚨 Urgence</button>
    <button onClick={()=>ctx.setPage("ai-lead")} style={{flex:1,padding:"13px",background:"#38bdf8",border:"none",borderRadius:14,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Nouvelle demande</button>
  </div>

  <button onClick={()=>{setShowDevisCheck(true);setDevisResult(null);}} style={{width:"100%",padding:"13px",background:"#fff",border:"1px solid #DCDCE6",borderRadius:14,color:"#333344",fontWeight:700,fontSize:13,cursor:"pointer"}}>📄 Vérifier un devis</button>

  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
    <div style={{...card,padding:"14px 10px",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:"#38bdf8"}}>{leads.length}</div><div style={{fontSize:10,color:"#9898A8",fontWeight:700,marginTop:2}}>Demandes</div></div>
    <div style={{...card,padding:"14px 10px",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:"#22C55E"}}>{confirmed.length}</div><div style={{fontSize:10,color:"#9898A8",fontWeight:700,marginTop:2}}>Confirmés</div></div>
    <div style={{...card,padding:"14px 10px",textAlign:"center",background:aValider.length>0?"#FFF0E8":"#fff",border:aValider.length>0?"1px solid #FFD9C2":"1px solid #EEEEF2"}}><div style={{fontSize:24,fontWeight:800,color:"#F26522"}}>{aValider.length}</div><div style={{fontSize:10,color:"#9898A8",fontWeight:700,marginTop:2}}>A valider</div></div>
  </div>

  <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <div style={{fontSize:16,fontWeight:700}}>Mes demandes recentes</div>
      <div onClick={()=>setTab("demandes")} style={{fontSize:13,color:"#38bdf8",fontWeight:600,cursor:"pointer"}}>Voir tout</div>
    </div>
    {leads.slice(0,3).map(l=><LeadCard key={l.id} l={l} onClick={()=>{setSelLead(l);setTab("demandes");}}/>)}
    {leads.length===0&&<div style={{textAlign:"center",padding:30,color:"#9898A8",fontSize:13}}>
      <div style={{fontSize:32,marginBottom:8}}>📋</div>
      Aucune demande pour le moment
    </div>}
  </div>
</main>);}

function DemandesTab(){return(<main style={{padding:"16px 16px 100px"}}>
  {selLead?(<div>
    <button onClick={()=>setSelLead(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#38bdf8",fontWeight:600,fontSize:14,cursor:"pointer",marginBottom:14,padding:0}}>← Retour</button>
    <div style={{fontSize:17,fontWeight:700,marginBottom:14}}>{selLead.travaux||"Demande"}</div>
    <LeadDetail l={selLead}/>
  </div>):(<div>
    <div style={{fontSize:17,fontWeight:700,marginBottom:14}}>Mes demandes ({leads.length})</div>
    {leads.map(l=><LeadCard key={l.id} l={l} onClick={()=>setSelLead(l)}/>)}
    {leads.length===0&&<div style={{textAlign:"center",padding:30,color:"#9898A8",fontSize:13}}>Aucune demande pour le moment</div>}
  </div>)}
</main>);}

function ProfilTab(){
  const [f,setF]=useState({prenom:s?.prenom||"",nom:s?.nom||"",tel:s?.tel||""});
  const [saving,setSaving]=useState(false);
  async function save(){
    setSaving(true);
    try{
      await fetch(SB+"/rest/v1/profiles?id=eq."+s.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+(s.token||SK)},body:JSON.stringify({prenom:f.prenom,nom:f.nom,tel:f.tel})});
      ctx.updateSession({...s,...f});
      ctx.notify("Profil mis a jour !");
    }catch(e){ctx.notify("Erreur","err");}
    setSaving(false);
  }
  return(<main style={{padding:"16px 16px 100px",display:"flex",flexDirection:"column",gap:12}}>
    <div style={{fontSize:17,fontWeight:700}}>Mon profil</div>
    <div style={{...card,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#38bdf8,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",flexShrink:0}}>{ini.toUpperCase()||"P"}</div>
      <div>
        <div style={{fontSize:17,fontWeight:700}}>{s?.prenom} {s?.nom}</div>
        <div style={{fontSize:13,color:"#9898A8",marginTop:2}}>Particulier</div>
      </div>
    </div>
    <div style={{...card,display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <label style={{fontSize:11,fontWeight:700,color:"#9898A8",textTransform:"uppercase"}}>Prenom</label>
        <input value={f.prenom} onChange={e=>setF(p=>({...p,prenom:e.target.value}))} style={{width:"100%",padding:"10px 12px",border:"1.5px solid #DCDCE6",borderRadius:10,fontSize:14,marginTop:4,fontFamily:"inherit",outline:"none"}}/>
      </div>
      <div>
        <label style={{fontSize:11,fontWeight:700,color:"#9898A8",textTransform:"uppercase"}}>Nom</label>
        <input value={f.nom} onChange={e=>setF(p=>({...p,nom:e.target.value}))} style={{width:"100%",padding:"10px 12px",border:"1.5px solid #DCDCE6",borderRadius:10,fontSize:14,marginTop:4,fontFamily:"inherit",outline:"none"}}/>
      </div>
      <div>
        <label style={{fontSize:11,fontWeight:700,color:"#9898A8",textTransform:"uppercase"}}>Telephone</label>
        <input value={f.tel} onChange={e=>setF(p=>({...p,tel:e.target.value.replace(/[^0-9]/g,"")}))} type="tel" style={{width:"100%",padding:"10px 12px",border:"1.5px solid #DCDCE6",borderRadius:10,fontSize:14,marginTop:4,fontFamily:"inherit",outline:"none"}}/>
      </div>
      <div>
        <label style={{fontSize:11,fontWeight:700,color:"#9898A8",textTransform:"uppercase"}}>Email</label>
        <input value={s?.email||""} disabled style={{width:"100%",padding:"10px 12px",border:"1.5px solid #EEEEF2",borderRadius:10,fontSize:14,marginTop:4,fontFamily:"inherit",outline:"none",background:"#F7F8FA",color:"#9898A8"}}/>
      </div>
      <button onClick={save} disabled={saving} style={{width:"100%",padding:12,background:"#38bdf8",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",opacity:saving?0.6:1}}>{saving?"Sauvegarde...":"Enregistrer"}</button>
    </div>
    <button onClick={ctx.logout} style={{width:"100%",padding:14,background:"#FEE2E2",border:"none",borderRadius:14,color:"#EF4444",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>Deconnexion</button>
  </main>);
}

function DevisCheckModal(){
  function badgeColor(v){if(v==="coherent")return"#22C55E";if(v==="eleve")return"#EF4444";if(v==="bas")return"#38bdf8";return"#F59E0B";}
  function badgeLabel(v){if(v==="coherent")return"Prix coherent avec le marche";if(v==="eleve")return"Prix plus eleve que la moyenne";if(v==="bas")return"Prix plus bas que la moyenne";return"A verifier manuellement";}
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowDevisCheck(false)}>
      <div style={{background:"#fff",borderRadius:20,padding:24,maxWidth:380,width:"100%"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:800}}>Vérifier un devis</div>
          <button onClick={()=>setShowDevisCheck(false)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#9898A8"}}>×</button>
        </div>
        <p style={{fontSize:13,color:"#6B6B80",marginBottom:16,lineHeight:1.5}}>Photographiez ou importez le devis recu d'un artisan. L'IA verifie si le prix est coherent.</p>
        {!devisResult&&!devisLoading&&<label style={{display:"block",border:"2px dashed #DCDCE6",borderRadius:14,padding:"24px 14px",textAlign:"center",cursor:"pointer",background:"#F7F8FA"}}>
          <div style={{fontSize:28,marginBottom:6}}>📄</div>
          <div style={{fontSize:12,color:"#6B6B80"}}>Choisir un fichier (image ou PDF)</div>
          <input type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleDevisFile(e.target.files[0])}/>
        </label>}
        {devisLoading&&<div style={{textAlign:"center",padding:"24px 0",color:"#6B6B80",fontSize:13}}>🔍 Analyse en cours...</div>}
        {devisResult&&!devisLoading&&(
          <div>
            {devisResult.verdict==="non_analyse"?(
              <div style={{padding:12,background:"#FFF8E1",borderRadius:10,fontSize:12,color:"#6B6B80"}}>{devisResult.raison}</div>
            ):(
              <div>
                <div style={{padding:"10px 12px",borderRadius:10,background:badgeColor(devisResult.verdict)+"1A",marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:700,color:badgeColor(devisResult.verdict)}}>{badgeLabel(devisResult.verdict)}</div>
                </div>
                {devisResult.travaux_detecte&&<div style={{fontSize:12,color:"#6B6B80",marginBottom:6}}>Travaux : <strong style={{color:"#333344"}}>{devisResult.travaux_detecte}</strong></div>}
                {devisResult.prix_detecte>0&&<div style={{fontSize:12,color:"#6B6B80",marginBottom:6}}>Prix devis : <strong style={{color:"#333344"}}>{devisResult.prix_detecte} EUR</strong></div>}
                {devisResult.ecart_pct!==undefined&&devisResult.ecart_pct!==0&&<div style={{fontSize:12,color:"#6B6B80",marginBottom:6}}>Ecart marche : <strong style={{color:badgeColor(devisResult.verdict)}}>{devisResult.ecart_pct>0?"+":""}{devisResult.ecart_pct}%</strong></div>}
                {devisResult.fourchette_min>0&&<div style={{fontSize:12,color:"#6B6B80",marginBottom:6}}>Fourchette : <strong style={{color:"#333344"}}>{devisResult.fourchette_min} - {devisResult.fourchette_max} EUR</strong></div>}
                {devisResult.explication&&<div style={{fontSize:11,color:"#9898A8",marginTop:8,lineHeight:1.5}}>{devisResult.explication}</div>}
              </div>
            )}
            <button onClick={()=>setShowDevisCheck(false)} style={{width:"100%",marginTop:14,padding:11,background:"#F7F8FA",border:"1px solid #DCDCE6",borderRadius:12,color:"#333344",fontWeight:700,fontSize:13,cursor:"pointer"}}>Fermer</button>
          </div>
        )}
      </div>
    </div>
  );
}

return(<div style={{fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",background:"#F7F8FA",color:"#333344",maxWidth:430,margin:"0 auto",minHeight:"100vh",position:"relative",overflowX:"hidden"}}>
  <header style={{background:"#fff",padding:"16px 20px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #EEEEF2",position:"sticky",top:0,zIndex:100}}>
    <div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.5px",color:"#333344"}}>click<span style={{color:"#38bdf8"}}>&</span>fix</div>
    <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#38bdf8,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff"}}>{ini.toUpperCase()||"P"}</div>
  </header>
  {tab==="home"&&<HomeTab/>}
  {tab==="demandes"&&<DemandesTab/>}
  {tab==="profil"&&<ProfilTab/>}
  <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #EEEEF2",display:"flex",padding:"10px 0 20px",zIndex:100}}>
    {TABS.map(t=>(<div key={t.id} onClick={()=>{setSelLead(null);setTab(t.id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 0"}}>
      <div style={{fontSize:20,color:tab===t.id?"#38bdf8":"#9898A8"}}>{t.ico}</div>
      <div style={{fontSize:10,fontWeight:600,color:tab===t.id?"#38bdf8":"#9898A8"}}>{t.label}</div>
    </div>))}
  </nav>
  {showDevisCheck&&<DevisCheckModal/>}
</div>);
}
