import { useState, useEffect, useRef } from "react";
const LS = { get:(k)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch{return null}}, set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}, del:(k)=>{try{localStorage.removeItem(k)}catch{}} };

const SB_URL="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SB_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";
const sb={async signUp(e,p,m){const r=await fetch(SB_URL+"/auth/v1/signup",{method:"POST",headers:{"Content-Type":"application/json","apikey":SB_ANON},body:JSON.stringify({email:e,password:p,data:m})});return r.json()},async signIn(e,p){const r=await fetch(SB_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"Content-Type":"application/json","apikey":SB_ANON},body:JSON.stringify({email:e,password:p})});return r.json()},async getProfile(uid,t){const r=await fetch(SB_URL+"/rest/v1/profiles?id=eq."+uid+"&select=*",{headers:{"apikey":SB_ANON,"Authorization":"Bearer "+t}});const d=await r.json();return d[0]||null},async upsertProfile(p,t){await fetch(SB_URL+"/rest/v1/profiles",{method:"POST",headers:{"Content-Type":"application/json","apikey":SB_ANON,"Authorization":"Bearer "+t,"Prefer":"resolution=merge-duplicates"},body:JSON.stringify(p)})}};
const CAT_MAPPING = {
  plomberie: "Plomberie & Sanitaires",
  elec: "Electricite",
  renov: "Amenagement interieur",
  fen: "Menuiserie & Fenetres",
  chauf: "Energie & Chauffage",
  gros: "Gros Oeuvre & Structure",
  ext: "Exterieur & Paysage",
  serr: "Serrurerie & Securite",
  toit: "Toiture & Charpente",
  cuis: "Cuisine & Salle de bain",
  energ: "Energie & Chauffage",
  div: "Specialise",
};
const SPECIALITES_CATEGORIES = [
  { cat: "Gros Oeuvre & Structure", items: ["Maconnerie generale","Construction neuve","Renovation complete","Extension & Surelevation","Veranda","Demolition","Fondations & Terrassement"] },
  { cat: "Plomberie & Sanitaires", items: ["Plomberie generale","Salle de bain complete","Debouchage & Urgence","Traitement humidite","Piscine & Spa","Arrosage automatique"] },
  { cat: "Electricite", items: ["Electricite generale","Tableau electrique","Domotique & Alarme","Videosurveillance","Borne de recharge","Fibre & Reseau","Eclairage exterieur"] },
  { cat: "Energie & Chauffage", items: ["Chauffage central","Climatisation","Pompe a chaleur","Panneaux solaires","Isolation & Combles","VMC & Ventilation","Poele & Cheminee"] },
  { cat: "Menuiserie & Fenetres", items: ["Fenetres & Double vitrage","Portes interieures","Portes blindees","Portail & Cloture","Volets & Stores","Veranda & Pergola","Escaliers"] },
  { cat: "Amenagement interieur", items: ["Peinture & Enduit","Parquet & Sol","Faux plafond","Dressing & Rangement","Decoration interieure","Isolation interieure"] },
  { cat: "Toiture & Charpente", items: ["Toiture generale","Charpente","Zinguerie","Etancheite","Nettoyage toiture","Velux & Lucarne"] },
  { cat: "Exterieur & Paysage", items: ["Paysagisme","Jardinage & Entretien","Terrasse & Dallage","Gazon & Pelouse","Elagage & Abattage","Garage & Parking","Mur & Cloture"] },
  { cat: "Serrurerie & Securite", items: ["Serrurerie generale","Depannage urgence","Blindage porte","Coffre-fort"] },
  { cat: "Specialise", items: ["Adaptation PMR","Debarras & Nettoyage","Desamiantage","Traitement termites","Ramonage"] },
  { cat: "Cuisine & Salle de bain", items: ["Cuisine complete","Salle de bain complete","Douche / baignoire","Faience & carrelage","Robinetterie","Plan de travail"] },
];
const TRAVAUX_CATS=[{id:"plomberie",label:"Plomberie & Eau",img:"https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400",subs:["Fuite d eau","Robinet","WC bouche","Chauffe-eau","Salle de bain","Piscine"]},{id:"elec",label:"Electricite",img:"https://images.pexels.com/photos/5663011/pexels-photo-5663011.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Panne","Installation","Tableau","Borne recharge","Alarme","Domotique"]},{id:"renov",label:"Renovation",img:"https://images.pexels.com/photos/30482688/pexels-photo-30482688.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Peinture","Carrelage","Faux plafond","Cuisine","Dressing","Decoration"]},{id:"fen",label:"Fenetres & Portes",img:"https://images.pexels.com/photos/36406089/pexels-photo-36406089.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Fenetres","Porte entree","Porte garage","Volets","Veranda","Portail"]},{id:"chauf",label:"Chauffage",img:"https://images.pexels.com/photos/36864512/pexels-photo-36864512.png?auto=compress&cs=tinysrgb&w=400",subs:["Chauffage panne","Chaudiere","Climatisation","Pompe chaleur","Isolation","Solaire"]},{id:"gros",label:"Gros Oeuvre",img:"https://images.pexels.com/photos/9712971/pexels-photo-9712971.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Fissures","Extension","Demolition","Terrassement","Construction","Ravalement"]},{id:"ext",label:"Exterieur",img:"https://images.pexels.com/photos/16239801/pexels-photo-16239801.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Jardin","Terrasse","Elagage","Paysagisme","Allee","Cloture"]},{id:"serr",label:"Serrurerie",img:"https://images.pexels.com/photos/30958693/pexels-photo-30958693.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Porte bloquee","Serrure","Blindage","Urgence","Alarme","Camera"]},{id:"toit",label:"Toiture",img:"https://images.pexels.com/photos/37704246/pexels-photo-37704246.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Fuite","Tuiles","Nettoyage","Charpente","Gouttieres","Velux"]},{id:"cuis",label:"Cuisine & SDB",img:"https://images.pexels.com/photos/19984614/pexels-photo-19984614.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Cuisine","Salle de bain","Douche","Faience","Robinetterie","Plan travail"]},{id:"energ",label:"Energie",img:"https://images.pexels.com/photos/6876537/pexels-photo-6876537.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Solaire","Pompe chaleur","Isolation combles","Isolation murs","VMC","Cheminee"]},{id:"div",label:"Divers",img:"https://images.pexels.com/photos/30958693/pexels-photo-30958693.jpeg?auto=compress&cs=tinysrgb&w=400",subs:["Debarras","Nettoyage","Desamiantage","Ramonage","PMR","Nuisibles"]}];
const TRAVAUX_OPTS=['Maconnerie','Menuiserie','Electricite','Plomberie','Chauffage','Isolation','Peinture','Carrelage','Toiture','Amenagement'];
const TRAVAUX_ICONS=['','','','','','','','','',''];
const STEPS=[{id:"type",title:"En quoi pouvons-nous vous aider ?",sub:"Selectionnez votre besoin",type:"categories"},{id:"precision",title:"Precisez votre besoin",sub:"Choisissez la specialite",type:"specialites_cats"},{id:"surface",title:"Surface du chantier",sub:"Indiquez la superficie",type:"input",placeholder:"Ex: 45 m2"},{id:"budget",title:"Budget estime",sub:"Indiquez votre budget",type:"input",placeholder:"Ex: 8 000 EUR"},{id:"artisans",title:"Nombre d artisans",sub:"Combien souhaitez-vous rencontrer ?",type:"single",opts:[{icon:"3",label:"3 artisans"},{icon:"4",label:"4 artisans"},{icon:"5",label:"5 artisans"},{icon:"+",label:"+ de 5 artisans"}]},{id:"calendar",title:"Vos disponibilites",sub:"Min 3 creneaux",type:"calendar"},{id:"contact",title:"Vos coordonnees",sub:"Recevez vos devis gratuits sous 24h",type:"form"}];
const PACKS=[{id:'decouverte',name:'Decouverte',rdv:5,prix:249,par:'49 EUR/RDV',couleur:'#38bdf8',tagline:'Sans engagement',abonnement:false,stripeUrl:'https://buy.stripe.com/test_00w6oJ8diba42kW9pv7wA00',features:['5 RDV','Support email','Sans engagement']},{id:'pro',name:'Pro',rdv:15,prix:599,par:'39 EUR/RDV',couleur:'#FF6F00',tagline:'Populaire',best:true,abonnement:true,stripeUrl:'https://buy.stripe.com/test_3cI14p65aemgcZA6dj7wA01',features:['15 RDV/mois','Support prioritaire']},{id:'elite',name:'Elite',rdv:30,prix:999,par:'33 EUR/RDV',couleur:'#facc15',tagline:'Maximum',abonnement:true,stripeUrl:'https://buy.stripe.com/test_6oUfZj79eba41gSdFL7wA02',features:['30 RDV/mois','Account manager']}];
const DOCS_DEF=[{id:'kbis',label:'Kbis',icon:'',oblig:true,desc:'Moins 3 mois'},{id:'decen',label:'Decennale',icon:'',oblig:true,desc:'En cours'},{id:'rc',label:'RC Pro',icon:'',oblig:true,desc:'RC civile'},{id:'rib',label:'RIB',icon:'',oblig:true,desc:'Coordonnees bancaires'},{id:'rge',label:'RGE',icon:'',oblig:false,desc:'Recommande'}];
const DEMO_LEADS=[{id:1001,created_at:'2025-06-02',heure:'09:00',client_nom:'Martin Lefevre',client_tel:'06 12 34 56 78',client_email:'martin@email.com',adresse:'12 rue de la Paix Paris',travaux:'Plomberie',surface:'30-80 m2',budget:'5000-20000 EUR',statut:'en attente',note:'',user_id:null,assigned_to:null},{id:1002,created_at:'2025-06-03',heure:'14:30',client_nom:'Sophie Renaud',client_tel:'07 23 45 67 89',client_email:'sophie@email.com',adresse:'8 avenue Victor Hugo Lyon',travaux:'Electricite',surface:'80-150 m2',budget:'5000-20000 EUR',statut:'en attente',note:'',user_id:null,assigned_to:null}];
const RESEND_API_KEY='re_ifi5vKQp_LM6JP8eoGccKGZrKEtTFTEQx';


