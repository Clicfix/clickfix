const LS = { get:(k)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch{return null}}, set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}, del:(k)=>{try{localStorage.removeItem(k)}catch{}} };
const TRAVAUX_OPTS=['Maconnerie','Menuiserie','Electricite','Plomberie','Chauffage','Isolation','Peinture','Carrelage','Toiture','Amenagement'];
const TRAVAUX_ICONS=['🧱','🪟','⚡','🚿','🌡️','🏠','🎨','🪵','🏗️','🌿'];
const STEPS=[{id:'type',title:'Vos travaux',sub:'Selectionnez',type:'multi',opts:TRAVAUX_OPTS.map((l,i)=>({icon:TRAVAUX_ICONS[i],label:l}))},{id:'surface',title:'Surface',sub:'Superficie',type:'single',opts:[{icon:'🏡',label:'< 30 m2'},{icon:'🏘️',label:'30-80 m2'},{icon:'🏠',label:'80-150 m2'},{icon:'🏢',label:'> 150 m2'}]},{id:'budget',title:'Budget',sub:'Estimation',type:'single',opts:[{icon:'💶',label:'< 5000 EUR'},{icon:'💰',label:'5000-20000 EUR'},{icon:'🏦',label:'20000-50000 EUR'},{icon:'💎',label:'> 50000 EUR'}]},{id:'artisans',title:'Artisans',sub:'Combien',type:'single',opts:[{icon:'3️⃣',label:'3 artisans'},{icon:'4️⃣',label:'4 artisans'},{icon:'5️⃣',label:'5 artisans'},{icon:'🔟',label:'+ de 5'}]},{id:'calendar',title:'Disponibilites',sub:'Min 3 creneaux',type:'calendar'},{id:'contact',title:'Coordonnees',sub:'Sous 24h',type:'form'}];
const PACKS=[{id:'decouverte',name:'Decouverte',rdv:5,prix:249,par:'49 EUR/RDV',couleur:'#38bdf8',tagline:'Sans engagement',abonnement:false,stripeUrl:'https://buy.stripe.com/test_00w6oJ8diba42kW9pv7wA00',features:['5 RDV','Support email','Sans engagement']},{id:'pro',name:'Pro',rdv:15,prix:599,par:'39 EUR/RDV',couleur:'#FF6F00',tagline:'Populaire',best:true,abonnement:true,stripeUrl:'https://buy.stripe.com/test_6oUfZj79eba41gSdFL7wA02',features:['15 RDV/mois','Support prioritaire']},{id:'elite',name:'Elite',rdv:30,prix:999,par:'33 EUR/RDV',couleur:'#facc15',tagline:'Maximum',abonnement:true,stripeUrl:'https://buy.stripe.com/test_3cI14p65aemgcZA6dj7wA01',features:['30 RDV/mois','Account manager']}];
const DOCS_DEF=[{id:'kbis',label:'Kbis',icon:'📋',oblig:true,desc:'Moins 3 mois'},{id:'decen',label:'Decennale',icon:'🛡️',oblig:true,desc:'En cours'},{id:'rc',label:'RC Pro',icon:'📄',oblig:true,desc:'RC civile'},{id:'rib',label:'RIB',icon:'🏦',oblig:true,desc:'Coordonnees bancaires'},{id:'rge',label:'RGE',icon:'⭐',oblig:false,desc:'Recommande'}];
const DEMO_LEADS=[{id:1001,created_at:'2025-06-02',heure:'09:00',client_nom:'Martin Lefevre',client_tel:'06 12 34 56 78',client_email:'martin@email.com',adresse:'12 rue de la Paix Paris',travaux:'Plomberie',surface:'30-80 m2',budget:'5000-20000 EUR',statut:'en attente',note:'',user_id:null,assigned_to:null},{id:1002,created_at:'2025-06-03',heure:'14:30',client_nom:'Sophie Renaud',client_tel:'07 23 45 67 89',client_email:'sophie@email.com',adresse:'8 avenue Victor Hugo Lyon',travaux:'Electricite',surface:'80-150 m2',budget:'5000-20000 EUR',statut:'en attente',note:'',user_id:null,assigned_to:null}];
const RESEND_API_KEY='re_ifi5vKQp_LM6JP8eoGccKGZrKEtTFTEQx';
async function sendConfirmationEmail(to,nom,slots,travaux){try{await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+RESEND_API_KEY},body:JSON.stringify({from:'onboarding@resend.dev',to:[to],subject:'Demande recue',html:'<p>Bonjour '+nom+', votre demande pour '+travaux+' a ete recue.</p>'})})}catch(e){}}
import { useState, useEffect, useRef } from "react";


