import React,{useState} from "react";

const TRAVAUX_CATS=[
  {id:"plomberie",label:"Plomberie",emoji:"🔧"},
  {id:"elec",label:"Electricite",emoji:"⚡"},
  {id:"serr",label:"Serrurerie",emoji:"🔑"},
  {id:"renov",label:"Renovation",emoji:"🎨"},
  {id:"chauf",label:"Chauffage",emoji:"🌡️"},
  {id:"toit",label:"Toiture",emoji:"🏠"},
  {id:"cuis",label:"Cuisine SDB",emoji:"🚿"},
  {id:"ext",label:"Exterieur",emoji:"🌿"},
  {id:"gros",label:"Gros Oeuvre",emoji:"🏗️"},
  {id:"energ",label:"Energie",emoji:"☀️"},
  {id:"fen",label:"Fenetres",emoji:"🪟"},
  {id:"div",label:"Divers",emoji:"🔨"},
];

const SPECIALITES={
  plomberie:["Fuite d eau","Robinet","WC bouche","Chauffe-eau","Salle de bain","Piscine"],
  elec:["Panne","Installation","Tableau","Borne recharge","Alarme","Domotique"],
  serr:["Porte bloquee","Serrure","Blindage","Urgence","Alarme","Camera"],
  renov:["Peinture","Carrelage","Faux plafond","Cuisine","Dressing","Decoration"],
  chauf:["Chauffage panne","Chaudiere","Climatisation","Pompe chaleur","Isolation","Solaire"],
  toit:["Fuite","Tuiles","Nettoyage","Charpente","Gouttieres","Velux"],
  cuis:["Cuisine","Salle de bain","Douche","Faience","Robinetterie","Plan travail"],
  ext:["Jardin","Terrasse","Elagage","Paysagisme","Allee","Cloture"],
  gros:["Fissures","Extension","Demolition","Terrassement","Construction","Ravalement"],
  energ:["Solaire","Pompe chaleur","Isolation combles","Isolation murs","VMC","Cheminee"],
  fen:["Fenetres","Porte entree","Porte garage","Volets","Veranda","Portail"],
  div:["Debarras","Nettoyage","Desamiantage","Ramonage","PMR","Nuisibles"],
};

const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";

export default function ProDashboardMobile({ctx,tab,setTab,dispo,toggleDispo}){
const s=ctx.sess;
const rdv=ctx.myLeadsPro||[];
const [selLead,setSelLead]=useState(null);
const [selCat,setSelCat]=useState(null);
const [editSpec,setEditSpec]=useState(false);
const [mySpecs,setMySpecs]=useState(s?.specialites||[]);
const [savingSpec,setSavingSpec]=useState(false);
const [prixInput,setPrixInput]=useState("");

const conf=rdv.filter(l=>l.statut==="confirme"||l.artisan_statut==="confirme").length;
const pending=rdv.filter(l=>l.statut==="en_attente"||l.statut==="dispatche").length;
const ini=((s?.prenom||"")[0]||"")+(((s?.nom||"")[0])||"");
const now=new Date();
const days=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const months=["jan","fev","mars","avr","mai","juin","juil","aout","sep","oct","nov","dec"];
const dateStr=days[now.getDay()]+" "+now.getDate()+" "+months[now.getMonth()];
const TABS=[{id:"home",ico:"🏠",label:"Accueil"},{id:"rdv",ico:"📋",label:"RDV"},{id:"docs",ico:"📄",label:"Docs"},{id:"pack",ico:"📦",label:"Pack"},{id:"profil",ico:"👤",label:"Profil"}];
const card={background:"#fff",borderRadius:16,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:"1px solid #EEEEF2"};

function badgeStatut(l){
  const as=l.artisan_statut,ps=l.paiement_statut,st=l.statut;
  if(ps==="paye")return{txt:"Paye",bg:"#E8FAF0",c:"#27AE60"};
  if(ps==="en_attente_validation")return{txt:"A valider",bg:"#FFF0E8",c:"#F26522"};
  if(as==="en_cours")return{txt:"En cours",bg:"#EEF2FF",c:"#6366F1"};
  if(as==="arrive")return{txt:"Arrive",bg:"#E8FAF0",c:"#27AE60"};
  if(as==="en_route")return{txt:"En route",bg:"#EFF6FF",c:"#3B82F6"};
  if(as==="confirme"||st==="confirme")return{txt:"Confirme",bg:"#E8FAF0",c:"#27AE60"};
  if(st==="dispatche")return{txt:"Nouveau",bg:"#EFF6FF",c:"#3B82F6"};
  return{txt:st||"...",bg:"#F7F8FA",c:"#9898A8"};
}

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

async function saveSpecialites(){
  setSavingSpec(true);
  try{
    await fetch(SB+"/rest/v1/profiles?id=eq."+s.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK,"Prefer":"return=minimal"},body:JSON.stringify({specialites:mySpecs})});
    ctx.updateSession({...s,specialites:mySpecs});
    ctx.notify("Specialites mises a jour !");
    setEditSpec(false);
  }catch(e){ctx.notify("Erreur - reessayez");}
  setSavingSpec(false);
}