function getLeads() { return LS.get("cf_leads") || DEMO_LEADS; }
function saveLeads(l) { LS.set("cf_leads", l); }
function getUsers() { return LS.get("cf_users") || []; }
function saveUsers(u) { LS.set("cf_users", u); }

// 
//  ROOT APP
// 
export default function App() {
  const [page, setPage] = useState(()=>{const s=LS.get("cf_sess");const params=new URLSearchParams(window.location.search);const w=params.get("welcome");if(w&&s&&s.role==="pro")return "pack-welcome";if(!s)return "home";const r=(s.role||"").toLowerCase();if(r==="pro")return "pro-dashboard";if(r==="part")return "part-home";return "home";});
  const [sess, setSess]   = useState(() => LS.get("cf_sess"));
  useEffect(()=>{if(sess?.email&&sess?.pass){fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/auth/v1/token?grant_type=password",{method:"POST",headers:{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M"},body:JSON.stringify({email:sess.email,password:sess.pass})}).then(r=>r.json()).then(d=>{if(d.access_token){const u={...sess,token:d.access_token};setSess(u);LS.set("cf_sess",u);}}).catch(()=>{});}},[]);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState(() => getLeads());
  useEffect(()=>{if(sess&&sess.id){fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/rest/v1/leads?select=*&order=created_at.desc",{headers:{"apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M","Authorization":"Bearer "+(sess.token||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M")}}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setLeads(d);}).catch(()=>{});}},[sess&&sess.id]);

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

  //  AUTH 
  async function register(data) {
    setBusy(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      const newUser = { id: result.uid, email: data.email, pass: data.pass, prenom: result.prenom, nom: result.nom, role: result.role, tel: data.tel||"", entreprise: data.entreprise||"", siret: data.siret||"", specialites: data.specialites||[], docs: {}, pack: null, rdv_restants: 0, rdv_total: 0, token: result.token };
      const users = getUsers();
      saveUsers([...users, newUser]);
      saveSession(newUser);
      setPage(data.role === "pro" ? "pro-docs" : "part-home");
      notify("Bienvenue " + result.prenom + " !");
      if (data.role === "pro") {
        fetch("/api/send-email", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ type:"welcome_pro", to:data.email, data:{ prenom:result.prenom, email:data.email, entreprise:data.entreprise||"" } }) }).catch(console.log);
      }
    } catch(e) { notify(e.message, "err"); }
    setBusy(false);
  }

async function login(email, pass, role) {
setBusy(true);
try {
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const AK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";
const authRes=await fetch(SB+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"Content-Type":"application/json","apikey":AK},body:JSON.stringify({email,password:pass})});
const auth=await authRes.json();
if(auth.error)throw new Error("Email ou mot de passe incorrect");
const token=auth.access_token;
const uid=auth.user?.id;
const profileRes=await fetch(SB+"/rest/v1/profiles?id=eq."+uid+"&select=*",{headers:{"apikey":AK,"Authorization":"Bearer "+token}});
const profiles=await profileRes.json();
const profile=profiles[0];
if(!profile)throw new Error("Profil introuvable");
if(role!=="admin"&&profile.role!==role)throw new Error("Email ou mot de passe incorrect");
const u={...profile,id:uid,pass,token};
saveSession(u);
const users=getUsers();
if(!users.find(x=>x.id===uid))saveUsers([...users,u]);
else saveUsers(users.map(x=>x.id===uid?u:x));
setPage(u.role==="pro"?"pro-dashboard":"part-home");
notify("Bienvenue "+u.prenom+" !");
} catch(e){notify(e.message,"err");}
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

  //  LEADS 
  async function submitLead(formData) {
    setBusy(true);
    try {
      const newLead = {
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
        nb_artisans: formData.artisans || '3 artisans',
        creneaux: JSON.stringify(formData.slots || []),
        ville:        formData.ville || "",
        code_postal:  formData.code_postal || "",
      };
      fetch("/api/save-lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newLead)}).catch(console.log);
      // Email de confirmation au client
      if (newLead.client_email) {
        const slots = formData.slots || [];
        const travaux = Array.isArray(formData.type) ? formData.type.join(", ") : (formData.type||"travaux");
      }
      setBusy(false);
      return true;
    } catch(e) { notify("Erreur : "+e.message,"err"); setBusy(false); return false; }
  }

  //  PACK 
  function buyPack(pack) {
    window.open(pack.stripeUrl, "_blank");
  }

async function confirmerRdv(lead) {
setBusy(true);
try {
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";
const H={"Content-Type":"application/json","apikey":KEY,"Authorization":"Bearer "+KEY};
await fetch(SB+"/rest/v1/leads?id=eq."+lead.id,{method:"PATCH",headers:H,body:JSON.stringify({statut:"confirme"})});
if(lead.client_email){fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"confirm_rdv_client",to:lead.client_email,data:{client_prenom:(lead.client_nom||"").split(" ")[0],artisan_prenom:sess?.prenom||"",artisan_nom:sess?.nom||"",artisan_entreprise:sess?.entreprise||"",artisan_tel:sess?.tel||"",artisan_email:sess?.email||"",creneau:lead.heure||"Sur RDV"}})}).catch(console.log);}
updateLeads(prev=>prev.map(l=>l.id===lead.id?{...l,statut:"confirme"}:l));
notify("RDV confirme ! Le client a ete notifie.");
} catch(e){notify(e.message,"err");}
setBusy(false);
}

