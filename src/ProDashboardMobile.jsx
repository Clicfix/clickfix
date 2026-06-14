import React,{useState} from "react";

export default function ProDashboardMobile({ctx,tab,setTab,dispo,toggleDispo}){
const s=ctx.sess;
const rdv=ctx.myLeadsPro||[];
const [selLead,setSelLead]=useState(null);
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const conf=rdv.filter(l=>l.statut==="confirme"||l.artisan_statut==="confirme").length;
const pending=rdv.filter(l=>l.statut==="en_attente"||l.statut==="dispatche").length;
const ini=((s?.prenom||"")[0]||"")+(((s?.nom||"")[0])||"");
const now=new Date();
const days=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const months=["jan","fev","mars","avr","mai","juin","juil","aout","sep","oct","nov","dec"];
const dateStr=days[now.getDay()]+" "+now.getDate()+" "+months[now.getMonth()];
const TABS=[{id:"home",ico:"🏠",label:"Accueil"},{id:"rdv",ico:"📋",label:"RDV"},{id:"docs",ico:"📄",label:"Docs"},{id:"pack",ico:"📦",label:"Pack"},{id:"profil",ico:"👤",label:"Profil"}];
const card={background:"#fff",borderRadius:16,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:"1px solid #EEEEF2"};

async function updateStatut(leadId,statut){
  await fetch(SB+"/rest/v1/leads?id=eq."+leadId,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK},body:JSON.stringify({artisan_statut:statut})});
  ctx.notify("Statut mis a jour !");
  if(statut==="en_route"){
    navigator.geolocation&&navigator.geolocation.watchPosition(pos=>{
      fetch(SB+"/rest/v1/artisan_positions",{method:"POST",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK,"Prefer":"resolution=merge-duplicates"},body:JSON.stringify({artisan_id:s.id,lat:pos.coords.latitude,lon:pos.coords.longitude,statut:"en_route",lead_id:leadId,updated_at:new Date().toISOString()})});
    },null,{enableHighAccuracy:true});
  }
}

async function proposerPrix(leadId,prix){
  if(!prix||isNaN(prix)||prix<10)return ctx.notify("Prix invalide - minimum 10 EUR");
  await fetch(SB+"/rest/v1/leads?id=eq."+leadId,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK},body:JSON.stringify({prix_final:prix,paiement_statut:"en_attente_validation"})});
  ctx.notify("Prix envoye au client !");
}

function badgeStatut(l){
  const as=l.artisan_statut,ps=l.paiement_statut,st=l.statut;
  if(ps==="paye")return{txt:"Paye",bg:"#E8FAF0",c:"#27AE60"};
  if(ps==="en_attente_validation")return{txt:"A valider",bg:"#FFF0E8",c:"#F26522"};
  if(as==="en_cours")return{txt:"En cours",bg:"#EEF2FF",c:"#6366F1"};
  if(as==="arrive")return{txt:"Arrive",bg:"#E8FAF0",c:"#27AE60"};
  if(as==="en_route")return{txt:"En route",bg:"#EFF6FF",c:"#3B82F6"};
  if(as==="confirme"||st==="confirme")return{txt:"Confirme",bg:"#E8FAF0",c:"#27AE60"};
  return{txt:st||"...",bg:"#F7F8FA",c:"#9898A8"};
}

function LeadCard({l,onClick}){
  const b=badgeStatut(l);
  const init=((l.client_nom||"")[0]||"?").toUpperCase();
  return(<div onClick={onClick} style={{...card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:8}}>
    <div style={{width:42,height:42,borderRadius:"50%",background:"#FFF0E8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#F26522",flexShrink:0}}>{init}</div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:15,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l.client_nom||"Client"}</div>
      <div style={{fontSize:12,color:"#9898A8",marginTop:2}}>{l.travaux||l.precision||"..."} - {l.ville||l.adresse||""}</div>
    </div>
    <span style={{padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:b.bg,color:b.c,flexShrink:0}}>{b.txt}</span>
  </div>);
}

