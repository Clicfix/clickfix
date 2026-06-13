export default function ProDashboardMobile({ctx,tab,setTab,dispo,toggleDispo}){
const s=ctx.sess;
const rdv=ctx.myLeadsPro;
const conf=rdv.filter(l=>l.statut==="confirme"||l.statut==="confirmed").length;
const pending=rdv.filter(l=>l.statut==="dispatche"||l.statut==="en attente").length;
const initiales=((s?.prenom||"")[0]||"")+(((s?.nom||"")[0])||"");
const days=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const now=new Date();
const dateStr=days[now.getDay()]+" "+now.getDate()+" "+["jan","fév","mars","avr","mai","juin","juil","août","sep","oct","nov","déc"][now.getMonth()];
const TABS=[{id:"rdv",ico:"📋",label:"RDV"},{id:"confirmes",ico:"✅",label:"Confirmés"},{id:"docs",ico:"📄",label:"Docs"},{id:"pack",ico:"📦",label:"Pack"},{id:"profil",ico:"👤",label:"Profil"}];
return(<div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif",background:"#F7F8FA",color:"#333344",maxWidth:430,margin:"0 auto",minHeight:"100vh",position:"relative",overflowX:"hidden"}}>
<header style={{background:"#fff",padding:"16px 20px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #EEEEF2",position:"sticky",top:0,zIndex:100}}>
<div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.5px",color:"#333344"}}>click<span style={{color:"#F26522"}}>&</span>fix</div>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{width:36,height:36,borderRadius:"50%",background:"#F7F8FA",border:"1px solid #EEEEF2",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>🔔</div>
<div style={{width:36,height:36,borderRadius:"50%",background:"#F26522",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff"}}>{initiales.toUpperCase()||"A"}</div>
</div>
</header>
<main style={{padding:"20px 16px 100px",display:"flex",flexDirection:"column",gap:20}}>
<div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.4px"}}>Bonjour, <span style={{color:"#F26522"}}>{s?.prenom}</span> 👋</div><div style={{fontSize:13,color:"#9898A8",marginTop:3}}>{dateStr}</div></div>
<div style={{background:"linear-gradient(135deg,#F26522,#FF8C42)",borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",color:"#fff",boxShadow:"0 4px 20px rgba(242,101,34,0.30)"}}>
<div><div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",opacity:0.8}}>Abonnement actif</div><div style={{fontSize:18,fontWeight:800}}>Pack {s?.pack||"Découverte"}</div><div style={{fontSize:12,opacity:0.75,marginTop:1}}>{s?.rdv_restants||0} leads restants</div></div>
<div style={{textAlign:"right"}}><div style={{fontSize:28,fontWeight:800,letterSpacing:-1}}>{s?.rdv_restants||0}<small style={{fontSize:12,fontWeight:500,opacity:0.75}}>/{s?.rdv_total||0}</small></div></div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<div style={{background:"#E8FAF0",border:"1px solid #B8F0D6",borderRadius:16,padding:16}}><div style={{fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:"#27AE60"}}>Confirmés</div><div style={{fontSize:32,fontWeight:800,color:"#27AE60",marginTop:2}}>{conf}</div><div style={{fontSize:11,color:"#27AE60",opacity:0.7}}>ce mois</div></div>
<div style={{background:"#fff",border:"1px solid #EEEEF2",borderRadius:16,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}><div style={{fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:"#9898A8"}}>En attente</div><div style={{fontSize:32,fontWeight:800,color:"#9898A8",marginTop:2}}>{pending}</div><div style={{fontSize:11,color:"#9898A8"}}>à traiter</div></div>
</div>
<div style={{background:"#fff",borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:"1px solid #EEEEF2"}}>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{width:36,height:36,borderRadius:10,background:"#E8FAF0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>⚡</div>
<div><div style={{fontSize:14,fontWeight:700}}>Dépannage urgent</div><div style={{fontSize:12,color:dispo?"#2ECC71":"#9898A8",fontWeight:600}}>{dispo?"Disponible":"Hors ligne"}</div></div>
</div>
<div onClick={toggleDispo} style={{width:48,height:28,borderRadius:99,background:dispo?"#2ECC71":"#D8D8E0",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
<div style={{position:"absolute",top:3,left:dispo?23:3,width:22,height:22,background:"#fff",borderRadius:"50%",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",transition:"left 0.2s"}}></div>
</div>
</div>
<div>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
<div style={{fontSize:16,fontWeight:700}}>Mes RDV récents</div>
<div onClick={()=>setTab("rdv")} style={{fontSize:13,color:"#F26522",fontWeight:600,cursor:"pointer"}}>Voir tout →</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:8}}>
{rdv.slice(0,3).map(l=>{
const init=((l.client_nom||"")[0]||"?").toUpperCase();
return(<div key={l.id} onClick={()=>setTab("rdv")} style={{background:"#fff",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:"1px solid #EEEEF2",cursor:"pointer"}}>
<div style={{width:42,height:42,borderRadius:"50%",background:"#FFF0E8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#F26522",flexShrink:0}}>{init}</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:15,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l.client_nom||"Client"}</div>
<div style={{fontSize:12,color:"#9898A8",marginTop:2}}>{l.ville||l.adresse||"Paris"}</div>
</div>
<span style={{padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:l.statut==="confirme"?"#E8FAF0":"#FFF0E8",color:l.statut==="confirme"?"#27AE60":"#F26522",flexShrink:0}}>{l.statut==="confirme"?"Confirmé":"En attente"}</span>
</div>);})}
{rdv.length===0&&<div style={{textAlign:"center",padding:20,color:"#9898A8",fontSize:13}}>Aucun RDV pour le moment</div>}
</div>
</div>
<div>
<div style={{fontSize:16,fontWeight:700,marginBottom:14}}>Accès rapide</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
{[{ico:"📄",label:"Documents",sub:"Devis, factures",t:"docs",bg:"#FFF0E8"},{ico:"📦",label:"Mon pack",sub:"Gérer l'abo",t:"pack",bg:"#EEF2FF"},{ico:"👤",label:"Profil",sub:"Modifier",t:"profil",bg:"#F3E8FF"},{ico:"✅",label:"Confirmés",sub:"Voir RDV",t:"confirmes",bg:"#E8FAF0"}].map(a=>(
<div key={a.t} onClick={()=>setTab(a.t)} style={{background:"#fff",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:"1px solid #EEEEF2",cursor:"pointer"}}>
<div style={{width:36,height:36,borderRadius:10,background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{a.ico}</div>
<div><div style={{fontSize:13,fontWeight:700}}>{a.label}</div><div style={{fontSize:11,color:"#9898A8"}}>{a.sub}</div></div>
</div>))}
</div>
</div>
</main>
<nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #EEEEF2",display:"flex",padding:"10px 0 20px",zIndex:100}}>
{TABS.map(t=>(<div key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 0"}}>
<div style={{fontSize:20,color:tab===t.id?"#F26522":"#9898A8"}}>{t.ico}</div>
<div style={{fontSize:10,fontWeight:600,color:tab===t.id?"#F26522":"#9898A8"}}>{t.label}</div>
</div>))}
</nav>
</div>);}