async function refuserRdv(lead) {
setBusy(true);
try {
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";
const H={"Content-Type":"application/json","apikey":KEY,"Authorization":"Bearer "+KEY};
await fetch(SB+"/rest/v1/leads?id=eq."+lead.id,{method:"PATCH",headers:H,body:JSON.stringify({statut:"refuse"})});
updateLeads(prev=>prev.map(l=>l.id===lead.id?{...l,statut:"refuse"}:l));
notify("RDV refuse.");
} catch(e){notify(e.message,"err");}
setBusy(false);
}

//  UPLOAD DOC 
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
      notify("\"" + (DOCS_DEF.find(d=>d.id===docId)?.label||"Document") + "\" déposé ");
    } catch(e) { notify("Erreur upload : "+e.message,"err"); }
    setBusy(false);
  }

  const docsOk      = DOCS_DEF.filter(d=>d.oblig).every(d=>sess?.docs?.[d.id]);
  const myLeadsPart = leads.filter(l => l.client_email === sess?.email || l.user_id === sess?.id);
  const myLeadsPro  = leads.filter(l => l.assigned_to === sess?.id);

  const ctx = { sess, page, setPage, busy, docsOk, login, register, logout, updateSession, submitLead, buyPack, uploadDoc, notify, myLeadsPart, myLeadsPro, confirmerRdv, refuserRdv };

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
      {page==="pack-welcome" && <PackWelcome ctx={ctx} />}
    </div>
  );
}
// 
//  HOME
// 
function HomePage({ ctx }) {
  const [hov, setHov] = useState(null);
  const cards = [
    { role:"part", emoji:"", title:"Espace Particulier",   sub:"Obtenez des devis gratuits pour vos travaux de rénovation", cta:"Déposer ma demande ", color:"#38bdf8",
      features:["Devis gratuit & sans engagement","Artisans certifiés RGE","Réponse sous 24h","Suivi de vos demandes"] },
    { role:"pro",  emoji:"", title:"Espace Professionnel", sub:"Recevez des RDV qualifiés et développez votre activité",    cta:"Accéder à mon espace ", color:"#FF6F00",
      features:["RDV qualifiés livrés clé en main","Docs & suivi centralisés","Packs 10 / 20 / 50 RDV","Dashboard complet"] },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
      <BgFx />
      <div style={{ zIndex:2, textAlign:"center", marginBottom:50, animation:"fadeUp .5s ease" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,111,0,0.08)", border:"1px solid rgba(255,111,0,0.2)", borderRadius:99, padding:"5px 16px", marginBottom:18, fontSize:11, color:"#FF6F00", fontWeight:700, letterSpacing:1 }}> PLATEFORME RÉNOVATION N1</div>
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
        {[" 4.9/5  2 400 avis"," Artisans RGE"," Devis gratuit"," Réponse 24h"," Données sécurisées"].map(b=>(
          <div key={b} style={{ fontSize:12, color:"rgba(255,255,255,0.28)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:99, padding:"5px 13px" }}>{b}</div>
        ))}
      </div>
    </div>
  );
}

// 
//  AUTH
// 
function AuthPage({ ctx, role, mode }) {
  const isPro=role==="pro", isAdmin=role==="admin", isLogin=mode==="login", color=isAdmin?"#a855f7":isPro?"#FF6F00":"#38bdf8";
  const [f,setF] = useState({prenom:"",nom:"",email:"",pass:"",tel:"",entreprise:"",siret:"",ville_intervention:"",rayon:""});
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
function submit() {
if (isLogin && !isAdmin) { ctx.login(f.email,f.pass,role); return; }
if (isAdmin && isLogin) { ctx.login(f.email,f.pass,"admin"); return; }
else {
if (!f.prenom||!f.nom||!f.email||!f.pass) { ctx.notify("Remplissez tous les champs *","err"); return; }
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { ctx.notify("Email invalide","err"); return; }
if (f.pass.length < 8) { ctx.notify("Mot de passe minimum 8 caracteres","err"); return; }
if (isPro) {
if (!f.entreprise||!f.siret||!f.tel) { ctx.notify("Entreprise SIRET et telephone requis","err"); return; }
if (!/^0[0-9]{9}$/.test(f.tel.replace(/\s/g,""))) { ctx.notify("Telephone invalide ex: 0612345678","err"); return; }
if (!/^[0-9]{14}$/.test(f.siret.replace(/\s/g,""))) { ctx.notify("SIRET invalide 14 chiffres requis","err"); return; }
if (!f.specialites||f.specialites.length===0) { ctx.notify("Selectionnez au moins une specialite","err"); return; }
}
ctx.register({...f,role,tel:(f.tel||"").replace(/\s/g,""),siret:(f.siret||"").replace(/\s/g,"")});
}
}
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative" }}>
      <BgFx />
      <div style={{ zIndex:2, width:"100%", maxWidth:isLogin?420:560, animation:"fadeUp .4s ease" }}>
        <button onClick={()=>ctx.setPage("home")} style={S.backBtn}> Retour</button>
        <div style={S.authCard}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <span style={{ fontSize:28 }}>{isAdmin?"":isPro?"":""}</span>
            <div>
              <div style={{ fontSize:21, fontWeight:900, color:"#fff", letterSpacing:"-0.4px" }}>{isAdmin?"Accès Admin":isLogin?"Connexion":"Créer un compte"}</div>
              <div style={{ fontSize:12, color, fontWeight:700, marginTop:2 }}>{isAdmin?"Espace Administrateur":isPro?"Espace Professionnel":"Espace Particulier"}</div>
            </div>
          </div>
          <div style={{ display:isLogin||isAdmin?"block":"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {!isLogin&&!isAdmin&&<><Inp label="Prénom *" v={f.prenom} set={set("prenom")}/><Inp label="Nom *" v={f.nom} set={set("nom")}/></>}
            <div style={{ gridColumn:"1/-1" }}><div><Inp label="Email *" v={f.email} set={set("email")} type="email" autoComplete="new-password"/>{f.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>Email invalide</div>}</div></div>
            {!isLogin&&!isAdmin&&<>
              <div><Inp label="Telephone *" v={f.tel} set={set("tel")} type="tel"/>{f.tel&&!/^0[0-9]{9}$/.test(f.tel.replace(/\s/g,""))&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>Ex: 0612345678</div>}</div>
              {isPro&&<><Inp label="Nom entreprise *" v={f.entreprise} set={set("entreprise")}/><div style={{ gridColumn:"1/-1" }}><div><Inp label="N SIRET *" v={f.siret} set={set("siret")}/>{f.siret&&!/^[0-9]{14}$/.test(f.siret.replace(/\s/g,""))&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>14 chiffres requis</div>}</div></div><Inp label="Ville d intervention *" v={f.ville_intervention||""} set={e=>setF(p=>({...p,ville_intervention:e.target.value}))}/>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={S.lbl}>Rayon d intervention *</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                  {["10 km","20 km","30 km","50 km","100 km","200 km"].map(r=>{
                    const active=f.rayon===r;
                    return <button key={r} type="button" onClick={()=>setF(p=>({...p,rayon:r}))} style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid "+(active?"#FF6F00":"rgba(255,255,255,0.08)"),background:active?"rgba(255,111,0,0.15)":"transparent",color:active?"#FF6F00":"rgba(255,255,255,0.4)",fontSize:12,cursor:"pointer",fontWeight:active?700:400}}>{r}</button>;
                  })}
                </div>
                {!f.rayon&&<div style={{fontSize:11,color:"rgba(255,165,0,0.7)",marginTop:4}}>Selectionnez votre rayon</div>}
              </div>
              <div style={{ gridColumn:"1/-1" }}><label style={S.lbl}>Vos specialites * ({(f.specialites||[]).length} choisie(s))</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:8,marginBottom:8}}>{TRAVAUX_CATS.map(cat=>{const sel=f.selectedCat===cat.id;return(<button key={cat.id} type="button" onClick={()=>setF(p=>({...p,selectedCat:sel?null:cat.id}))} style={{position:"relative",borderRadius:10,overflow:"hidden",aspectRatio:"1.5",border:"2px solid "+(sel?"#FF6F00":"transparent"),cursor:"pointer",padding:0,display:"block"}}><img src={cat.img} alt={cat.label} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/><div style={{position:"absolute",inset:0,background:sel?"rgba(255,111,0,0.5)":"rgba(0,0,0,0.4)"}}/><div style={{position:"absolute",bottom:0,left:0,right:0,padding:"4px",color:"#fff",fontSize:9,fontWeight:700,textAlign:"center"}}>{cat.label}</div></button>);})}</div>{f.selectedCat&&<div style={{marginBottom:8}}><div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:6}}>Choisissez vos specialites :</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{(SPECIALITES_CATEGORIES.find(s=>s.cat===CAT_MAPPING[f.selectedCat])?.items||[]).map(t=>{const active=(f.specialites||[]).includes(t);return <button key={t} type="button" onClick={()=>{const prev=f.specialites||[];setF(p=>({...p,specialites:active?prev.filter(x=>x!==t):[...prev,t]}));}} style={{padding:"5px 10px",borderRadius:6,border:"1px solid "+(active?"#FF6F00":"rgba(255,255,255,0.08)"),background:active?"rgba(255,111,0,0.15)":"transparent",color:active?"#FF6F00":"rgba(255,255,255,0.4)",fontSize:11,cursor:"pointer"}}>{t}</button>;})}</div></div>}</div></>}
            </>}
            <div style={{ gridColumn:"1/-1" }}><div><div><Inp label="Mot de passe *" v={f.pass} set={set("pass")} type="password" autoComplete="new-password"/>{f.pass&&f.pass.length<8&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>Minimum 8 caracteres</div>}</div>{f.pass&&f.pass.length<8&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>Minimum 8 caracteres</div>}</div></div>
          </div>
          <BigBtn style={{ marginTop:20, background:`linear-gradient(135deg,${color},${color}bb)`, boxShadow:`0 4px 24px ${color}44` }} onClick={submit}>
            {isLogin?"Se connecter ":"Créer mon compte "}
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

// 
//  PARTICULIER HOME
// 
function PartHome({ ctx }) {
const [tab,setTab] = useState("demandes");
const confirmed = ctx.myLeadsPart.filter(l=>l.statut==="confirme"||l.statut==="confirmed"||l.statut==="confirme");
return (
<Shell ctx={ctx} color="#38bdf8" title="Espace Particulier">
<div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:22 }}>
<StatCard icon="" label="Mes demandes" val={ctx.myLeadsPart.length} color="#38bdf8"/>
<StatCard icon="" label="RDV confirmes" val={confirmed.length} color="#22c55e"/>
</div>
<div style={{ display:"flex", gap:10, marginBottom:18 }}>
{[{id:"demandes",label:" Mes demandes"},{id:"rdv",label:" RDV confirmes"}].map(t=>(
<button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"9px 18px", borderRadius:10, border:"1.5px solid "+(tab===t.id?"#38bdf8":"rgba(255,255,255,0.08)"), background:tab===t.id?"rgba(56,189,248,0.12)":"transparent", color:tab===t.id?"#38bdf8":"rgba(255,255,255,0.4)", fontSize:13, fontWeight:tab===t.id?700:400, cursor:"pointer" }}>{t.label}</button>
))}
</div>
{tab==="demandes"&&<div style={S.card}>
<ST> Mes demandes de devis</ST>
{ctx.myLeadsPart.length===0
? <Empty icon="" title="Aucune demande" sub="Deposez votre premier projet pour recevoir des devis gratuits."/>
: ctx.myLeadsPart.map(l=>(
<div key={l.id} style={S.leadRow}>
<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
<div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>{l.travaux||""}</div>
<SBadge s={l.statut}/>
</div>
<div style={{ color:"rgba(255,255,255,0.36)", fontSize:12, marginTop:6, display:"flex", flexWrap:"wrap", gap:12 }}>
{l.budget&&<span> {l.budget}</span>}
{l.surface&&<span> {l.surface}</span>}
{l.ville&&<span> {l.ville}</span>}
</div>
{l.creneaux&&JSON.parse(l.creneaux||"[]").length>0&&(
<div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:6 }}>
{JSON.parse(l.creneaux||"[]").map(s=>(
<span key={s.key} style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"rgba(56,189,248,0.1)", color:"#38bdf8", border:"1px solid rgba(56,189,248,0.2)" }}>{s.label}</span>
))}
</div>
)}
<div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:4 }}>{new Date(l.created_at).toLocaleDateString("fr-FR")}</div>
</div>
))
}
</div>}
{tab==="rdv"&&<div style={S.card}>
<ST> Rendez-vous confirmes</ST>
{confirmed.length===0
? <Empty icon="" title="Aucun RDV confirme" sub="Vos RDV confirmes apparaitront ici avec les coordonnees de l artisan."/>
: confirmed.map(l=>(
<div key={l.id} style={{ ...S.leadRow, border:"1px solid rgba(34,197,94,0.2)" }}>
<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
<div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>{l.travaux||""}</div>
<SBadge s={l.statut}/>
</div>
{l.heure&&<div style={{ color:"#38bdf8", fontSize:12, marginTop:4 }}> {l.heure}</div>}
{l.assigned_to&&<ArtisanInfo id={l.assigned_to}/>}
</div>
))
}
</div>}
<BigBtn style={{ marginTop:16, background:"linear-gradient(135deg,#38bdf8,#0ea5e9)", boxShadow:"0 4px 20px #38bdf844" }} onClick={()=>ctx.setPage("part-lead")}>
+ Nouvelle demande de devis
</BigBtn>
</Shell>
);
}