function LeadDetail({l}){
  const [prix,setPrix]=useState("");
  const as=l.artisan_statut,ps=l.paiement_statut,st=l.statut;
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{...card}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#9898A8",marginBottom:10}}>Informations client</div>
      <div style={{fontSize:14,fontWeight:700}}>{l.client_nom||"Client"}</div>
      {l.client_tel&&<a href={"tel:"+l.client_tel} style={{display:"flex",alignItems:"center",gap:6,marginTop:6,color:"#F26522",fontWeight:600,fontSize:14,textDecoration:"none"}}>📞 {l.client_tel}</a>}
      {l.adresse&&<div style={{fontSize:13,color:"#6B6B80",marginTop:4}}>📍 {l.adresse}{l.ville?", "+l.ville:""}</div>}
      {l.travaux&&<div style={{fontSize:13,color:"#6B6B80",marginTop:4}}>🔧 {l.travaux}{l.details?" - "+l.details:""}</div>}
      {l.creneaux&&<div style={{fontSize:13,color:"#6B6B80",marginTop:4}}>🕐 {l.creneaux}</div>}
      {l.montant_pre_autorise&&<div style={{fontSize:13,color:"#F26522",marginTop:4,fontWeight:600}}>💳 Pre-auto: {l.montant_pre_autorise} EUR</div>}
    </div>
    {l.adresse&&<div style={{display:"flex",gap:8}}>
      <a href={"https://waze.com/ul?q="+encodeURIComponent((l.adresse||"")+" "+(l.ville||""))} target="_blank" rel="noreferrer" style={{flex:1,height:44,borderRadius:12,background:"#33CCFF1A",color:"#0099CC",border:"1px solid #33CCFF44",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,textDecoration:"none"}}>🗺 Waze</a>
      <a href={"https://maps.google.com?q="+encodeURIComponent((l.adresse||"")+" "+(l.ville||""))} target="_blank" rel="noreferrer" style={{flex:1,height:44,borderRadius:12,background:"#4285F41A",color:"#4285F4",border:"1px solid #4285F444",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,textDecoration:"none"}}>🔵 Maps</a>
    </div>}
    <div style={{...card,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#9898A8"}}>Suivi intervention</div>
      {(st==="confirme"||st==="dispatche")&&(!as||as==="confirme")&&<button onClick={()=>updateStatut(l.id,"en_route")} style={{padding:12,background:"#F26522",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>🚗 Je suis en route</button>}
      {as==="en_route"&&<button onClick={()=>updateStatut(l.id,"arrive")} style={{padding:12,background:"#22C55E",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>📍 Je suis arrive</button>}
      {as==="arrive"&&<button onClick={()=>updateStatut(l.id,"en_cours")} style={{padding:12,background:"#6366F1",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>🔧 Commencer intervention</button>}
      {as==="en_cours"&&<button onClick={()=>updateStatut(l.id,"termine")} style={{padding:12,background:"#22C55E",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>✅ Terminer intervention</button>}
      {as==="termine"&&(ps==="pre_autorise"||!ps)&&<div>
        <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>💰 Prix final {l.montant_pre_autorise?"(max "+l.montant_pre_autorise+" EUR)":""}</div>
        <div style={{display:"flex",gap:8}}>
          <input type="number" value={prix} onChange={e=>setPrix(e.target.value)} placeholder="Prix EUR" min="10" max={l.montant_pre_autorise||9999} style={{flex:1,padding:"10px 12px",border:"1.5px solid #DCDCE6",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          <button onClick={()=>proposerPrix(l.id,parseFloat(prix))} style={{padding:"10px 16px",background:"#F26522",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Envoyer</button>
        </div>
      </div>}
      {ps==="en_attente_validation"&&<div style={{padding:10,background:"#FFF0E8",borderRadius:10,fontSize:13,color:"#F26522",fontWeight:600}}>⏳ {l.prix_final} EUR en attente validation client</div>}
      {ps==="paye"&&<div style={{padding:10,background:"#E8FAF0",borderRadius:10,fontSize:13,color:"#27AE60",fontWeight:600}}>✅ Paiement confirme - {l.prix_final} EUR</div>}
      {ps==="en_litige"&&<div style={{padding:10,background:"#FEE2E2",borderRadius:10,fontSize:13,color:"#EF4444",fontWeight:600}}>⚠️ Litige en cours</div>}
    </div>
  </div>);
}

function HomeTab(){return(<main style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
  <div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.4px"}}>Bonjour, <span style={{color:"#F26522"}}>{s?.prenom}</span> 👋</div><div style={{fontSize:13,color:"#9898A8",marginTop:3}}>{dateStr}</div></div>
  <div style={{background:"linear-gradient(135deg,#F26522,#FF8C42)",borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",color:"#fff",boxShadow:"0 4px 20px rgba(242,101,34,0.30)"}}>
    <div><div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",opacity:0.8}}>Abonnement actif</div><div style={{fontSize:18,fontWeight:800}}>Pack {s?.pack||"Decouverte"}</div><div style={{fontSize:12,opacity:0.75,marginTop:1}}>{s?.rdv_restants||0} leads restants</div></div>
    <div style={{textAlign:"right"}}><div style={{fontSize:28,fontWeight:800}}>{s?.rdv_restants||0}<small style={{fontSize:12,fontWeight:500,opacity:0.75}}>/{s?.rdv_total||0}</small></div></div>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
    <div style={{background:"#E8FAF0",border:"1px solid #B8F0D6",borderRadius:16,padding:16}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:"#27AE60"}}>Confirmes</div><div style={{fontSize:32,fontWeight:800,color:"#27AE60",marginTop:2}}>{conf}</div></div>
    <div style={{...card}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:"#9898A8"}}>En attente</div><div style={{fontSize:32,fontWeight:800,color:"#9898A8",marginTop:2}}>{pending}</div></div>
  </div>
  <div style={{...card,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:36,height:36,borderRadius:10,background:"#E8FAF0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>⚡</div>
      <div><div style={{fontSize:14,fontWeight:700}}>Depannage urgent</div><div style={{fontSize:12,color:dispo?"#2ECC71":"#9898A8",fontWeight:600}}>{dispo?"Disponible":"Hors ligne"}</div></div>
    </div>
    <div onClick={toggleDispo} style={{width:48,height:28,borderRadius:99,background:dispo?"#2ECC71":"#D8D8E0",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
      <div style={{position:"absolute",top:3,left:dispo?23:3,width:22,height:22,background:"#fff",borderRadius:"50%",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",transition:"left 0.2s"}}></div>
    </div>
  </div>
  <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <div style={{fontSize:16,fontWeight:700}}>Mes RDV recents</div>
      <div onClick={()=>setTab("rdv")} style={{fontSize:13,color:"#F26522",fontWeight:600,cursor:"pointer"}}>Voir tout</div>
    </div>
    {rdv.slice(0,3).map(l=><LeadCard key={l.id} l={l} onClick={()=>{setSelLead(l);setTab("rdv");}}/>)}
    {rdv.length===0&&<div style={{textAlign:"center",padding:20,color:"#9898A8",fontSize:13}}>Aucun RDV pour le moment</div>}
  </div>
</main>);}

function RdvTab(){return(<main style={{padding:"16px 16px 100px"}}>
  {selLead?(<div>
    <button onClick={()=>setSelLead(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#F26522",fontWeight:600,fontSize:14,cursor:"pointer",marginBottom:14,padding:0}}>← Retour</button>
    <div style={{fontSize:17,fontWeight:700,marginBottom:14}}>{selLead.client_nom||"Client"}</div>
    <LeadDetail l={selLead}/>
  </div>):(<div>
    <div style={{fontSize:17,fontWeight:700,marginBottom:14}}>Tous mes RDV ({rdv.length})</div>
    {rdv.map(l=><LeadCard key={l.id} l={l} onClick={()=>setSelLead(l)}/>)}
    {rdv.length===0&&<div style={{textAlign:"center",padding:30,color:"#9898A8",fontSize:13}}>Aucun RDV</div>}
  </div>)}
</main>);}

function DocsTab(){
  const payes=rdv.filter(l=>l.paiement_statut==="paye");
  return(<main style={{padding:"16px 16px 100px"}}>
    <div style={{fontSize:17,fontWeight:700,marginBottom:14}}>Mes documents</div>
    {payes.length===0&&<div style={{...card,textAlign:"center",padding:30,color:"#9898A8",fontSize:13}}>Aucune facture disponible</div>}
    {payes.map(l=><div key={l.id} style={{...card,marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:40,height:40,borderRadius:10,background:"#FFF0E8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📄</div>
      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>Facture - {l.client_nom||"Client"}</div><div style={{fontSize:12,color:"#9898A8",marginTop:2}}>{l.prix_final} EUR</div></div>
      <button onClick={()=>ctx.notify("Bientot disponible")} style={{padding:"6px 12px",background:"#F26522",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>PDF</button>
    </div>)}
  </main>);
}

function PackTab(){return(<main style={{padding:"16px 16px 100px"}}>
  <div style={{fontSize:17,fontWeight:700,marginBottom:14}}>Mon abonnement</div>
  <div style={{background:"linear-gradient(135deg,#16161F,#3D1A08)",borderRadius:20,padding:"22px 20px",color:"#fff",marginBottom:14}}>
    <div style={{fontSize:11,fontWeight:700,letterSpacing:1,opacity:0.5,textTransform:"uppercase",marginBottom:6}}>Pack actif</div>
    <div style={{fontSize:26,fontWeight:800}}>Pack {s?.pack||"Decouverte"}</div>
    <div style={{fontSize:13,opacity:0.6,marginTop:4}}>{s?.metier||"Artisan"} - Paris et banlieue</div>
    <div style={{marginTop:16,height:5,background:"rgba(255,255,255,0.15)",borderRadius:99,overflow:"hidden"}}>
      <div style={{height:"100%",background:"#F26522",borderRadius:99,width:s?.rdv_total>0?Math.round((s.rdv_total-(s.rdv_restants||0))/s.rdv_total*100)+"%":"0%"}}></div>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
      <div><div style={{fontSize:20,fontWeight:800}}>{s?.rdv_restants||0}</div><div style={{fontSize:11,opacity:0.5}}>Leads restants</div></div>
      <div><div style={{fontSize:20,fontWeight:800}}>{s?.note_moyenne||"—"}</div><div style={{fontSize:11,opacity:0.5}}>Note moy.</div></div>
      <div><div style={{fontSize:20,fontWeight:800}}>1 juil.</div><div style={{fontSize:11,opacity:0.5}}>Renouvellement</div></div>
    </div>
  </div>
  <button onClick={()=>ctx.notify("Bientot disponible")} style={{width:"100%",padding:14,background:"#F26522",border:"none",borderRadius:14,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>Upgrader mon pack</button>
</main>);}

function ProfilTab(){return(<main style={{padding:"16px 16px 100px"}}>
  <div style={{fontSize:17,fontWeight:700,marginBottom:14}}>Mon profil</div>
  <div style={{...card,marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
    <div style={{width:56,height:56,borderRadius:"50%",background:"#F26522",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",flexShrink:0}}>{ini.toUpperCase()||"A"}</div>
    <div><div style={{fontSize:17,fontWeight:700}}>{s?.prenom} {s?.nom}</div><div style={{fontSize:13,color:"#9898A8",marginTop:2}}>{s?.metier||"Artisan"} - Pack {s?.pack||"Decouverte"}</div></div>
  </div>
  <div style={{...card,marginBottom:10}}>
    {[["Email",s?.email],["Telephone",s?.tel],["Metier",s?.metier],["Ville",s?.ville_intervention]].filter(x=>x[1]).map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #F7F8FA"}}><span style={{fontSize:13,color:"#9898A8"}}>{k}</span><span style={{fontSize:13,fontWeight:600}}>{v}</span></div>)}
  </div>
  <button onClick={ctx.logout} style={{width:"100%",padding:14,background:"#FEE2E2",border:"none",borderRadius:14,color:"#EF4444",fontWeight:700,fontSize:15,cursor:"pointer"}}>Deconnexion</button>
</main>);}

return(<div style={{fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",background:"#F7F8FA",color:"#333344",maxWidth:430,margin:"0 auto",minHeight:"100vh",position:"relative",overflowX:"hidden"}}>
  <header style={{background:"#fff",padding:"16px 20px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #EEEEF2",position:"sticky",top:0,zIndex:100}}>
    <div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.5px",color:"#333344"}}>click<span style={{color:"#F26522"}}>&</span>fix</div>
    <div style={{width:36,height:36,borderRadius:"50%",background:"#F26522",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff"}}>{ini.toUpperCase()||"A"}</div>
  </header>
  {tab==="home"&&<HomeTab/>}
  {tab==="rdv"&&<RdvTab/>}
  {tab==="docs"&&<DocsTab/>}
  {tab==="pack"&&<PackTab/>}
  {tab==="profil"&&<ProfilTab/>}
  <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #EEEEF2",display:"flex",padding:"10px 0 20px",zIndex:100}}>
    {TABS.map(t=>(<div key={t.id} onClick={()=>{setSelLead(null);setTab(t.id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 0"}}>
      <div style={{fontSize:20,color:tab===t.id?"#F26522":"#9898A8"}}>{t.ico}</div>
      <div style={{fontSize:10,fontWeight:600,color:tab===t.id?"#F26522":"#9898A8"}}>{t.label}</div>
    </div>))}
  </nav>
</div>);}