function getLeads() { return LS.get("cf_leads") || DEMO_LEADS; }
function saveLeads(l) { LS.set("cf_leads", l); }
function getUsers() { return LS.get("cf_users") || []; }
function saveUsers(u) { LS.set("cf_users", u); }

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage]   = useState("home");
  const [sess, setSess]   = useState(() => LS.get("cf_sess"));
  const [toast, setToast] = useState(null);
  const [busy, setBusy]   = useState(false);
  const [leads, setLeads] = useState(() => getLeads());

  function notify(msg, type="ok") {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3800);
  }

  function saveSession(s) {
    setSess(s);
    if (s) LS.set("cf_sess", s);
    else LS.del("cf_sess");
  }

  function updateLeads(fn) {
    setLeads(prev => {
      const next = fn(prev);
      saveLeads(next);
      return next;
    });
  }

  // ── AUTH ──────────────────────────────────────────────────
  async function register(data) {
    setBusy(true);
    try {
      const users = getUsers();
      if (users.find(u => u.email === data.email)) throw new Error("Email déjà utilisé");
      const newUser = {
        id: "usr_" + Date.now(),
        email: data.email,
        pass: data.pass,
        prenom: data.prenom,
        nom: data.nom,
        role: data.role,
        tel: data.tel || "",
        entreprise: data.entreprise || "",
        siret: data.siret || "",
        docs: {},
        pack: null,
        rdv_restants: 0,
        rdv_total: 0,
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, newUser]);
      saveSession(newUser);

      // Sync Supabase en arrière-plan (sans bloquer)
      setPage(data.role === "pro" ? "pro-docs" : "part-home");
      notify("Bienvenue " + data.prenom + " 🎉");
    } catch(e) { notify(e.message, "err"); }
    setBusy(false);
  }

  async function login(email, pass, role) {
    setBusy(true);
    try {
      const users = getUsers();
      const u = users.find(u => u.email===email && u.pass===pass && u.role===role);
      if (!u) throw new Error("Email ou mot de passe incorrect");
      saveSession(u);
      setPage(role === "pro" ? "pro-dashboard" : "part-home");
      notify("Bienvenue " + u.prenom + " 👋");
    } catch(e) { notify(e.message, "err"); }
    setBusy(false);
  }

  function logout() {
    saveSession(null);
    setPage("home");
    notify("À bientôt !");
  }

  function updateSession(patch) {
    const updated = {...sess, ...patch};
    saveSession(updated);
    const users = getUsers();
    saveUsers(users.map(u => u.id===updated.id ? updated : u));
  }

  // ── LEADS ────────────────────────────────────────────────
  async function submitLead(formData) {
    setBusy(true);
    try {
      const newLead = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        heure: "Sur RDV",
        client_nom:   (formData.prenom||"") + " " + (formData.nom||""),
        client_tel:   formData.tel || "",
        client_email: formData.email || "",
        adresse:      formData.adresse || "",
        travaux:      Array.isArray(formData.type) ? formData.type.join(", ") : (formData.type||""),
        surface:      formData.surface || "",
        budget:       formData.budget || "",
        timing:       formData.timing || "",
        statut:       "en attente",
        note:         formData.message || "",
        user_id:      sess?.id || null,
        assigned_to:  null,
      };
      updateLeads(prev => [...prev, newLead]);
      // Sync Supabase
      // Email de confirmation au client
      if (newLead.client_email) {
        const slots = formData.slots || [];
        const travaux = Array.isArray(formData.type) ? formData.type.join(", ") : (formData.type||"travaux");
        sendConfirmationEmail(newLead.client_email, newLead.client_nom, slots, travaux);
      }
      setBusy(false);
      return true;
    } catch(e) { notify("Erreur : "+e.message,"err"); setBusy(false); return false; }
  }

  // ── PACK ─────────────────────────────────────────────────
  function buyPack(pack) {
    const available = leads.filter(l => l.assigned_to === null);
    const toAssign  = available.slice(0, pack.rdv);
    const ids       = toAssign.map(l => l.id);
    updateLeads(prev => prev.map(l =>
      ids.includes(l.id) ? {...l, assigned_to: sess.id, statut:"confirmé"} : l
    ));
    updateSession({ pack, rdv_restants: toAssign.length, rdv_total: pack.rdv });
    setPage("pro-dashboard");
    notify("Pack " + pack.name + " activé 🎉 " + toAssign.length + " RDV disponibles !");
  }

  // ── UPLOAD DOC ───────────────────────────────────────────
  async function uploadDoc(docId, file) {
    setBusy(true);
    try {
      // Lecture base64 locale
      const url = await new Promise((res,rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = () => rej(new Error("Lecture échouée"));
        r.readAsDataURL(file);
      });
      const newDocs = {...(sess.docs||{}), [docId]: url};
      updateSession({ docs: newDocs });
      notify("\"" + (DOCS_DEF.find(d=>d.id===docId)?.label||"Document") + "\" déposé ✅");
    } catch(e) { notify("Erreur upload : "+e.message,"err"); }
    setBusy(false);
  }

  const docsOk      = DOCS_DEF.filter(d=>d.oblig).every(d=>sess?.docs?.[d.id]);
  const myLeadsPart = leads.filter(l => l.user_id === sess?.id);
  const myLeadsPro  = leads.filter(l => l.assigned_to === sess?.id);

  const ctx = { sess, page, setPage, busy, docsOk, login, register, logout, updateSession, submitLead, buyPack, uploadDoc, notify, myLeadsPart, myLeadsPro };

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#07090f", minHeight:"100vh" }}>
      <GStyles />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {busy  && <Loader />}
      {page==="home"          && <HomePage     ctx={ctx} />}
      {page==="login-part"    && <AuthPage     ctx={ctx} role="part" mode="login" />}
      {page==="register-part" && <AuthPage     ctx={ctx} role="part" mode="register" />}
      {page==="login-pro"     && <AuthPage     ctx={ctx} role="pro"  mode="login" />}
      {page==="register-pro"  && <AuthPage     ctx={ctx} role="pro"  mode="register" />}
      {page==="part-home"     && <PartHome     ctx={ctx} />}
      {page==="part-lead"     && <LeadForm     ctx={ctx} />}
      {page==="pro-docs"      && <ProDocs      ctx={ctx} />}
      {page==="pro-pricing"   && <ProPricing   ctx={ctx} />}
      {page==="pro-dashboard" && <ProDashboard ctx={ctx} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  HOME
// ══════════════════════════════════════════════════════════════
function HomePage({ ctx }) {
  const [hov, setHov] = useState(null);
  const cards = [
    { role:"part", emoji:"🏠", title:"Espace Particulier",   sub:"Obtenez des devis gratuits pour vos travaux de rénovation", cta:"Déposer ma demande →", color:"#38bdf8",
      features:["Devis gratuit & sans engagement","Artisans certifiés RGE","Réponse sous 24h","Suivi de vos demandes"] },
    { role:"pro",  emoji:"🔨", title:"Espace Professionnel", sub:"Recevez des RDV qualifiés et développez votre activité",    cta:"Accéder à mon espace →", color:"#FF6F00",
      features:["RDV qualifiés livrés clé en main","Docs & suivi centralisés","Packs 10 / 20 / 50 RDV","Dashboard complet"] },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
      <BgFx />
      <div style={{ zIndex:2, textAlign:"center", marginBottom:50, animation:"fadeUp .5s ease" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,111,0,0.08)", border:"1px solid rgba(255,111,0,0.2)", borderRadius:99, padding:"5px 16px", marginBottom:18, fontSize:11, color:"#FF6F00", fontWeight:700, letterSpacing:1 }}>🔧 PLATEFORME RÉNOVATION N°1</div>
        <h1 style={{ fontSize:"clamp(38px,6vw,64px)", fontWeight:900, color:"#fff", letterSpacing:"-2.5px", lineHeight:1, marginBottom:12 }}>click<span style={{ color:"#FF6F00" }}>&</span>fix</h1>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.38)", maxWidth:420, margin:"0 auto", lineHeight:1.65 }}>La plateforme qui connecte particuliers et artisans pour des travaux réussis.</p>
      </div>
      <div style={{ zIndex:2, display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, width:"100%", maxWidth:720, animation:"fadeUp .6s ease" }}>
        {cards.map(c=>(
          <div key={c.role}
            style={{ background:hov===c.role?"rgba(255,255,255,0.065)":"rgba(255,255,255,0.03)", border:`1.5px solid ${hov===c.role?c.color:"rgba(255,255,255,0.08)"}`, borderRadius:24, padding:"32px 26px", cursor:"pointer", transition:"all .22s", transform:hov===c.role?"translateY(-5px)":"none", boxShadow:hov===c.role?`0 24px 60px ${c.color}20`:"none" }}
            onMouseEnter={()=>setHov(c.role)} onMouseLeave={()=>setHov(null)}
            onClick={()=>ctx.setPage(ctx.sess?.role===c.role?(c.role==="pro"?"pro-dashboard":"part-home"):("login-"+c.role))}>
            <div style={{ fontSize:46, marginBottom:14 }}>{c.emoji}</div>
            <h2 style={{ fontSize:20, fontWeight:900, color:"#fff", letterSpacing:"-0.4px", marginBottom:8 }}>{c.title}</h2>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.36)", lineHeight:1.65, marginBottom:22 }}>{c.sub}</p>
            {c.features.map(f=>(
              <div key={f} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:8, fontSize:13, color:"rgba(255,255,255,0.48)" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:c.color, flexShrink:0 }}/>{f}
              </div>
            ))}
            <div style={{ marginTop:26, background:`linear-gradient(135deg,${c.color},${c.color}bb)`, borderRadius:12, padding:"13px", fontWeight:800, color:"#fff", fontSize:14, textAlign:"center", boxShadow:`0 6px 24px ${c.color}40` }}>{c.cta}</div>
          </div>
        ))}
      </div>
      <div style={{ zIndex:2, marginTop:32, display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
        {["⭐ 4.9/5 — 2 400 avis","🏅 Artisans RGE","🆓 Devis gratuit","⚡ Réponse 24h","🔒 Données sécurisées"].map(b=>(
          <div key={b} style={{ fontSize:12, color:"rgba(255,255,255,0.28)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:99, padding:"5px 13px" }}>{b}</div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════
function AuthPage({ ctx, role, mode }) {
  const isPro=role==="pro", isAdmin=role==="admin", isLogin=mode==="login", color=isAdmin?"#a855f7":isPro?"#FF6F00":"#38bdf8";
  const [f,setF] = useState({prenom:"",nom:"",email:"",pass:"",tel:"",entreprise:"",siret:""});
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  function submit() {
    if (isLogin && !isAdmin) { ctx.login(f.email,f.pass,role); return; }
    if (isAdmin && isLogin) { ctx.login(f.email,f.pass,"admin"); return; }
    else {
      if (!f.prenom||!f.nom||!f.email||!f.pass) { ctx.notify("Remplissez tous les champs *","err"); return; }
      if (isPro&&(!f.entreprise||!f.siret||!f.tel)) { ctx.notify("Entreprise, SIRET et téléphone requis","err"); return; }
      ctx.register({...f,role});
    }
    if (isAdmin && isLogin) { ctx.login(f.email, f.pass, "admin"); }
  }
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative" }}>
      <BgFx />
      <div style={{ zIndex:2, width:"100%", maxWidth:isLogin?420:560, animation:"fadeUp .4s ease" }}>
        <button onClick={()=>ctx.setPage("home")} style={S.backBtn}>← Retour</button>
        <div style={S.authCard}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <span style={{ fontSize:28 }}>{isAdmin?"⚙️":isPro?"🔨":"🏠"}</span>
            <div>
              <div style={{ fontSize:21, fontWeight:900, color:"#fff", letterSpacing:"-0.4px" }}>{isAdmin?"Accès Admin":isLogin?"Connexion":"Créer un compte"}</div>
              <div style={{ fontSize:12, color, fontWeight:700, marginTop:2 }}>{isAdmin?"Espace Administrateur":isPro?"Espace Professionnel":"Espace Particulier"}</div>
            </div>
          </div>
          <div style={{ display:isLogin||isAdmin?"block":"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {!isLogin&&!isAdmin&&<><Inp label="Prénom *" v={f.prenom} set={set("prenom")}/><Inp label="Nom *" v={f.nom} set={set("nom")}/></>}
            <div style={{ gridColumn:"1/-1" }}><Inp label="Email *" v={f.email} set={set("email")} type="email"/></div>
            {!isLogin&&!isAdmin&&<>
              <Inp label="Téléphone *" v={f.tel} set={set("tel")} type="tel"/>
              {isPro&&<><Inp label="Nom entreprise *" v={f.entreprise} set={set("entreprise")}/><div style={{ gridColumn:"1/-1" }}><Inp label="N° SIRET *" v={f.siret} set={set("siret")}/></div></>}
            </>}
            <div style={{ gridColumn:"1/-1" }}><Inp label="Mot de passe *" v={f.pass} set={set("pass")} type="password"/></div>
          </div>
          <BigBtn style={{ marginTop:20, background:`linear-gradient(135deg,${color},${color}bb)`, boxShadow:`0 4px 24px ${color}44` }} onClick={submit}>
            {isLogin?"Se connecter →":"Créer mon compte →"}
          </BigBtn>
          {!isAdmin && <div style={{ textAlign:"center", marginTop:14, fontSize:13, color:"rgba(255,255,255,0.28)" }}>
            {isLogin?"Pas encore de compte ?":"Déjà inscrit ?"}{" "}
            <span style={{ color, cursor:"pointer", fontWeight:700 }} onClick={()=>ctx.setPage(`${isLogin?"register":"login"}-${role}`)}>
              {isLogin?"S'inscrire":"Se connecter"}
            </span>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PARTICULIER HOME
// ══════════════════════════════════════════════════════════════
function PartHome({ ctx }) {
  return (
    <Shell ctx={ctx} color="#38bdf8" title="Espace Particulier">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:22 }}>
        <StatCard icon="📋" label="Mes demandes" val={ctx.myLeadsPart.length} color="#38bdf8"/>
        <StatCard icon="✅" label="Confirmées"   val={ctx.myLeadsPart.filter(l=>l.statut==="confirmé").length} color="#22c55e"/>
      </div>
      <div style={S.card}>
        <ST>📋 Mes demandes de devis</ST>
        {ctx.myLeadsPart.length===0
          ? <Empty icon="🏠" title="Aucune demande" sub="Déposez votre premier projet pour recevoir des devis gratuits."/>
          : ctx.myLeadsPart.map(l=>(
            <div key={l.id} style={S.leadRow}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>{l.travaux||"—"}</div>
                <SBadge s={l.statut}/>
              </div>
              <div style={{ color:"rgba(255,255,255,0.36)", fontSize:12, marginTop:6, display:"flex", flexWrap:"wrap", gap:12 }}>
                {l.budget&&<span>💶 {l.budget}</span>}
                {l.surface&&<span>📐 {l.surface}</span>}
                {l.timing&&<span>⏱ {l.timing}</span>}
                {l.adresse&&<span>📍 {l.adresse}</span>}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:4 }}>{new Date(l.created_at).toLocaleDateString("fr-FR")}</div>
            </div>
          ))
        }
      </div>
      <BigBtn style={{ marginTop:16, background:"linear-gradient(135deg,#38bdf8,#0ea5e9)", boxShadow:"0 4px 20px #38bdf844" }} onClick={()=>ctx.setPage("part-lead")}>
        + Nouvelle demande de devis
      </BigBtn>
    </Shell>
  );
}

// ══════════════════════════════════════════════════════════════
//  LEAD FORM
// ══════════════════════════════════════════════════════════════
function LeadForm({ ctx }) {
  const [step,setStep]   = useState(0);
  const [ans,setAns]     = useState({});
  const [form,setForm]   = useState({ nom:ctx.sess?.nom||"", prenom:ctx.sess?.prenom||"", email:ctx.sess?.email||"", tel:ctx.sess?.tel||"", adresse:"", message:"" });
  const [done,setDone]   = useState(false);
  const [sending,setSending] = useState(false);
  const cur = STEPS[step];

  function sel(label) {
    if (cur.type==="multi") {
      const prev=ans[cur.id]||[];
      setAns({...ans,[cur.id]:prev.includes(label)?prev.filter(x=>x!==label):[...prev,label]});
    } else setAns({...ans,[cur.id]:label});
  }

  function canNext() {
    if (cur.type==="form") {
      const emailValid = form.email.includes("@") && form.email.includes(".");
      const telValid   = form.tel.trim().length >= 10;
      return form.nom.trim() && form.prenom.trim() && emailValid && telValid && form.adresse.trim();
    }
    if (cur.type==="calendar") return (ans.slots||[]).length >= 3;
    const v=ans[cur.id];
    return cur.type==="multi"?v?.length>0:!!v;
  }

  function getFormErrors() {
    const errors = [];
    if (!form.prenom.trim()) errors.push("Prénom manquant");
    if (!form.nom.trim()) errors.push("Nom manquant");
    if (!form.email.includes("@") && form.email.includes(".")) errors.push("Email invalide");
    if (form.tel.trim().length < 10) errors.push("Téléphone invalide");
    if (!form.adresse.trim()) errors.push("Adresse du chantier manquante");
    return errors;
  }

  async function next() {
    if (!canNext()) {
      if (cur.type==="form") {
        const errors = getFormErrors();
        ctx.notify(errors[0] || "Remplissez tous les champs obligatoires *", "err");
      } else if (cur.type==="calendar") {
        ctx.notify("Sélectionnez au moins " + (3-(ans.slots||[]).length) + " créneau(x) supplémentaire(s)", "err");
      } else {
        ctx.notify("Veuillez faire une sélection", "err");
      }
      return;
    }
    if (step<STEPS.length-1) { setStep(step+1); return; }
    // Vérification finale complète
    if (!ans.type?.length || !ans.surface || !ans.budget || !ans.artisans || (ans.slots||[]).length < 3) {
      ctx.notify("Votre demande est incomplète — vérifiez tous les champs", "err");
      return;
    }
    setSending(true);
    const ok = await ctx.submitLead({...ans,...form});
    setSending(false);
    if (ok) setDone(true);
  }

  if (done) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative" }}>
      <BgFx/>
      <div style={{ ...S.card, zIndex:2, maxWidth:480, textAlign:"center" }}>
        <div style={{ fontSize:60, marginBottom:14 }}>🎉</div>
        <div style={{ fontSize:24, fontWeight:900, color:"#fff", marginBottom:8 }}>Demande envoyée !</div>
        <div style={{ color:"rgba(255,255,255,0.42)", fontSize:14, lineHeight:1.75, marginBottom:24 }}>
          Merci <strong style={{ color:"#fff" }}>{form.prenom}</strong> !<br/>Nos artisans vous contactent sous <strong style={{ color:"#38bdf8" }}>24h</strong>.
        </div>
        <div style={{ background:"rgba(56,189,248,0.07)", border:"1px solid rgba(56,189,248,0.18)", borderRadius:12, padding:"14px 16px", marginBottom:22, textAlign:"left" }}>
          {[["Travaux",Array.isArray(ans.type)?ans.type.join(", "):ans.type],["Surface",ans.surface],["Budget",ans.budget],["Démarrage",ans.timing]].filter(([,v])=>v).map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
              <span style={{ color:"rgba(255,255,255,0.32)" }}>{l}</span>
              <span style={{ color:"#fff", fontWeight:600, textAlign:"right", maxWidth:"60%" }}>{v}</span>
            </div>
          ))}
        </div>
        <BigBtn style={{ background:"linear-gradient(135deg,#38bdf8,#0ea5e9)" }} onClick={()=>ctx.setPage("part-home")}>Voir mes demandes →</BigBtn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 16px", position:"relative" }}>
      <BgFx/>
      <div style={{ zIndex:2, width:"100%", maxWidth:560 }}>
        <button onClick={()=>step===0?ctx.setPage("part-home"):setStep(step-1)} style={S.backBtn}>← {step===0?"Retour":"Précédent"}</button>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.07)", borderRadius:99 }}>
            <div style={{ width:`${(step/(STEPS.length-1))*100}%`, height:"100%", background:"linear-gradient(90deg,#38bdf8,#0ea5e9)", borderRadius:99, transition:"width .4s" }}/>
          </div>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.24)", whiteSpace:"nowrap" }}>{step+1}/{STEPS.length}</span>
        </div>
        <div style={S.card}>
          <h2 style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.5px", marginBottom:6 }}>{cur.title}</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.36)", marginBottom:22 }}>{cur.sub}</p>
          {cur.type==="calendar" && (
            <CalendarPicker selected={ans.slots||[]} onChange={slots=>setAns({...ans,slots})} />
          )}
          {(cur.type==="multi" || cur.type==="single") && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
              {cur.opts.map(opt=>{
                const active=cur.type==="multi"?(ans[cur.id]||[]).includes(opt.label):ans[cur.id]===opt.label;
                return (
                  <button key={opt.label} onClick={()=>sel(opt.label)} style={{ background:active?"rgba(56,189,248,0.1)":"rgba(255,255,255,0.03)", border:`1.5px solid ${active?"#38bdf8":"rgba(255,255,255,0.08)"}`, borderRadius:12, padding:"14px 12px", cursor:"pointer", textAlign:"left", position:"relative", transition:"all .15s" }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{opt.icon}</div>
                    <div style={{ fontSize:13, color:"#fff", fontWeight:600, lineHeight:1.3 }}>{opt.label}</div>
                    {active&&<span style={{ position:"absolute", top:8, right:8, width:18, height:18, background:"#38bdf8", borderRadius:"50%", fontSize:10, color:"#fff", fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
          {cur.type==="form" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:22 }}>
              {[["prenom","Prénom *","text"],["nom","Nom *","text"],["email","Email *","email"],["tel","Téléphone *","tel"]].map(([k,l,t])=>(
                <Inp key={k} label={l} v={form[k]} set={e=>setForm({...form,[k]:e.target.value})} type={t}/>
              ))}
              <div style={{ gridColumn:"1/-1" }}><Inp label="Adresse du chantier *" v={form.adresse} set={e=>setForm({...form,adresse:e.target.value})}/></div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={S.lbl}>Message (optionnel)</label>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Décrivez votre projet..." style={{ ...S.inp, height:72, resize:"vertical" }}/>
              </div>
            </div>
          )}
          <BigBtn style={{ background:"linear-gradient(135deg,#38bdf8,#0ea5e9)", boxShadow:"0 4px 20px #38bdf844", opacity:canNext()?1:.4 }} disabled={!canNext()||sending} onClick={next}>
            {sending?"Envoi en cours...":step===STEPS.length-1?"🚀 Envoyer ma demande":"Continuer →"}
          </BigBtn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PRO DOCS
// ══════════════════════════════════════════════════════════════
function ProDocs({ ctx }) {
  return (
    <Shell ctx={ctx} color="#FF6F00" title="Documents requis">
      <p style={{ color:"rgba(255,255,255,0.36)", fontSize:13, lineHeight:1.75, marginBottom:24 }}>
        Déposez vos justificatifs pour activer votre compte partenaire. Fichiers stockés de façon sécurisée. 🔒
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>
        {DOCS_DEF.map(d=><DocRow key={d.id} doc={d} status={ctx.sess?.docs?.[d.id]} onUpload={ctx.uploadDoc}/>)}
      </div>
      <BigBtn style={{ opacity:ctx.docsOk?1:.4 }} disabled={!ctx.docsOk} onClick={()=>ctx.setPage("pro-pricing")}>
        {ctx.docsOk?"Choisir mon pack →":"⚠️ Documents obligatoires manquants"}
      </BigBtn>
    </Shell>
  );
}

function DocRow({ doc, status, onUpload }) {
  const ref = useRef();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, background:status?"rgba(34,197,94,0.05)":"rgba(255,255,255,0.03)", border:`1px solid ${status?"#22c55e":doc.oblig?"rgba(255,111,0,0.2)":"rgba(255,255,255,0.07)"}`, borderRadius:14, padding:"14px 16px", transition:"all .2s" }}>
      <span style={{ fontSize:24 }}>{doc.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:2 }}>
          <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>{doc.label}</span>
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:99, background:doc.oblig?"rgba(255,111,0,0.1)":"rgba(255,255,255,0.05)", color:doc.oblig?"#FF6F00":"rgba(255,255,255,0.3)", border:`1px solid ${doc.oblig?"rgba(255,111,0,0.2)":"rgba(255,255,255,0.07)"}` }}>{doc.oblig?"Obligatoire":"Facultatif"}</span>
        </div>
        <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>{doc.desc}</div>
      </div>
      {status
        ? <span style={{ color:"#22c55e", fontWeight:700, fontSize:13, whiteSpace:"nowrap" }}>✓ Déposé</span>
        : <><input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e=>e.target.files[0]&&onUpload(doc.id,e.target.files[0])}/><button style={S.smBtn} onClick={()=>ref.current?.click()}>📎 Déposer</button></>
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PRO PRICING
// ══════════════════════════════════════════════════════════════
function ProPricing({ ctx }) {
  const [hov,setHov]=useState(null);
  return (
    <Shell ctx={ctx} color="#FF6F00" title="Choisissez votre pack" maxW={940}>
      <p style={{ color:"rgba(255,255,255,0.36)", fontSize:13, textAlign:"center", marginBottom:34, lineHeight:1.7 }}>
        RDV qualifiés livrés dans votre espace sous 48h. Sans abonnement, sans engagement.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, marginBottom:28 }}>
        {PACKS.map(p=>(
          <div key={p.id} onMouseEnter={()=>setHov(p.id)} onMouseLeave={()=>setHov(null)}
            style={{ position:"relative", background:hov===p.id?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)", border:`1.5px solid ${hov===p.id||p.best?p.couleur:"rgba(255,255,255,0.08)"}`, borderRadius:22, padding:"28px 22px", display:"flex", flexDirection:"column", transition:"all .22s", transform:hov===p.id?"translateY(-5px)":"none", boxShadow:hov===p.id?`0 24px 60px ${p.couleur}25`:"none" }}>
            {p.best&&<div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(135deg,${p.couleur},${p.couleur}bb)`, color:"#fff", fontSize:11, fontWeight:800, padding:"4px 14px", borderRadius:99, letterSpacing:.5, whiteSpace:"nowrap", boxShadow:`0 4px 16px ${p.couleur}55` }}>⭐ Plus populaire</div>}
            <div style={{ color:p.couleur, fontWeight:800, fontSize:12, letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>{p.name}</div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12, marginBottom:18 }}>{p.tagline}</div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:2 }}>
              <span style={{ fontSize:44, fontWeight:900, color:"#fff", lineHeight:1 }}>{p.prix.toLocaleString("fr-FR")}</span>
              <span style={{ color:"rgba(255,255,255,0.35)", marginBottom:7, fontSize:16 }}>€</span>
            </div>
            <div style={{ color:p.couleur, fontSize:12, fontWeight:700, marginBottom:8 }}>{p.par}</div>
            <div style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, display:"inline-block", marginBottom:16, background:p.abonnement?"rgba(255,111,0,0.1)":"rgba(56,189,248,0.1)", color:p.abonnement?"#FF6F00":"#38bdf8", border:`1px solid ${p.abonnement?"rgba(255,111,0,0.3)":"rgba(56,189,248,0.3)"}` }}>{p.abonnement?"🔄 Abonnement mensuel":"✅ Paiement unique"}</div>
            <div style={{ background:`${p.couleur}18`, border:`1px solid ${p.couleur}33`, borderRadius:12, padding:"10px", textAlign:"center", marginBottom:22 }}>
              <span style={{ fontSize:34, fontWeight:900, color:p.couleur }}>{p.rdv}</span>
              <span style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}> rendez-vous</span>
            </div>
            {p.features.map(f=>(
              <div key={f} style={{ display:"flex", gap:8, marginBottom:8, fontSize:13, color:"rgba(255,255,255,0.5)" }}>
                <span style={{ color:p.couleur, flexShrink:0 }}>✓</span>{f}
              </div>
            ))}
            <button onClick={()=>ctx.buyPack(p)} style={{ marginTop:"auto", paddingTop:14, width:"100%", padding:"13px 0", background:`linear-gradient(135deg,${p.couleur},${p.couleur}bb)`, border:"none", borderRadius:12, color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:`0 4px 24px ${p.couleur}44`, letterSpacing:.3 }}>
              Activer ce pack
            </button>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}>💳 Paiement sécurisé · ✅ Satisfait ou remboursé 7 jours · 📞 Support dédié</div>
    </Shell>
  );
}

// ══════════════════════════════════════════════════════════════
//  PRO DASHBOARD
// ══════════════════════════════════════════════════════════════
function ProDashboard({ ctx }) {
  const [tab,setTab]=useState("rdv");
  const s=ctx.sess, rdv=ctx.myLeadsPro, conf=rdv.filter(l=>l.statut==="confirmé").length;
  const TABS=[{id:"rdv",ico:"📅",label:"Mes RDV"},{id:"docs",ico:"📁",label:"Documents"},{id:"pack",ico:"💎",label:"Mon Pack"},{id:"profil",ico:"👤",label:"Profil"}];

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <div style={{ width:232, background:"rgba(255,255,255,0.025)", borderRight:"1px solid rgba(255,255,255,0.055)", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"24px 18px 16px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:20 }}>🔧</span>
            <span style={{ fontSize:17, fontWeight:900, color:"#fff" }}>click<span style={{ color:"#FF6F00" }}>&</span>fix <span style={{ fontSize:9, background:"rgba(255,111,0,0.15)", color:"#FF6F00", border:"1px solid rgba(255,111,0,0.3)", borderRadius:4, padding:"1px 5px", fontWeight:700, letterSpacing:1 }}>PRO</span></span>
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.52)", fontWeight:700 }}>{s?.prenom} {s?.nom}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.24)", marginTop:1 }}>{s?.entreprise}</div>
        </div>
        <div style={{ padding:"10px 8px", flex:1 }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", textAlign:"left", padding:"10px 12px", background:tab===t.id?"rgba(255,111,0,0.12)":"transparent", border:"none", borderRadius:10, color:tab===t.id?"#FF6F00":"rgba(255,255,255,0.4)", fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", marginBottom:3, transition:"all .15s" }}>
              <span>{t.ico}</span>{t.label}
            </button>
          ))}
        </div>
        {s?.pack&&(
          <div style={{ margin:"0 8px 8px", background:"rgba(255,111,0,0.07)", border:"1px solid rgba(255,111,0,0.17)", borderRadius:12, padding:13 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.28)", letterSpacing:1, marginBottom:3 }}>PACK ACTIF</div>
            <div style={{ fontSize:15, fontWeight:900, color:"#FF6F00" }}>{s.pack.name}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>{s.rdv_restants||0}/{s.rdv_total||0} RDV</div>
            <div style={{ marginTop:7, height:3, background:"rgba(255,255,255,0.07)", borderRadius:99 }}>
              <div style={{ width:`${s.rdv_total>0?((s.rdv_restants||0)/s.rdv_total)*100:0}%`, height:"100%", background:"linear-gradient(90deg,#FF6F00,#FBC005)", borderRadius:99 }}/>
            </div>
          </div>
        )}
        <div style={{ padding:"0 8px 14px" }}>
          <button onClick={ctx.logout} style={{ width:"100%", padding:"9px", background:"transparent", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, color:"rgba(255,255,255,0.22)", fontFamily:"'Outfit',sans-serif", fontSize:12, cursor:"pointer" }}>← Déconnexion</button>
        </div>
      </div>

      <div style={{ flex:1, overflow:"auto", background:"#07090f" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 28px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.015)" }}>
          <div>
            <div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>Bonjour {s?.prenom} 👋</div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {!ctx.docsOk&&<button style={S.smBtn} onClick={()=>setTab("docs")}>⚠️ Documents</button>}
            {!s?.pack&&<button style={S.smBtn} onClick={()=>ctx.setPage("pro-pricing")}>🚀 Acheter un pack</button>}
          </div>
        </div>

        <div style={{ padding:"24px 28px" }}>
          {tab==="rdv"&&<>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
              <StatCard icon="📅" label="RDV ce mois"  val={rdv.length}         color="#FF6F00"/>
              <StatCard icon="✅" label="Confirmés"     val={conf}               color="#22c55e"/>
              <StatCard icon="⏳" label="En attente"    val={rdv.length-conf}    color="#FBC005"/>
              <StatCard icon="🎯" label="RDV restants"  val={s?.rdv_restants||0} color="#38bdf8"/>
            </div>
            <ST>📅 Rendez-vous qualifiés</ST>
            {rdv.length===0
              ? <Empty icon="📅" title="Aucun RDV pour l'instant" sub="Activez un pack pour recevoir vos premiers RDV qualifiés sous 48h." cta="Voir les packs" onCta={()=>ctx.setPage("pro-pricing")}/>
              : rdv.map(l=>(
                <div key={l.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"16px 18px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7, flexWrap:"wrap" }}>
                        <span style={{ color:"#fff", fontWeight:800, fontSize:16 }}>{l.client_nom}</span>
                        <SBadge s={l.statut}/>
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:14, fontSize:12, color:"rgba(255,255,255,0.4)" }}>
                        {l.created_at&&<span>📅 {new Date(l.created_at).toLocaleDateString("fr-FR")}</span>}
                        {l.adresse&&<span>📍 {l.adresse}</span>}
                        {l.travaux&&<span>🔧 {l.travaux}</span>}
                        {l.budget&&<span>💶 {l.budget}</span>}
                      </div>
                      {l.note&&<div style={{ marginTop:6, fontSize:12, color:"rgba(255,165,0,.65)", fontStyle:"italic" }}>💬 {l.note}</div>}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      {l.client_tel&&<a href={`tel:${l.client_tel}`} style={{ ...S.smBtn, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5 }}>📞 {l.client_tel}</a>}
                      {l.client_email&&<a href={`mailto:${l.client_email}`} style={{ ...S.smBtn, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, borderColor:"rgba(56,189,248,0.3)", color:"#38bdf8", background:"rgba(56,189,248,0.07)" }}>✉️ Email</a>}
                    </div>
                  </div>
                </div>
              ))
            }
          </>}

          {tab==="docs"&&<>
            <ST>📁 Mes Documents</ST>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {DOCS_DEF.map(d=><DocRow key={d.id} doc={d} status={ctx.sess?.docs?.[d.id]} onUpload={ctx.uploadDoc}/>)}
            </div>
          </>}

          {tab==="pack"&&<>
            <ST>💎 Mon Pack & Facturation</ST>
            {s?.pack
              ? <div style={{ background:"rgba(255,111,0,0.07)", border:"1px solid rgba(255,111,0,0.2)", borderRadius:18, padding:24, marginBottom:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:4 }}>PACK ACTIF</div>
                      <div style={{ fontSize:28, fontWeight:900, color:"#FF6F00" }}>{s.pack.name}</div>
                      <div style={{ color:"rgba(255,255,255,0.38)", fontSize:13, marginTop:4 }}>30 jours · {s.rdv_restants||0}/{s.rdv_total||0} RDV restants</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:36, fontWeight:900, color:"#fff" }}>{s.pack.prix?.toLocaleString("fr-FR")} €</div>
                    </div>
                  </div>
                  <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:99 }}>
                    <div style={{ width:`${s.rdv_total>0?((s.rdv_restants||0)/s.rdv_total)*100:0}%`, height:"100%", background:"linear-gradient(90deg,#FF6F00,#FBC005)", borderRadius:99 }}/>
                  </div>
                  <BigBtn style={{ marginTop:18 }} onClick={()=>ctx.setPage("pro-pricing")}>Renouveler ou changer de pack →</BigBtn>
                </div>
              : <Empty icon="💎" title="Aucun pack actif" sub="Choisissez un pack pour commencer à recevoir des RDV." cta="Voir les packs" onCta={()=>ctx.setPage("pro-pricing")}/>
            }
          </>}

          {tab==="profil"&&<>
            <ST>👤 Mon Profil</ST>
            <div style={{ ...S.card, maxWidth:520 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[["Prénom",s?.prenom],["Nom",s?.nom],["Email",s?.email],["Téléphone",s?.tel||""],["Entreprise",s?.entreprise||""],["SIRET",s?.siret||""]].map(([l,v])=>(
                  <Inp key={l} label={l} v={v||""} set={()=>{}}/>
                ))}
              </div>
              <BigBtn style={{ marginTop:18 }} onClick={()=>ctx.notify("Profil mis à jour ✅")}>Enregistrer</BigBtn>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SHARED UI
// ══════════════════════════════════════════════════════════════
function Shell({ ctx, color, title, maxW=660, children }) {
  return (
    <div style={{ minHeight:"100vh", position:"relative", padding:"24px 20px" }}>
      <BgFx/>
      <div style={{ zIndex:2, maxWidth:maxW, margin:"0 auto", position:"relative" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:26 }}>
          <div>
            <button onClick={()=>ctx.setPage("home")} style={S.backBtn}>← Accueil</button>
            <div style={{ fontSize:21, fontWeight:900, color:"#fff" }}>click<span style={{ color:"#FF6F00" }}>&</span>fix</div>
            <div style={{ fontSize:13, color, fontWeight:700, marginTop:1 }}>{title}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"rgba(255,255,255,0.48)", fontSize:13, fontWeight:600 }}>{ctx.sess?.prenom} {ctx.sess?.nom}</div>
            <button onClick={ctx.logout} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.22)", cursor:"pointer", fontSize:12 }}>Déconnexion</button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Inp({ label, v, set, type="text" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={S.lbl}>{label}</label>
      <input type={type} value={v} onChange={set} style={S.inp}
        onFocus={e=>e.target.style.borderColor="#FF6F00"}
        onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.09)"}/>
    </div>
  );
}

function BigBtn({ children, onClick, disabled, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width:"100%", padding:"13px 20px", background:"linear-gradient(135deg,#FF6F00,#FBC005)", border:"none", borderRadius:12, color:"#fff", fontWeight:800, fontSize:15, cursor:disabled?"not-allowed":"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:"0 4px 24px rgba(255,111,0,.3)", letterSpacing:.2, display:"block", ...style }}>
      {children}
    </button>
  );
}

function StatCard({ icon, label, val, color }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"18px 20px" }}>
      <div style={{ fontSize:30, fontWeight:900, color }}>{val}</div>
      <div style={{ color:"rgba(255,255,255,0.32)", fontSize:12, marginTop:4 }}>{icon} {label}</div>
    </div>
  );
}

function SBadge({ s }) {
  const ok=s==="confirmé";
  return <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:99, background:ok?"rgba(34,197,94,0.1)":"rgba(251,192,5,0.1)", color:ok?"#22c55e":"#FBC005", border:`1px solid ${ok?"rgba(34,197,94,0.4)":"rgba(251,192,5,0.4)"}` }}>{ok?"✓ Confirmé":"⏳ En attente"}</span>;
}

function ST({ children }) { return <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>{children}</div>; }

function Empty({ icon, title, sub, cta, onCta }) {
  return (
    <div style={{ textAlign:"center", padding:"50px 20px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:16, marginBottom:16 }}>
      <div style={{ fontSize:44, marginBottom:12 }}>{icon}</div>
      <div style={{ color:"#fff", fontWeight:800, fontSize:18, marginBottom:6 }}>{title}</div>
      <div style={{ color:"rgba(255,255,255,0.32)", fontSize:13, marginBottom:cta?20:0 }}>{sub}</div>
      {cta&&<button style={{ ...S.smBtn, fontSize:13, padding:"9px 20px" }} onClick={onCta}>{cta} →</button>}
    </div>
  );
}

function Toast({ msg, type }) {
  return <div style={{ position:"fixed", top:18, right:18, zIndex:9999, background:type==="err"?"#c0392b":"linear-gradient(135deg,#FF6F00,#FBC005)", color:"#fff", fontWeight:700, fontSize:14, padding:"13px 20px", borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,.5)", animation:"slideIn .3s ease", maxWidth:340, lineHeight:1.4 }}>{msg}</div>;
}

function Loader() {
  return <div style={{ position:"fixed", inset:0, zIndex:9998, background:"rgba(7,9,15,.75)", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}><div style={{ width:44, height:44, border:"3px solid rgba(255,255,255,0.07)", borderTop:"3px solid #FF6F00", borderRadius:"50%", animation:"spin .8s linear infinite" }}/></div>;
}

function BgFx() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
      <div style={{ position:"absolute", top:"-20%", left:"-10%", width:650, height:650, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,111,0,.09) 0%,transparent 70%)" }}/>
      <div style={{ position:"absolute", bottom:"-15%", right:"-8%", width:550, height:550, borderRadius:"50%", background:"radial-gradient(circle,rgba(56,189,248,.06) 0%,transparent 70%)" }}/>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.019) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.019) 1px,transparent 1px)", backgroundSize:"46px 46px" }}/>
    </div>
  );
}

const S = {
  card:    { background:"rgba(255,255,255,0.035)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:18, padding:"24px" },
  authCard:{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(28px)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:22, padding:"36px 32px", boxShadow:"0 32px 80px rgba(0,0,0,.4)" },
  smBtn:   { padding:"7px 13px", background:"rgba(255,111,0,0.1)", border:"1px solid rgba(255,111,0,0.3)", borderRadius:8, color:"#FF6F00", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Outfit',sans-serif", whiteSpace:"nowrap" },
  backBtn: { background:"none", border:"none", color:"rgba(255,255,255,0.32)", cursor:"pointer", fontSize:13, marginBottom:20, display:"flex", alignItems:"center", gap:6 },
  lbl:     { fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:.5, textTransform:"uppercase", display:"block", marginBottom:5 },
  inp:     { background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"11px 13px", color:"#fff", fontSize:14, fontFamily:"'Outfit',sans-serif", width:"100%", outline:"none", transition:"border-color .18s" },
  leadRow: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px", marginBottom:10 },
};







function CalendarPicker({ selected, onChange }) {
  const now   = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear,  setCurrentYear]  = useState(now.getFullYear());
  const [pickedDate,   setPickedDate]   = useState(null);

  const MATIN  = ["08:00","09:00","10:00","11:00","12:00"];
  const APMIDI = ["13:00","14:00","15:00","16:00","17:00","18:00"];
  const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const DAYS   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

  const fmtDate = (day) => String(day).padStart(2,"0") + "/" + String(currentMonth+1).padStart(2,"0") + "/" + currentYear;

  function getDaysInMonth(m,y) { return new Date(y,m+1,0).getDate(); }
  function getFirstDay(m,y)    { let d=new Date(y,m,1).getDay(); return d===0?6:d-1; }

  // Désactivé si dimanche (0) ou moins de 24h
  function isDisabled(day) {
    const d = new Date(currentYear, currentMonth, day);
    const dow = d.getDay();
    if (dow === 0) return true; // dimanche
    const minDate = new Date(now.getTime() + 24*60*60*1000);
    minDate.setHours(0,0,0,0);
    return d < minDate;
  }

  function toggleSlot(date, hour) {
    const key = date + "_" + hour;
    const exists = selected.find(s => s.key === key);
    if (exists) onChange(selected.filter(s => s.key !== key));
    else onChange([...selected, { key, date, hour, label: date + " à " + hour }]);
  }

  function isSel(date, hour) { return !!selected.find(s => s.key === (date + "_" + hour)); }

  function prevMonth() {
    if (currentMonth===0) { setCurrentMonth(11); setCurrentYear(y=>y-1); }
    else setCurrentMonth(m=>m-1);
    setPickedDate(null);
  }
  function nextMonth() {
    if (currentMonth===11) { setCurrentMonth(0); setCurrentYear(y=>y+1); }
    else setCurrentMonth(m=>m+1);
    setPickedDate(null);
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay    = getFirstDay(currentMonth, currentYear);

  // Samedi en orange, jours normaux en blanc
  function dayColor(day) {
    if (isDisabled(day)) return "rgba(255,255,255,0.15)";
    const dow = new Date(currentYear, currentMonth, day).getDay();
    if (dow === 6) return "#FBC005"; // samedi = orange
    return "rgba(255,255,255,0.75)";
  }

  const SlotBtn = ({ date, hour }) => {
    const s = isSel(date, hour);
    return (
      <button onClick={()=>toggleSlot(date,hour)} style={{ padding:"7px 13px", borderRadius:8, border:`1.5px solid ${s?"#38bdf8":"rgba(255,255,255,0.1)"}`, background:s?"rgba(56,189,248,0.15)":"rgba(255,255,255,0.03)", color:s?"#38bdf8":"rgba(255,255,255,0.45)", fontSize:12, fontWeight:s?700:400, cursor:"pointer", transition:"all .15s" }}>
        {hour}{s?" ✓":""}
      </button>
    );
  };

  return (
    <div style={{ marginBottom:20 }}>
      {/* Status bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:13 }}>
          {selected.length < 3
            ? <span style={{ color:"#FBC005" }}>⚠️ Encore {3-selected.length} créneau{3-selected.length>1?"x":""} requis</span>
            : <span style={{ color:"#22c55e" }}>✓ {selected.length} créneaux sélectionnés</span>
          }
        </div>
        {selected.length>0 && <button onClick={()=>onChange([])} style={{ fontSize:11, color:"rgba(255,255,255,0.25)", background:"none", border:"none", cursor:"pointer" }}>Tout effacer</button>}
      </div>

      {/* Légende */}
      <div style={{ display:"flex", gap:14, marginBottom:12, fontSize:11, color:"rgba(255,255,255,0.35)" }}>
        <span>⬜ Semaine disponible</span>
        <span style={{ color:"#FBC005" }}>🟨 Samedi disponible</span>
        <span>⬛ Indisponible</span>
      </div>

      {/* Calendrier */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"16px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <button onClick={prevMonth} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:20, padding:"2px 8px" }}>‹</button>
          <span style={{ color:"#fff", fontWeight:700, fontSize:15 }}>{MONTHS[currentMonth]} {currentYear}</span>
          <button onClick={nextMonth} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:20, padding:"2px 8px" }}>›</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:6 }}>
          {DAYS.map(d=><div key={d} style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.28)", fontWeight:700 }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
          {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const day    = i+1;
            const dis    = isDisabled(day);
            const active = pickedDate===day;
            const hasSel = selected.some(s=>s.date===fmtDate(day));
            return (
              <button key={day} disabled={dis}
                onClick={()=>setPickedDate(active?null:day)}
                style={{ aspectRatio:"1", borderRadius:8, border:`1.5px solid ${active?"#38bdf8":hasSel?"rgba(34,197,94,0.5)":"rgba(255,255,255,0.07)"}`, background:active?"rgba(56,189,248,0.15)":hasSel?"rgba(34,197,94,0.07)":"transparent", color:hasSel?"#22c55e":dayColor(day), fontSize:12, fontWeight:hasSel?700:400, cursor:dis?"not-allowed":"pointer", transition:"all .15s", position:"relative" }}>
                {day}
                {hasSel&&<span style={{ position:"absolute", top:1, right:2, fontSize:7, color:"#22c55e" }}>●</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Créneaux du jour sélectionné */}
      {pickedDate && !isDisabled(pickedDate) && (
        <div style={{ background:"rgba(56,189,248,0.05)", border:"1px solid rgba(56,189,248,0.15)", borderRadius:14, padding:"14px 16px", marginBottom:12 }}>
          <div style={{ fontSize:13, color:"#38bdf8", fontWeight:700, marginBottom:14 }}>
            📅 {String(pickedDate).padStart(2,"0")}/{String(currentMonth+1).padStart(2,"0")}/{currentYear}
          </div>
          {/* Matin */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:700, letterSpacing:1, marginBottom:8 }}>🌅 MATIN</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {MATIN.map(h=><SlotBtn key={h} date={fmtDate(pickedDate)} hour={h}/>)}
            </div>
          </div>
          {/* Après-midi */}
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:700, letterSpacing:1, marginBottom:8 }}>🌆 APRÈS-MIDI</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {APMIDI.map(h=><SlotBtn key={h} date={fmtDate(pickedDate)} hour={h}/>)}
            </div>
          </div>
        </div>
      )}

      {/* Récap créneaux */}
      {selected.length>0 && (
        <div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", fontWeight:700, letterSpacing:1, marginBottom:8 }}>CRÉNEAUX CHOISIS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {selected.map(s=>(
              <div key={s.key} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(34,197,94,0.07)", border:"1px solid rgba(34,197,94,0.22)", borderRadius:8, padding:"5px 10px" }}>
                <span style={{ fontSize:12, color:"#22c55e", fontWeight:600 }}>📅 {s.label}</span>
                <button onClick={()=>onChange(selected.filter(x=>x.key!==s.key))} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.28)", cursor:"pointer", fontSize:13 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GStyles() {
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}body{background:#07090f}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#252525;border-radius:99px}
    input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.17)}
    @keyframes slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
  `}</style>;
}