function PackWelcome({ ctx }) {
  const s=ctx.sess;
  const [profile,setProfile]=useState(s);
  useEffect(()=>{if(s?.id){const AK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/rest/v1/profiles?id=eq."+s.id+"&select=*",{headers:{"apikey":AK,"Authorization":"Bearer "+(s.token||AK)}}).then(r=>r.json()).then(d=>{if(d&&d[0]){const u={...s,...d[0]};setProfile(u);ctx.updateSession(u);}}).catch(()=>{});}},[]);  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#07090f",padding:20}}>
      <BgFx/>
      <div style={{zIndex:2,textAlign:"center",maxWidth:480}}>
        <div style={{fontSize:72,marginBottom:16}}>🎉</div>
        <h1 style={{color:"#fff",fontSize:32,fontWeight:900,margin:"0 0 12px"}}>Tout est prêt !</h1>
        <p style={{color:"rgba(255,255,255,0.6)",fontSize:16,lineHeight:1.7,marginBottom:8}}>Bienvenue <strong style={{color:"#FF6F00"}}>{profile?.prenom}</strong> !</p>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:14,lineHeight:1.7,marginBottom:28}}>Votre pack est actif. Vous allez bientôt recevoir vos premiers RDV qualifiés directement dans votre espace.</p>
        <div style={{background:"rgba(255,111,0,0.08)",border:"1px solid rgba(255,111,0,0.2)",borderRadius:12,padding:"16px 20px",marginBottom:28}}>
          <div style={{color:"#FF6F00",fontSize:13,fontWeight:700,marginBottom:4}}>PACK ACTIF</div>
          <div style={{color:"#fff",fontSize:22,fontWeight:900}}>{profile?.pack}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginTop:4}}>{profile?.rdv_restants||0} RDV disponibles</div>
        </div>
        <BigBtn style={{background:"linear-gradient(135deg,#FF6F00,#FBC005)",boxShadow:"0 4px 24px rgba(255,111,0,0.4)"}} onClick={()=>{if(profile){LS.set("cf_sess",{...profile,pass:s?.pass,token:s?.token});}setTimeout(()=>{window.location.href="/"},300);}}>
          Accéder à mon Dashboard →
        </BigBtn>
      </div>
    </div>
  );
}