function toggleSpec(sp){
  setMySpecs(prev=>prev.includes(sp)?prev.filter(x=>x!==sp):[...prev,sp]);
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
      <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#9898A8"}}>Actions</div>
      {(st==="dispatche"||st==="en_attente")&&!as&&<div style={{display:"flex",gap:8}}>
        <button onClick={()=>ctx.confirmerRdv(l)} style={{flex:1,padding:12,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,color:"#22C55E",fontWeight:700,fontSize:14,cursor:"pointer"}}>✓ Confirmer</button>
        <button onClick={()=>ctx.refuserRdv(l)} style={{flex:1,padding:12,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:12,color:"#EF4444",fontWeight:700,fontSize:14,cursor:"pointer"}}>✕ Refuser</button>
      </div>}
      {as==="confirme"&&<button onClick={()=>updateStatut(l.id,"en_route")} style={{padding:12,background:"#F26522",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>🚗 Je suis en route</button>}
      {as==="en_route"&&<button onClick={()=>updateStatut(l.id,"arrive")} style={{padding:12,background:"#22C55E",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>📍 Je suis arrive</button>}
      {as==="arrive"&&<button onClick={()=>updateStatut(l.id,"en_cours")} style={{padding:12,background:"#6366F1",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>🔧 Commencer l intervention</button>}
      {as==="en_cours"&&<button onClick={()=>updateStatut(l.id,"termine")} style={{padding:12,background:"#22C55E",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>✅ Terminer l intervention</button>}
      {as==="termine"&&(ps==="pre_autorise"||!ps)&&<div>
        <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>💰 Prix final {l.montant_pre_autorise?"(max "+l.montant_pre_autorise+" EUR)":""}</div>
        <div style={{display:"flex",gap:8}}>
          <input type="number" value={prixInput} onChange={e=>setPrixInput(e.target.value)} placeholder="Prix EUR" min="10" max={l.montant_pre_autorise||9999} style={{flex:1,padding:"10px 12px",border:"1.5px solid #DCDCE6",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          <button onClick={()=>{proposerPrix(l.id,parseFloat(prixInput));setPrixInput("");}} style={{padding:"10px 16px",background:"#F26522",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Envoyer</button>
        </div>
        {prixInput&&<div style={{fontSize:12,color:"#9898A8",marginTop:6}}>Vous recevrez : <strong style={{color:"#27AE60"}}>{Math.round(parseFloat(prixInput)*0.85)} EUR</strong> (85%)</div>}
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
    {rdv.length===0&&<div style={{textAlign:"center",padding:30,color:"#9898A8",fontSize:13}}>Aucun RDV pour le moment</div>}
  </div>)}
</main>);}

function DocsTab(){
  const docs=s?.docs||{};
  const docsList=[
    {id:"kbis",label:"Extrait Kbis",desc:"Document officiel entreprise",icon:"🏢"},
    {id:"assurance",label:"Assurance RC Pro",desc:"Responsabilite civile professionnelle",icon:"🛡️"},
    {id:"siret",label:"Attestation SIRET",desc:"Numero de SIRET actif",icon:"📋"},
    {id:"carte_pro",label:"Carte professionnelle",desc:"Identite professionnelle",icon:"🪪"},
  ];
  const payes=rdv.filter(l=>l.paiement_statut==="paye");
  return(<main style={{padding:"16px 16px 100px",display:"flex",flexDirection:"column",gap:16}}>
    <div style={{fontSize:17,fontWeight:700}}>Mes documents</div>
    <div style={{...card}}>
      <div style={{fontSize:11,fontWeight:700,marginBottom:12,color:"#9898A8",textTransform:"uppercase",letterSpacing:0.8}}>Documents entreprise</div>
      {docsList.map(doc=>{
        const uploaded=docs[doc.id];
        return(<div key={doc.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #F7F8FA"}}>
          <div style={{width:40,height:40,borderRadius:10,background:uploaded?"#E8FAF0":"#F7F8FA",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{doc.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700}}>{doc.label}</div>
            <div style={{fontSize:11,color:uploaded?"#27AE60":"#9898A8",marginTop:1}}>{uploaded?"Valide":"Non fourni"}</div>
          </div>
          <button onClick={()=>{
            const input=document.createElement("input");
            input.type="file";input.accept=".pdf,.jpg,.jpeg,.png";
            input.onchange=async e=>{const file=e.target.files[0];if(file)await ctx.uploadDoc(doc.id,file);};
            input.click();
          }} style={{padding:"6px 12px",background:uploaded?"#F7F8FA":"#FFF0E8",border:"1px solid "+(uploaded?"#EEEEF2":"#FFD9C2"),borderRadius:8,color:uploaded?"#9898A8":"#F26522",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            {uploaded?"Remplacer":"Ajouter"}
          </button>
        </div>);
      })}
    </div>
    <div style={{...card}}>
      <div style={{fontSize:11,fontWeight:700,marginBottom:12,color:"#9898A8",textTransform:"uppercase",letterSpacing:0.8}}>Factures emises</div>
      {payes.length===0&&<div style={{textAlign:"center",padding:20,color:"#9898A8",fontSize:13}}>Aucune facture disponible</div>}
      {payes.map(l=><div key={l.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #F7F8FA"}}>
        <div style={{width:40,height:40,borderRadius:10,background:"#FFF0E8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📄</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700}}>Facture - {l.client_nom||"Client"}</div>
          <div style={{fontSize:11,color:"#9898A8",marginTop:1}}>{l.prix_final} EUR</div>
        </div>
        <button onClick={()=>ctx.notify("Bientot disponible")} style={{padding:"6px 12px",background:"#F26522",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>PDF</button>
      </div>)}
    </div>
  </main>);}

function PackTab(){
  const packs=[
    {id:"decouverte",name:"Decouverte",price:"249",rdv:5,desc:"Sans engagement - 49 EUR/RDV"},
    {id:"pro",name:"Pro",price:"599",rdv:15,desc:"Populaire - 39 EUR/RDV"},
    {id:"pro",name:"Pro",price:"999",rdv:30,desc:"Maximum - 33 EUR/RDV"},
    {id:"elite",name:"Elite",price:"999",rdv:30,desc:"Maximum - 33 EUR/RDV"},
  ];
  const current=(s?.pack||"decouverte").toLowerCase();
  return(<main style={{padding:"16px 16px 100px",display:"flex",flexDirection:"column",gap:14}}>
    <div style={{fontSize:17,fontWeight:700}}>Mon abonnement</div>
    <div style={{background:"linear-gradient(135deg,#16161F,#3D1A08)",borderRadius:20,padding:"22px 20px",color:"#fff"}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:1,opacity:0.5,textTransform:"uppercase",marginBottom:6}}>Pack actif</div>
      <div style={{fontSize:26,fontWeight:800}}>Pack {s?.pack||"Decouverte"}</div>
      <div style={{fontSize:13,opacity:0.6,marginTop:4}}>{s?.metier||"Artisan"} - Paris et banlieue</div>
      <div style={{marginTop:16,height:5,background:"rgba(255,255,255,0.15)",borderRadius:99,overflow:"hidden"}}>
        <div style={{height:"100%",background:"#F26522",borderRadius:99,width:s?.rdv_total>0?Math.round((s.rdv_total-(s.rdv_restants||0))/s.rdv_total*100)+"%":"0%"}}></div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
        <div><div style={{fontSize:20,fontWeight:800}}>{s?.rdv_restants||0}</div><div style={{fontSize:11,opacity:0.5}}>Leads restants</div></div>
        <div><div style={{fontSize:20,fontWeight:800}}>{s?.note_moyenne||"..."}</div><div style={{fontSize:11,opacity:0.5}}>Note moy.</div></div>
        <div><div style={{fontSize:20,fontWeight:800}}>1 juil.</div><div style={{fontSize:11,opacity:0.5}}>Renouvellement</div></div>
      </div>
    </div>
    <div style={{fontSize:14,fontWeight:700,marginTop:4}}>Changer de pack</div>
    {packs.map(p=>{
      const isCurrent=current===p.id;
      return(<div key={p.id} style={{...card,border:isCurrent?"2px solid #F26522":"1px solid #EEEEF2"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:15,fontWeight:700}}>Pack {p.name}</div>
              {isCurrent&&<span style={{background:"#F26522",color:"#fff",borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700}}>Actuel</span>}
            </div>
            <div style={{fontSize:12,color:"#9898A8",marginTop:2}}>{p.desc} - {p.leads} leads/mois</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:800,color:isCurrent?"#F26522":"#333344"}}>{p.price} EUR</div>
            <div style={{fontSize:11,color:"#9898A8"}}>/mois</div>
          </div>
        </div>
        {!isCurrent&&<button onClick={()=>ctx.notify("Contactez support@click-fix.fr pour changer de pack")} style={{marginTop:10,width:"100%",padding:"10px",background:"#FFF0E8",border:"1px solid #FFD9C2",borderRadius:10,color:"#F26522",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Passer a ce pack</button>}
      </div>);
    })}
  </main>);}

function ProfilTab(){
  return(<main style={{padding:"16px 16px 100px",display:"flex",flexDirection:"column",gap:12}}>
    <div style={{fontSize:17,fontWeight:700}}>Mon profil</div>
    <div style={{...card,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:"#F26522",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",flexShrink:0}}>{ini.toUpperCase()||"A"}</div>
      <div>
        <div style={{fontSize:17,fontWeight:700}}>{s?.prenom} {s?.nom}</div>
        <div style={{fontSize:13,color:"#9898A8",marginTop:2}}>{s?.metier||"Artisan"} - Pack {s?.pack||"Decouverte"}</div>
        {s?.tel&&<div style={{fontSize:13,color:"#F26522",marginTop:2}}>📞 {s.tel}</div>}
      </div>
    </div>
    <div style={{...card}}>
      <div style={{fontSize:11,fontWeight:700,color:"#9898A8",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Informations</div>
      {[["Email",s?.email],["Telephone",s?.tel],["Metier",s?.metier],["SIRET",s?.siret],["Entreprise",s?.entreprise],["Ville",s?.ville_intervention],["Rayon",s?.rayon]].filter(x=>x[1]).map(([k,v])=>
        <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #F7F8FA"}}>
          <span style={{fontSize:13,color:"#9898A8"}}>{k}</span>
          <span style={{fontSize:13,fontWeight:600,maxWidth:"60%",textAlign:"right",wordBreak:"break-all"}}>{v}</span>
        </div>
      )}
    </div>
    <div style={{...card}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:"#9898A8",textTransform:"uppercase",letterSpacing:0.8}}>Mes specialites ({mySpecs.length})</div>
        <button onClick={()=>setEditSpec(!editSpec)} style={{background:"none",border:"none",color:"#F26522",fontWeight:700,fontSize:13,cursor:"pointer",padding:0}}>{editSpec?"Annuler":"Modifier"}</button>
      </div>
      {!editSpec&&<div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {mySpecs.length===0&&<div style={{fontSize:13,color:"#9898A8"}}>Aucune specialite ajoutee</div>}
        {mySpecs.map(sp=><span key={sp} style={{padding:"5px 10px",borderRadius:99,background:"rgba(242,101,34,0.1)",color:"#F26522",border:"1px solid rgba(242,101,34,0.2)",fontSize:12,fontWeight:600}}>{sp}</span>)}
      </div>}
      {editSpec&&<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
          {TRAVAUX_CATS.map(cat=>{
            const sel=selCat===cat.id;
            return(<button key={cat.id} onClick={()=>setSelCat(sel?null:cat.id)} style={{padding:"10px 6px",borderRadius:10,border:"1.5px solid "+(sel?"#F26522":"#EEEEF2"),background:sel?"#FFF0E8":"#F7F8FA",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
              <div style={{fontSize:18}}>{cat.emoji}</div>
              <div style={{fontSize:10,fontWeight:700,color:sel?"#F26522":"#6B6B80",marginTop:3}}>{cat.label}</div>
            </button>);
          })}
        </div>
        {selCat&&<div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:"#9898A8",marginBottom:8}}>Specialites {TRAVAUX_CATS.find(c=>c.id===selCat)?.label} :</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {(SPECIALITES[selCat]||[]).map(sp=>{
              const active=mySpecs.includes(sp);
              return(<button key={sp} onClick={()=>toggleSpec(sp)} style={{padding:"6px 11px",borderRadius:8,border:"1px solid "+(active?"#F26522":"rgba(0,0,0,0.1)"),background:active?"rgba(242,101,34,0.12)":"transparent",color:active?"#F26522":"#6e6e73",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{active?"✓ "+sp:sp}</button>);
            })}
          </div>
        </div>}
        <button onClick={saveSpecialites} disabled={savingSpec} style={{width:"100%",padding:12,background:"#F26522",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",opacity:savingSpec?0.6:1}}>
          {savingSpec?"Sauvegarde...":"Enregistrer les specialites"}
        </button>
      </div>}
    </div>
    <button onClick={ctx.logout} style={{width:"100%",padding:14,background:"#FEE2E2",border:"none",borderRadius:14,color:"#EF4444",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>Deconnexion</button>
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
    {TABS.map(t=>(<div key={t.id} onClick={()=>{setSelLead(null);setEditSpec(false);setTab(t.id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 0"}}>
      <div style={{fontSize:20,color:tab===t.id?"#F26522":"#9898A8"}}>{t.ico}</div>
      <div style={{fontSize:10,fontWeight:600,color:tab===t.id?"#F26522":"#9898A8"}}>{t.label}</div>
    </div>))}
  </nav>
</div>);}