function PackTab({ s, ctx }) {
  const [sel,setSel]=useState(null);
  const history=(s?.packs_history||[]).slice().reverse();
  const hasMonthly=s?.pack&&(s.pack==="Pro"||s.pack==="Elite");
  return (
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{color:"#fff",fontWeight:800,fontSize:18}}>Mon Pack</div>
        <button onClick={()=>hasMonthly?window.open("https://buy.stripe.com/test_00w6oJ8diba42kW9pv7wA00","_blank"):ctx.setPage("pro-pricing")} style={{padding:"8px 16px",background:"rgba(255,111,0,0.12)",border:"1px solid rgba(255,111,0,0.3)",borderRadius:8,color:"#FF6F00",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Ajouter un pack</button>
      </div>
      {history.length===0&&<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:32,textAlign:"center",color:"rgba(255,255,255,0.3)"}}>Aucun pack actif. <span style={{color:"#FF6F00",cursor:"pointer"}} onClick={()=>ctx.setPage("pro-pricing")}>Choisir un pack</span></div>}
      {history.map((p,i)=>(
        <div key={i} onClick={()=>setSel(sel===i?null:i)} style={{background:"rgba(255,111,0,0.07)",border:"1px solid "+(sel===i?"#FF6F00":"rgba(255,111,0,0.2)"),borderRadius:14,padding:"16px 20px",marginBottom:10,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:"#FF6F00",fontWeight:800,fontSize:15}}>{p.name}</div>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:2}}>{p.rdv} RDV · {p.prix} EUR · {new Date(p.date_achat).toLocaleDateString("fr-FR")}</div>
            </div>
            <div style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:p.abonnement?"rgba(255,111,0,0.15)":"rgba(56,189,248,0.15)",color:p.abonnement?"#FF6F00":"#38bdf8"}}>{p.abonnement?"Mensuel":"Unique"}</div>
          </div>
          {sel===i&&<div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px"}}><div style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>RDV inclus</div><div style={{color:"#fff",fontWeight:700,fontSize:16}}>{p.rdv}</div></div>
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px"}}><div style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>Prix</div><div style={{color:"#fff",fontWeight:700,fontSize:16}}>{p.prix} EUR</div></div>
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px"}}><div style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>Date achat</div><div style={{color:"#fff",fontWeight:700,fontSize:13}}>{new Date(p.date_achat).toLocaleDateString("fr-FR")}</div></div>
              {p.date_renouvellement&&<div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px"}}><div style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>Renouvellement</div><div style={{color:"#FF6F00",fontWeight:700,fontSize:13}}>{new Date(p.date_renouvellement).toLocaleDateString("fr-FR")}</div></div>}
            </div>
            {p.specialites&&p.specialites.length>0&&<div style={{marginTop:8}}><div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginBottom:6}}>Specialites</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{p.specialites.map(sp=><span key={sp} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"rgba(255,111,0,0.1)",color:"#FF6F00",border:"1px solid rgba(255,111,0,0.2)"}}>{sp}</span>)}</div></div>}
          </div>}
        </div>
      ))}
      {hasMonthly&&<div style={{fontSize:12,color:"rgba(255,255,255,0.25)",textAlign:"center",marginTop:8}}>Pour changer de pack mensuel : <a href="mailto:contact@click-fix.fr" style={{color:"#FF6F00"}}>contact@click-fix.fr</a></div>}
    </>
  );
}

function CityInput({value,onChange,onSelect,label}){const [sugg,setSugg]=useState([]);const [show,setShow]=useState(false);function search(v){onChange(v);if(v.length<2){setSugg([]);return;}fetch("https://geo.api.gouv.fr/communes?nom="+encodeURIComponent(v)+"\&fields=nom,codesPostaux,centre\&limit=5\&boost=population").then(r=>r.json()).then(d=>{setSugg(d||[]);setShow(true);}).catch(()=>{});}function pick(c){const cp=c.codesPostaux?.[0]||"";const lat=c.centre?.coordinates?.[1]||null;const lon=c.centre?.coordinates?.[0]||null;onSelect({ville:c.nom,code_postal:cp,lat,lon});setSugg([]);setShow(false);}return(<div style={{position:"relative",gridColumn:"1/-1"}}><label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.38)",marginBottom:5,fontWeight:600}}>{label}</label><input value={value} onChange={e=>search(e.target.value)} onBlur={()=>setTimeout(()=>setShow(false),200)} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"14px 16px",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box"}} placeholder="Ex: Paris, Lyon, Marseille..."/>{show&&sugg.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,zIndex:999,marginTop:4}}>{sugg.map((c,i)=><div key={i} onClick={()=>pick(c)} style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"#fff",fontSize:14}} onMouseDown={e=>e.preventDefault()}>{c.nom} <span style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>({c.codesPostaux?.[0]})</span></div>)}</div>}</div>);}
function AddressInput({form,setForm,onValidate}){const [sugg,setSugg]=useState([]);const [show,setShow]=useState(false);function search(v){setForm(f=>({...f,adresse:v}));if(onValidate)onValidate(false);if(onValidate)onValidate(false);if(v.length<3){setSugg([]);return;}fetch("https://api-adresse.data.gouv.fr/search/?q="+encodeURIComponent(v)+"\&limit=5\&type=housenumber").then(r=>r.json()).then(d=>{setSugg(d?.features||[]);setShow(true);}).catch(()=>{});}function pick(f){const p=f.properties;setForm(prev=>({...prev,adresse:p.name||p.label,ville:p.city||"",code_postal:p.postcode||"",lat:f.geometry?.coordinates?.[1]||null,lon:f.geometry?.coordinates?.[0]||null}));setSugg([]);setShow(false);if(onValidate)onValidate(true);}return(<div style={{gridColumn:"1/-1",position:"relative"}}><label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.38)",marginBottom:5,fontWeight:600}}>Adresse du chantier *</label><input value={form.adresse} onChange={e=>search(e.target.value)} onBlur={()=>setTimeout(()=>setShow(false),200)} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"14px 16px",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box"}} placeholder="Ex: 12 rue de la Paix, Paris..."/>{show&&sugg.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,zIndex:999,marginTop:4}}>{sugg.map((f,i)=><div key={i} onClick={()=>pick(f)} style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"#fff",fontSize:13}} onMouseDown={e=>e.preventDefault()}>{f.properties.label}</div>)}</div>}{form.ville&&<div style={{marginTop:6,fontSize:12,color:"rgba(255,255,255,0.4)"}}>{form.ville} {form.code_postal}</div>}</div>);}
function ArtisanInfo({ id }) {
const [pro,setPro] = useState(null);
useEffect(()=>{
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";
fetch(SB+"/rest/v1/profiles?id=eq."+id+"&select=prenom,nom,entreprise,tel,email",{headers:{"apikey":KEY,"Authorization":"Bearer "+KEY}})
.then(r=>r.json()).then(d=>d&&d[0]&&setPro(d[0])).catch(()=>{});
},[id]);
if(!pro) return null;
return (
<div style={{ marginTop:10, background:"rgba(34,197,94,0.07)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:8, padding:"10px 12px" }}>
<div style={{ color:"#22c55e", fontSize:11, fontWeight:700, marginBottom:6 }}>VOTRE ARTISAN</div>
<div style={{ color:"#fff", fontSize:13, fontWeight:700 }}>{pro.prenom} {pro.nom}</div>
<div style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>{pro.entreprise}</div>
<div style={{ display:"flex", gap:12, marginTop:6 }}>
{pro.tel&&<a href={"tel:"+pro.tel} style={{ color:"#38bdf8", fontSize:12, textDecoration:"none" }}> {pro.tel}</a>}
{pro.email&&<a href={"mailto:"+pro.email} style={{ color:"#38bdf8", fontSize:12, textDecoration:"none" }}> {pro.email}</a>}
</div>
</div>
);
}


// 
//  LEAD FORM
// 
function LeadForm({ ctx }) {
  const [step,setStep]   = useState(0);
  const [ans,setAns]     = useState({});
const [form,setForm]= useState({ nom:ctx.sess?.nom||"", prenom:ctx.sess?.prenom||"", email:ctx.sess?.email||"", tel:ctx.sess?.tel||"", adresse:"", ville:"", code_postal:"", message:"" });
  const [adresseOk,setAdresseOk]=useState(false);
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
      return form.nom.trim() && form.prenom.trim() && emailValid && telValid && form.adresse.trim()&&adresseOk && form.ville.trim() && form.code_postal.trim();
    }
    if (cur.type==="calendar") return (ans.slots||[]).length >= 3;
    if (cur.type==="categories") return !!ans.categorie;
    if (cur.type==="specialites_cats") return !!(ans.type&&Array.isArray(ans.type)&&ans.type.length>0);
    if (cur.type==="subcategories") return !!ans.precision;
    if (cur.type==="input") return !!(ans[cur.id]||"").trim();
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
if (!form.ville.trim()) errors.push("Ville manquante");
if (!form.code_postal.trim()) errors.push("Code postal manquant");
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
      ctx.notify("Votre demande est incomplète  vérifiez tous les champs", "err");
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
        <div style={{ fontSize:60, marginBottom:14 }}></div>
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
        <BigBtn style={{ background:"linear-gradient(135deg,#38bdf8,#0ea5e9)" }} onClick={()=>ctx.setPage("part-home")}>Voir mes demandes </BigBtn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 16px", position:"relative" }}>
      <BgFx/>
      <div style={{ zIndex:2, width:"100%", maxWidth:560 }}>
        <button onClick={()=>step===0?ctx.setPage("part-home"):setStep(step-1)} style={S.backBtn}> {step===0?"Retour":"Précédent"}</button>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.07)", borderRadius:99 }}>
            <div style={{ width:`${(step/(STEPS.length-1))*100}%`, height:"100%", background:"linear-gradient(90deg,#38bdf8,#0ea5e9)", borderRadius:99, transition:"width .4s" }}/>
          </div>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.24)", whiteSpace:"nowrap" }}>{step+1}/{STEPS.length}</span>
        </div>
        <div style={S.card}>
          <h2 style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.5px", marginBottom:6 }}>{cur.title}</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.36)", marginBottom:22 }}>{cur.sub}</p>
          {cur.type==="specialites_cats" && (
            <div style={{maxHeight:400,overflowY:"auto",paddingRight:4}}>
              {SPECIALITES_CATEGORIES.filter(cat=>!ans?.catId||cat.cat===CAT_MAPPING[ans.catId]).map(cat=>(
                <div key={cat.cat} style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:700,letterSpacing:1,marginBottom:6}}>{cat.cat}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {cat.items.map(item=>{
                      const active=(ans.type||[]).includes(item);
                      return <button key={item} type="button" onClick={()=>{
                        const prev=ans.type||[];
                        const next=active?prev.filter(x=>x!==item):[...prev,item];
                        setAns({...ans,type:next});
                      }} style={{padding:"6px 12px",borderRadius:8,border:"1.5px solid "+(active?"#FF6F00":"rgba(255,255,255,0.08)"),background:active?"rgba(255,111,0,0.15)":"rgba(255,255,255,0.02)",color:active?"#FF6F00":"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",fontWeight:active?700:400}}>
                        {item}
                      </button>;
                    })}
                  </div>
                </div>
              ))}
              {(ans.type||[]).length>0&&<div style={{fontSize:12,color:"#22c55e",marginTop:8}}>{(ans.type||[]).length} specialite(s) choisie(s)</div>}
            </div>
          )}
          {cur.type==="categories" && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:22}}>
              {TRAVAUX_CATS.map(cat=>{const active=ans.categorie===cat.label;return(<button key={cat.id} onClick={()=>setAns({...ans,categorie:cat.label,catId:cat.id,type:[],precision:null})} style={{position:"relative",borderRadius:12,overflow:"hidden",aspectRatio:"1",border:"2.5px solid "+(active?"#FF6F00":"transparent"),cursor:"pointer",padding:0}}>
                <img src={cat.img} alt={cat.label} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",inset:0,background:active?"rgba(255,111,0,0.55)":"rgba(0,0,0,0.45)"}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"6px 4px",color:"#fff",fontSize:10,fontWeight:700,textAlign:"center"}}>{cat.label}</div>
                {active&&<div style={{position:"absolute",top:4,right:4,width:18,height:18,background:"#FF6F00",borderRadius:"50%",fontSize:10,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>+</div>}
              </button>);})}
            </div>
          )}
          {cur.type==="subcategories" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>
              {(TRAVAUX_CATS.find(c=>c.label===ans.categorie)?.subs||[]).map(sub=>{const active=ans.precision===sub;return(<button key={sub} onClick={()=>setAns({...ans,precision:sub})} style={{background:active?"rgba(255,111,0,0.15)":"rgba(255,255,255,0.03)",border:"1.5px solid "+(active?"#FF6F00":"rgba(255,255,255,0.08)"),borderRadius:12,padding:"14px 12px",cursor:"pointer",textAlign:"left",color:active?"#FF6F00":"rgba(255,255,255,0.7)",fontSize:13,fontWeight:active?700:400}}>{sub}</button>);})}
            </div>
          )}
          {cur.type==="input" && (
            <div style={{marginBottom:22}}><input type="number" min="0" placeholder={cur.placeholder||""} value={ans[cur.id]||""} onChange={e=>setAns({...ans,[cur.id]:e.target.value})} style={{background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"16px 18px",color:"#fff",fontSize:18,width:"100%",outline:"none"}}/></div>
          )}
          {cur.type==="calendar" && (
            <CalendarPicker selected={ans.slots||[]} onChange={slots=>setAns({...ans,slots})} />
          )}
        {(cur.type==="multi" || cur.type==="single") && cur.type !== "input" && cur.type !== "categories" && cur.type !== "subcategories" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
              {cur.opts.map(opt=>{
                const active=cur.type==="multi"?(ans[cur.id]||[]).includes(opt.label):ans[cur.id]===opt.label;
                return (
                  <button key={opt.label} onClick={()=>sel(opt.label)} style={{ background:active?"rgba(56,189,248,0.1)":"rgba(255,255,255,0.03)", border:`1.5px solid ${active?"#38bdf8":"rgba(255,255,255,0.08)"}`, borderRadius:12, padding:"14px 12px", cursor:"pointer", textAlign:"left", position:"relative", transition:"all .15s" }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{opt.icon}</div>
                    <div style={{ fontSize:13, color:"#fff", fontWeight:600, lineHeight:1.3 }}>{opt.label}</div>
                    {active&&<span style={{ position:"absolute", top:8, right:8, width:18, height:18, background:"#38bdf8", borderRadius:"50%", fontSize:10, color:"#fff", fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}></span>}
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
              <AddressInput form={form} setForm={setForm} onValidate={setAdresseOk}/>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={S.lbl}>Message (optionnel)</label>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Décrivez votre projet..." style={{ ...S.inp, height:72, resize:"vertical" }}/>
              </div>
            </div>
          )}
          <BigBtn style={{ background:"linear-gradient(135deg,#38bdf8,#0ea5e9)", boxShadow:"0 4px 20px #38bdf844", opacity:canNext()?1:.4 }} disabled={!canNext()||sending} onClick={next}>
            {sending?"Envoi en cours...":step===STEPS.length-1?" Envoyer ma demande":"Continuer "}
          </BigBtn>
        </div>
      </div>
    </div>
  );
}

// 
//  PRO DOCS
// 
function ProDocs({ ctx }) {
  return (
    <Shell ctx={ctx} color="#FF6F00" title="Documents requis">
      <p style={{ color:"rgba(255,255,255,0.36)", fontSize:13, lineHeight:1.75, marginBottom:24 }}>
        Déposez vos justificatifs pour activer votre compte partenaire. Fichiers stockés de façon sécurisée. 
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>
        {DOCS_DEF.map(d=><DocRow key={d.id} doc={d} status={ctx.sess?.docs?.[d.id]} onUpload={ctx.uploadDoc}/>)}
      </div>
      <BigBtn style={{ opacity:ctx.docsOk?1:.4 }} disabled={!ctx.docsOk} onClick={()=>ctx.setPage("pro-pricing")}>
        {ctx.docsOk?"Choisir mon pack ":" Documents obligatoires manquants"}
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
        ? <span style={{ color:"#22c55e", fontWeight:700, fontSize:13, whiteSpace:"nowrap" }}> Déposé</span>
        : <><input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e=>e.target.files[0]&&onUpload(doc.id,e.target.files[0])}/><button style={S.smBtn} onClick={()=>ref.current?.click()}> Déposer</button></>
      }
    </div>
  );
}

// 
//  PRO PRICING
// 
function ProPricing({ ctx }) {
  const [hov,setHov]=useState(null);
  const s=ctx.sess;
  const hasMonthly=s?.pack&&(s.pack==="Pro"||s.pack==="Elite"||s.pack==="pro"||s.pack==="elite");
  return (
    <Shell ctx={ctx} color="#FF6F00" title="Choisissez votre pack" maxW={940}>
      <p style={{ color:"rgba(255,255,255,0.36)", fontSize:13, textAlign:"center", marginBottom:34, lineHeight:1.7 }}>
        RDV qualifiés livrés dans votre espace sous 48h. Sans abonnement, sans engagement.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, marginBottom:28 }}>
        {PACKS.map(p=>(
          <div key={p.id} onMouseEnter={()=>setHov(p.id)} onMouseLeave={()=>setHov(null)}
            style={{ position:"relative", background:hov===p.id?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)", border:`1.5px solid ${hov===p.id||p.best?p.couleur:"rgba(255,255,255,0.08)"}`, borderRadius:22, padding:"28px 22px", display:"flex", flexDirection:"column", transition:"all .22s", transform:hov===p.id?"translateY(-5px)":"none", boxShadow:hov===p.id?`0 24px 60px ${p.couleur}25`:"none" }}>
            {p.best&&<div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(135deg,${p.couleur},${p.couleur}bb)`, color:"#fff", fontSize:11, fontWeight:800, padding:"4px 14px", borderRadius:99, letterSpacing:.5, whiteSpace:"nowrap", boxShadow:`0 4px 16px ${p.couleur}55` }}> Plus populaire</div>}
            <div style={{ color:p.couleur, fontWeight:800, fontSize:12, letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>{p.name}</div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12, marginBottom:18 }}>{p.tagline}</div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:2 }}>
              <span style={{ fontSize:44, fontWeight:900, color:"#fff", lineHeight:1 }}>{p.prix.toLocaleString("fr-FR")}</span>
              <span style={{ color:"rgba(255,255,255,0.35)", marginBottom:7, fontSize:16 }}>€</span>
            </div>
            <div style={{ color:p.couleur, fontSize:12, fontWeight:700, marginBottom:8 }}>{p.par}</div>
            <div style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, display:"inline-block", marginBottom:16, background:p.abonnement?"rgba(255,111,0,0.1)":"rgba(56,189,248,0.1)", color:p.abonnement?"#FF6F00":"#38bdf8", border:`1px solid ${p.abonnement?"rgba(255,111,0,0.3)":"rgba(56,189,248,0.3)"}` }}>{p.abonnement?" Abonnement mensuel":" Paiement unique"}</div>
            <div style={{ background:`${p.couleur}18`, border:`1px solid ${p.couleur}33`, borderRadius:12, padding:"10px", textAlign:"center", marginBottom:22 }}>
              <span style={{ fontSize:34, fontWeight:900, color:p.couleur }}>{p.rdv}</span>
              <span style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}> rendez-vous</span>
            </div>
            {p.features.map(f=>(
              <div key={f} style={{ display:"flex", gap:8, marginBottom:8, fontSize:13, color:"rgba(255,255,255,0.5)" }}>
                <span style={{ color:p.couleur, flexShrink:0 }}></span>{f}
              </div>
            ))}
            {hasMonthly&&p.id!=="decouverte" ? <button disabled style={{ marginTop:"auto",paddingTop:14,width:"100%",padding:"13px 0",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"rgba(255,255,255,0.3)",fontWeight:800,fontSize:14,cursor:"not-allowed",fontFamily:"Outfit,sans-serif" }}>Pack actif</button> : <button onClick={()=>ctx.buyPack(p)} style={{ marginTop:"auto",paddingTop:14,width:"100%",padding:"13px 0",background:`linear-gradient(135deg,${p.couleur},${p.couleur}bb)`,border:"none",borderRadius:12,color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"Outfit,sans-serif",boxShadow:`0 4px 24px ${p.couleur}44`,letterSpacing:.3 }}>{p.id==="decouverte"&&hasMonthly?"+ Ajouter 5 RDV":"Choisir ce pack"}</button>}
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}> Paiement sécurisé   Satisfait ou remboursé 7 jours   Support dédié</div>
    </Shell>
  );
}

// 
//  PRO DASHBOARD
// 
function ProDashboard({ ctx }) {
  const [tab,setTab]=useState("rdv");
  const s=ctx.sess, rdv=ctx.myLeadsPro, conf=rdv.filter(l=>l.statut==="confirmé").length;
  const TABS=[{id:"rdv",ico:"",label:"Mes RDV"},{id:"docs",ico:"",label:"Documents"},{id:"pack",ico:"",label:"Mon Pack"},{id:"profil",ico:"",label:"Profil"}];

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <div style={{ width:232, background:"rgba(255,255,255,0.025)", borderRight:"1px solid rgba(255,255,255,0.055)", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"24px 18px 16px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:20 }}></span>
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
          <button onClick={ctx.logout} style={{ width:"100%", padding:"9px", background:"transparent", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, color:"rgba(255,255,255,0.22)", fontFamily:"'Outfit',sans-serif", fontSize:12, cursor:"pointer" }}> Déconnexion</button>
        </div>
      </div>

      <div style={{ flex:1, overflow:"auto", background:"#07090f" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 28px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.015)" }}>
          <div>
            <div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>Bonjour {s?.prenom} </div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {!ctx.docsOk&&<button style={S.smBtn} onClick={()=>setTab("docs")}> Documents</button>}
            {!s?.pack&&<button style={S.smBtn} onClick={()=>ctx.setPage("pro-pricing")}> Acheter un pack</button>}
          </div>
        </div>

        <div style={{ padding:"24px 28px" }}>
          {tab==="rdv"&&<>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
              <StatCard icon="" label="RDV ce mois"  val={rdv.length}         color="#FF6F00"/>
              <StatCard icon="" label="Confirmés"     val={conf}               color="#22c55e"/>
              <StatCard icon="" label="En attente"    val={rdv.length-conf}    color="#FBC005"/>
              <StatCard icon="" label="RDV restants"  val={s?.rdv_restants||0} color="#38bdf8"/>
            </div>
            <ST> Rendez-vous qualifiés</ST>
            {rdv.length===0
              ? <Empty icon="" title="Aucun RDV pour l'instant" sub="Activez un pack pour recevoir vos premiers RDV qualifiés sous 48h." cta="Voir les packs" onCta={()=>ctx.setPage("pro-pricing")}/>
              : rdv.map(l=>(
                <div key={l.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"16px 18px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7, flexWrap:"wrap" }}>
                        <span style={{ color:"#fff", fontWeight:800, fontSize:16 }}>{l.client_nom}</span>
                        <SBadge s={l.statut}/>
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:14, fontSize:12, color:"rgba(255,255,255,0.4)" }}>
                        {l.created_at&&<span> {new Date(l.created_at).toLocaleDateString("fr-FR")}</span>}
                        {l.adresse&&<span> {l.adresse}</span>}
                        {l.travaux&&<span> {l.travaux}</span>}
                        {l.budget&&<span> {l.budget}</span>}
                      </div>
                      {l.note&&<div style={{ marginTop:6, fontSize:12, color:"rgba(255,165,0,.65)", fontStyle:"italic" }}> {l.note}</div>}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      {l.client_tel&&<a href={`tel:${l.client_tel}`} style={{ ...S.smBtn, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5 }}> {l.client_tel}</a>}
                      {l.client_email&&<a href={`mailto:${l.client_email}`} style={{ ...S.smBtn, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, borderColor:"rgba(56,189,248,0.3)", color:"#38bdf8", background:"rgba(56,189,248,0.07)" }}> Email</a>}
                      {(l.statut==="dispatche"||l.statut==="en attente")&&<button onClick={()=>ctx.confirmerRdv(l)} style={{ ...S.smBtn, borderColor:"rgba(34,197,94,0.4)", color:"#22c55e", background:"rgba(34,197,94,0.08)", cursor:"pointer" }}> Confirmer</button>}
                      {(l.statut==="dispatche"||l.statut==="en attente")&&<button onClick={()=>ctx.refuserRdv(l)} style={{ ...S.smBtn, borderColor:"rgba(239,68,68,0.3)", color:"#ef4444", background:"rgba(239,68,68,0.07)", cursor:"pointer" }}> Refuser</button>}
                    </div>
                  </div>
                </div>
              ))
            }
          </>}

          {tab==="docs"&&<>
            <ST> Mes Documents</ST>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {DOCS_DEF.map(d=><DocRow key={d.id} doc={d} status={ctx.sess?.docs?.[d.id]} onUpload={ctx.uploadDoc}/>)}
            </div>
          </>}

          {tab==="pack"&&<PackTab s={s} ctx={ctx}/>}
          {tab==="profil"&&<>
            <ST> Mon Profil</ST>
            <div style={{ ...S.card, maxWidth:520 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[["Prénom",s?.prenom],["Nom",s?.nom],["Email",s?.email],["Téléphone",s?.tel||""],["Entreprise",s?.entreprise||""],["SIRET",s?.siret||""]].map(([l,v])=>(
                  <Inp key={l} label={l} v={v||""} set={()=>{}}/>
                ))}
              </div>
              <BigBtn style={{ marginTop:18 }} onClick={()=>ctx.notify("Profil mis à jour ")}>Enregistrer</BigBtn>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

// 
//  SHARED UI
// 
function Shell({ ctx, color, title, maxW=660, children }) {
  return (
    <div style={{ minHeight:"100vh", position:"relative", padding:"24px 20px" }}>
      <BgFx/>
      <div style={{ zIndex:2, maxWidth:maxW, margin:"0 auto", position:"relative" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:26 }}>
          <div>
            <button onClick={()=>ctx.setPage("home")} style={S.backBtn}> Accueil</button>
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
  return <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:99, background:ok?"rgba(34,197,94,0.1)":"rgba(251,192,5,0.1)", color:ok?"#22c55e":"#FBC005", border:`1px solid ${ok?"rgba(34,197,94,0.4)":"rgba(251,192,5,0.4)"}` }}>{ok?" Confirmé":" En attente"}</span>;
}

function ST({ children }) { return <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>{children}</div>; }

function Empty({ icon, title, sub, cta, onCta }) {
  return (
    <div style={{ textAlign:"center", padding:"50px 20px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:16, marginBottom:16 }}>
      <div style={{ fontSize:44, marginBottom:12 }}>{icon}</div>
      <div style={{ color:"#fff", fontWeight:800, fontSize:18, marginBottom:6 }}>{title}</div>
      <div style={{ color:"rgba(255,255,255,0.32)", fontSize:13, marginBottom:cta?20:0 }}>{sub}</div>
      {cta&&<button style={{ ...S.smBtn, fontSize:13, padding:"9px 20px" }} onClick={onCta}>{cta} </button>}
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
    if (exists) {
      onChange(selected.filter(s => s.key !== key));
    } else {
      onChange([...selected, { key, date, hour, label: date + " a " + hour }]);
    }
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
        {hour}{s?" ":""}
      </button>
    );
  };

  return (
    <div style={{ marginBottom:20 }}>
      {/* Status bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:13 }}>
          {selected.length < 3
            ? <span style={{ color:"#FBC005" }}> Encore {3-selected.length} créneau{3-selected.length>1?"x":""} requis</span>
            : <span style={{ color:"#22c55e" }}> {selected.length} créneaux sélectionnés</span>
          }
        </div>
        {selected.length>0 && <button onClick={()=>onChange([])} style={{ fontSize:11, color:"rgba(255,255,255,0.25)", background:"none", border:"none", cursor:"pointer" }}>Tout effacer</button>}
      </div>

      {/* Légende */}
      <div style={{ display:"flex", gap:14, marginBottom:12, fontSize:11, color:"rgba(255,255,255,0.35)" }}>
        <span> Semaine disponible</span>
        <span style={{ color:"#FBC005" }}> Samedi disponible</span>
        <span> Indisponible</span>
      </div>

      {/* Calendrier */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"16px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <button onClick={prevMonth} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:20, padding:"2px 8px" }}></button>
          <span style={{ color:"#fff", fontWeight:700, fontSize:15 }}>{MONTHS[currentMonth]} {currentYear}</span>
          <button onClick={nextMonth} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:20, padding:"2px 8px" }}></button>
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
                {hasSel&&<span style={{ position:"absolute", top:1, right:2, fontSize:7, color:"#22c55e" }}></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Créneaux du jour sélectionné */}
      {pickedDate && !isDisabled(pickedDate) && (
        <div style={{ background:"rgba(56,189,248,0.05)", border:"1px solid rgba(56,189,248,0.15)", borderRadius:14, padding:"14px 16px", marginBottom:12 }}>
          <div style={{ fontSize:13, color:"#38bdf8", fontWeight:700, marginBottom:14 }}>
             {String(pickedDate).padStart(2,"0")}/{String(currentMonth+1).padStart(2,"0")}/{currentYear}
          </div>
          {/* Matin */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:700, letterSpacing:1, marginBottom:8 }}> MATIN</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {MATIN.map(h=><SlotBtn key={h} date={fmtDate(pickedDate)} hour={h}/>)}
            </div>
          </div>
          {/* Après-midi */}
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:700, letterSpacing:1, marginBottom:8 }}> APRÈS-MIDI</div>
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
                <span style={{ fontSize:12, color:"#22c55e", fontWeight:600 }}> {s.label}</span>
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
const STEPS = [
  { id:"type", title:"En quoi pouvons-nous vous aider ?", sub:"Selectionnez votre besoin", type:"categories" },
  { id:"precision", title:"Precisez votre besoin", sub:"Choisissez parmi les options", type:"subcategories" },
  { id:"surface", title:"Surface du chantier", sub:"Indiquez la superficie", type:"input", placeholder:"Ex: 45 m2" },
  { id:"budget", title:"Budget estime", sub:"Indiquez votre budget", type:"input", placeholder:"Ex: 8 000 EUR" },
  { id:"artisans", title:"Nombre d artisans", sub:"Combien souhaitez-vous rencontrer ?", type:"single", opts:[{icon:"3",label:"3 artisans"},{icon:"4",label:"4 artisans"},{icon:"5",label:"5 artisans"},{icon:"+",label:"+ de 5 artisans"}] },
  { id:"calendar", title:"Vos disponibilites", sub:"Selectionnez au minimum 3 creneaux", type:"calendar" },
  { id:"contact", title:"Vos coordonnees", sub:"Recevez vos devis gratuits sous 24h", type:"form" },
];
}

