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
  const [sess, setSess]   = useState(() => LS.get("cf_sess")||JSON.parse(sessionStorage.getItem("cf_sess_bak")||"null"));
  useEffect(()=>{if(sess?.email&&sess?.pass){fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/auth/v1/token?grant_type=password",{method:"POST",headers:{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M"},body:JSON.stringify({email:sess.email,password:sess.pass})}).then(r=>r.json()).then(d=>{if(d.access_token){const u={...sess,token:d.access_token};setSess(u);LS.set("cf_sess",u);}}).catch(()=>{});}},[]);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState(() => getLeads());
  useEffect(()=>{if(sess&&sess.id){fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/rest/v1/leads?select=*&order=created_at.desc",{headers:{"apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M","Authorization":"Bearer "+(sess.token||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M")}}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setLeads(d);}).catch(()=>{});}},[sess&&sess.id]);
  useEffect(()=>{if(!sess?.id)return;const iv=setInterval(()=>{fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/rest/v1/leads?select=*&order=created_at.desc",{headers:{"apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M","Authorization":"Bearer "+(sess.token||"")}}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setLeads(d);}).catch(()=>{});},10000);return()=>clearInterval(iv);},[sess?.id]);
  useEffect(()=>{if(!sess?.id)return;const iv=setInterval(()=>{fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/rest/v1/leads?select=*&order=created_at.desc",{headers:{"apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NjU1OTEwfQ.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M","Authorization":"Bearer "+(sess.token||"")}}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setLeads(d);}).catch(()=>{});},10000);return()=>clearInterval(iv);},[sess?.id]);

  function notify(msg, type="ok") {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3800);
  }

  function saveSession(s) {
    setSess(s);
    if (s) {LS.set("cf_sess", s);sessionStorage.setItem("cf_sess_bak",JSON.stringify(s));const after=sessionStorage.getItem("after_login");if(after&&s.role==="part"){sessionStorage.removeItem("after_login");setTimeout(()=>setPage(after),200);}}
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
        nb_artisans: formData.nb_artisans||formData.artisans||"3",
        precision: formData.precision||"",
        details: formData.details||"",
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
      const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
      const KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";
      await fetch(SB+"/rest/v1/profiles?id=eq."+sess.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":KEY,"Authorization":"Bearer "+(sess.token||KEY)},body:JSON.stringify({docs:newDocs})});
      notify("Document depose avec succes !");ctx.updateSession({...sess,docs:newDocs});
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
      {page==="part-lead" && <LeadForm ctx={ctx} />}
      {page==="ai-lead" && <AILeadForm ctx={ctx} />}
      {page==="urgence" && <UrgencePage ctx={ctx} />}      {page==="pro-docs"      && <ProDocs      ctx={ctx} />}
      {page==="pro-pricing"   && <ProPricing   ctx={ctx} />}
      {page==="pro-dashboard" && <ProDashboard ctx={ctx} />}
      {page==="pack-welcome" && <PackWelcome ctx={ctx} />}
    </div>
  );
}
// 
//  HOME
// 
function FaqItem({q,a}){const [open,setOpen]=useState(false);return(<div style={{borderBottom:"0.5px solid rgba(0,0,0,0.1)",padding:"20px 0"}}><button onClick={()=>setOpen(!open)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"Inter,sans-serif"}}><span style={{fontWeight:600,fontSize:16,color:"#1d1d1f",letterSpacing:"-0.3px"}}>{q}</span><span style={{fontSize:20,color:"#6e6e73",flexShrink:0,marginLeft:16,transform:open?"rotate(45deg)":"rotate(0)",transition:"transform .3s"}}>+</span></button>{open&&<p style={{fontSize:14,color:"#6e6e73",lineHeight:1.7,marginTop:12,marginBottom:0,fontWeight:400}}>{a}</p>}</div>);}function HomePage({ ctx }) {
  const [scrollY,setScrollY]=useState(0);
  const [articles,setArticles]=useState([]);
  const [artLoading,setArtLoading]=useState(true);
  useEffect(()=>{
    const h=()=>setScrollY(window.scrollY);
    window.addEventListener('scroll',h);
    return()=>window.removeEventListener('scroll',h);
  },[]);
  useEffect(()=>{const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.15});document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));return()=>obs.disconnect();},[]);  useEffect(()=>{
    const cached=localStorage.getItem('cf_articles');
    const cachedTime=localStorage.getItem('cf_articles_time');
    if(cached&&cachedTime&&Date.now()-parseInt(cachedTime)<3600000){
      const all=JSON.parse(cached);
      const offset=Math.floor(Date.now()/3600000)%Math.max(1,all.length-2);
      setArticles(all.slice(offset,offset+3));
      setArtLoading(false);
      return;
    }
    fetch('/api/news').then(r=>r.json()).then(d=>{
      const arts=d.articles||[];
      if(arts.length>0){
        localStorage.setItem('cf_articles',JSON.stringify(arts));
        localStorage.setItem('cf_articles_time',Date.now().toString());
        setArticles(arts.slice(0,3));
      }
      setArtLoading(false);
    }).catch(()=>setArtLoading(false));
  },[]);
  function go(role){if(role==='urgence'){if(ctx.sess?.role==='part'){ctx.setPage('urgence');}else{ctx.setPage('login-part');sessionStorage.setItem('after_login','urgence');}return;}ctx.setPage(ctx.sess?.role===role?(role==='pro'?'pro-dashboard':'part-home'):('login-'+role));}
  const F={fontFamily:"'Inter',sans-serif"};
  return(
<div style={{...F,background:'#fff',color:'#1d1d1f',overflowX:'hidden'}}>
<style>{"@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300&display=swap');html{scroll-behavior:smooth}@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}@keyframes revealUp{from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)}}.reveal{animation:revealUp .9s cubic-bezier(.4,0,.2,1) both}.hero-btn:hover{transform:scale(1.03);transition:transform .2s}"}</style>

<nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:scrollY>50?'rgba(255,255,255,0.85)':'transparent',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderBottom:scrollY>50?'0.5px solid rgba(0,0,0,0.12)':'none',transition:'all .5s cubic-bezier(.4,0,.2,1)',padding:'0 48px',height:48,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
  <span style={{fontSize:17,fontWeight:800,color:scrollY>50?'#1d1d1f':'#fff',letterSpacing:'-0.3px',transition:'color .5s'}}>click<span style={{color:'#FF6F00'}}>&</span>fix</span>
  <div style={{display:'flex',gap:6,alignItems:'center'}}>
    <button onClick={()=>go('part')} style={{...F,padding:'6px 16px',borderRadius:18,border:'none',background:scrollY>50?'rgba(0,0,0,0.06)':'rgba(255,255,255,0.15)',color:scrollY>50?'#1d1d1f':'#fff',fontSize:13,fontWeight:500,cursor:'pointer',transition:'all .3s',backdropFilter:'blur(10px)'}}>Particulier</button>
    <button onClick={()=>go('pro')} style={{...F,padding:'6px 16px',borderRadius:18,border:'none',background:'#FF6F00',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>Artisan</button>
  </div>
</nav>

<section style={{height:'100vh',position:'relative',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
  <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=90" alt="renovation" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
  <div style={{position:'absolute',inset:0,background:'linear-gradient(160deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0.7) 100%)'}}/>
  <div style={{position:'relative',textAlign:'center',padding:'0 20px',maxWidth:860,animation:'fadeUp .8s ease both'}}>
    <p style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.6)',letterSpacing:3,textTransform:'uppercase',marginBottom:20}}>La plateforme de renovation N°1</p>
    <h1 style={{fontSize:'clamp(40px,6vw,80px)',fontWeight:800,letterSpacing:'-2.5px',lineHeight:1.05,marginBottom:18,color:'#fff'}}>Trouvez <span style={{color:'#FF6F00'}}>l&apos;artisan</span><br/>qu&apos;il vous faut</h1>
    <p style={{fontSize:'clamp(15px,2vw,19px)',color:'rgba(255,255,255,0.65)',maxWidth:480,margin:'0 auto 44px',lineHeight:1.65,fontWeight:300}}>Click&amp;fix met en relation particuliers et artisans. Rapide, fiable et gratuit.</p>
    <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
      <button className="hero-btn" onClick={()=>go('part')} style={{...F,padding:'14px 32px',borderRadius:980,border:'none',background:'#fff',color:'#1d1d1f',fontSize:15,fontWeight:600,cursor:'pointer',letterSpacing:'-0.2px'}}>Déposer une demande</button><button className="hero-btn" onClick={()=>go('urgence')} style={{...F,padding:'14px 32px',borderRadius:980,border:'none',background:'rgba(239,68,68,0.9)',color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',letterSpacing:'-0.2px'}}>🚨 Dépannage urgent</button>
      <button className="hero-btn" onClick={()=>go('pro')} style={{...F,padding:'14px 32px',borderRadius:980,border:'1.5px solid rgba(255,255,255,0.4)',background:'transparent',color:'#fff',fontSize:15,fontWeight:500,cursor:'pointer',letterSpacing:'-0.2px'}}>Je suis artisan</button>
    </div>
  </div>
</section>

<section style={{padding:'120px 48px',background:'#fff'}}>
  <div className="reveal" style={{maxWidth:980,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:96,alignItems:"center"}}>
    <div>
      <p style={{fontSize:12,fontWeight:600,color:'#FF6F00',letterSpacing:3,textTransform:'uppercase',marginBottom:16}}>Particuliers</p>
      <h2 style={{fontSize:'clamp(28px,3.5vw,48px)',fontWeight:800,letterSpacing:'-1.8px',lineHeight:1.1,marginBottom:18}}>Vos travaux,<br/>sans le stress</h2>
      <p style={{fontSize:16,color:'#6e6e73',lineHeight:1.75,marginBottom:40,fontWeight:400}}>Décrivez votre projet. Nous envoyons votre demande aux meilleurs artisans de votre région sous 24h. Gratuit et sans engagement.</p>
      {[['Décrivez votre projet','Notre assistant pose les bonnes questions selon vos travaux.'],['Recevez des artisans','Artisans vérifiés, assurés, dans votre zone géographique.'],['Confirmez votre RDV','Choisissez votre créneau et suivez en temps réel.']].map(([t,d],i)=>(
        <div key={i} style={{display:'flex',gap:14,marginBottom:24}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'#1d1d1f',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,flexShrink:0,marginTop:2}}>{i+1}</div>
          <div><p style={{fontWeight:600,fontSize:15,marginBottom:2,color:'#1d1d1f'}}>{t}</p><p style={{fontSize:13,color:'#6e6e73',lineHeight:1.55,margin:0}}>{d}</p></div>
        </div>
      ))}
      <button onClick={()=>go('part')} style={{...F,marginTop:24,padding:'13px 28px',borderRadius:980,border:'none',background:'#1d1d1f',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',letterSpacing:'-0.2px'}}>Commencer gratuitement →</button>
    </div>
    <div style={{borderRadius:20,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.1)'}}>
      <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85" alt="renovation interieure" style={{width:'100%',height:560,objectFit:'cover',display:'block'}}/>
    </div>
  </div>
</section>

<section style={{padding:'120px 48px',background:'#f5f5f7'}}>
  <div className="reveal" style={{maxWidth:980,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:96,alignItems:"center"}}>
    <div style={{borderRadius:20,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.12)'}}>
      <img src="https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=900&q=85" alt="artisan professionnel" style={{width:'100%',height:560,objectFit:'cover',display:'block'}}/>
    </div>
    <div>
      <p style={{fontSize:12,fontWeight:600,color:'#FF6F00',letterSpacing:3,textTransform:'uppercase',marginBottom:16}}>Artisans</p>
      <h2 style={{fontSize:'clamp(28px,3.5vw,48px)',fontWeight:800,letterSpacing:'-1.8px',lineHeight:1.1,marginBottom:18}}>Plus de clients,<br/>moins de démarches</h2>
      <p style={{fontSize:16,color:'#6e6e73',lineHeight:1.75,marginBottom:40,fontWeight:400}}>Recevez des leads qualifiés dans votre zone. Nous sélectionnons uniquement les projets qui correspondent à vos spécialités.</p>
      {[['Profil professionnel complet','Spécialités, zone d\'intervention, documents centralisés.'],['Leads qualifiés','Les clients viennent à vous. Fini le démarchage.'],['Dashboard de suivi','Confirmez vos RDV et gérez votre activité facilement.']].map(([t,d],i)=>(
        <div key={i} style={{display:'flex',gap:14,marginBottom:24}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'#FF6F00',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,flexShrink:0,marginTop:2}}>{i+1}</div>
          <div><p style={{fontWeight:600,fontSize:15,marginBottom:2,color:'#1d1d1f'}}>{t}</p><p style={{fontSize:13,color:'#6e6e73',lineHeight:1.55,margin:0}}>{d}</p></div>
        </div>
      ))}
      <button onClick={()=>go('pro')} style={{...F,marginTop:24,padding:'13px 28px',borderRadius:980,border:'none',background:'#FF6F00',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',letterSpacing:'-0.2px'}}>Rejoindre la plateforme →</button>
    </div>
  </div>
</section>

<section style={{padding:'120px 48px',background:'#fff'}}>
  <div style={{maxWidth:980,margin:'0 auto'}}>
<section style={{padding:'100px 48px',background:'linear-gradient(135deg,#1a0a0a,#2d0f0f)'}}>
  <div style={{maxWidth:980,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
    <div>
      <div style={{fontSize:11,fontWeight:700,color:'#ef4444',letterSpacing:3,textTransform:'uppercase',marginBottom:16}}>Nouveau — Dépannage instantané</div>
      <h2 style={{fontSize:'clamp(28px,3.5vw,48px)',fontWeight:800,letterSpacing:'-1.8px',lineHeight:1.1,marginBottom:18,color:'#fff'}}>Un artisan chez vous<br/>en moins d&apos;une heure</h2>
      <p style={{fontSize:16,color:'rgba(255,255,255,0.5)',lineHeight:1.75,marginBottom:36,fontWeight:400}}>Fuite d&apos;eau, panne électrique, porte bloquée — nos artisans disponibles interviennent immédiatement près de chez vous.</p>
      {[['📍 Géolocalisation automatique','Nous détectons votre position et trouvons les artisans les plus proches.'],['⚡ Réponse en temps réel','L&apos;artisan disponible le plus proche est alerté instantanément.'],['✅ Réservé aux membres','Connectez-vous gratuitement pour accéder au service d&apos;urgence.']].map(([t,d],i)=>(
        <div key={i} style={{display:'flex',gap:14,marginBottom:20}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{t.split(' ')[0]}</div>
          <div>
            <p style={{fontWeight:700,fontSize:14,marginBottom:2,color:'#fff'}}>{t.split(' ').slice(1).join(' ')}</p>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.38)',lineHeight:1.55,margin:0}} dangerouslySetInnerHTML={{__html:d}}/>
          </div>
        </div>
      ))}
      <button onClick={()=>go('urgence')} style={{...F,marginTop:24,padding:'14px 32px',borderRadius:980,border:'none',background:'#ef4444',color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 24px rgba(239,68,68,0.4)',letterSpacing:'-0.2px'}}>🚨 Accéder au dépannage urgent</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {[['🚿','Fuite d\'eau','Intervention immédiate'],['⚡','Panne électrique','Dépannage rapide'],['🔐','Serrurerie','Ouverture porte'],['🔥','Chauffage','Remise en marche']].map(([ico,t,d])=>(
        <div key={t} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'24px 20px',textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:10}}>{ico}</div>
          <div style={{fontWeight:700,fontSize:14,color:'#fff',marginBottom:4}}>{t}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.35)'}}>{d}</div>
        </div>
      ))}
    </div>
  </div>
</section>

    <div style={{marginBottom:64}}>
      <h2 style={{fontSize:'clamp(28px,3.5vw,48px)',fontWeight:800,letterSpacing:'-1.8px',marginBottom:8,color:'#1d1d1f'}}>Actualités travaux</h2>
      <p style={{fontSize:15,color:'#6e6e73',fontWeight:400}}>Les dernières nouvelles du secteur</p>
    </div>
    {artLoading?(
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
        {[1,2,3].map(i=><div key={i} style={{borderRadius:16,background:'#f5f5f7',height:340,animation:'pulse 1.5s infinite'}}/>)}
      </div>
    ):(
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
        {articles.map((a,i)=>(
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{borderRadius:16,overflow:'hidden',background:'#f5f5f7',textDecoration:'none',display:'block',transition:'transform .3s'}}>
            <div style={{height:180,overflow:'hidden'}}>
              <img src={a.urlToImage} alt={a.title} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .4s'}} onError={e=>{e.target.src='https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80';}}/>
            </div>
            <div style={{padding:20}}>
              <p style={{fontSize:11,fontWeight:600,color:'#FF6F00',letterSpacing:2,marginBottom:8,textTransform:'uppercase',margin:'0 0 8px'}}>{a.source&&a.source.name?a.source.name:'Actualité'}</p>
              <p style={{fontWeight:700,fontSize:14,marginBottom:8,color:'#1d1d1f',lineHeight:1.35,margin:'0 0 8px'}}>{a.title&&a.title.length>70?a.title.slice(0,70)+'…':a.title}</p>
              <p style={{fontSize:12,color:'#6e6e73',lineHeight:1.55,margin:'0 0 14px'}}>{a.description&&a.description.length>100?a.description.slice(0,100)+'…':a.description}</p>
              <p style={{fontSize:12,color:'#FF6F00',fontWeight:600,margin:0}}>Lire l&apos;article →</p>
            </div>
          </a>
        ))}
      </div>
    )}
  </div>
</section>

<section style={{padding:'100px 48px',background:'#1d1d1f'}}>
  <div style={{maxWidth:980,margin:'0 auto'}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}}>
      {[['400 000','artisans en France'],['24h','délai d\'intervention moyen'],['0 €','pour les particuliers'],['100%','artisans vérifiés']].map(([n,l],i)=>(
        <div key={i} style={{padding:'40px 32px',borderRight:i<3?'0.5px solid rgba(255,255,255,0.08)':'none',textAlign:'center'}}>
          <div style={{fontSize:'clamp(36px,4vw,56px)',fontWeight:800,color:'#fff',letterSpacing:'-2px',marginBottom:8}}>{n}</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.38)',fontWeight:400,lineHeight:1.4}}>{l}</div>
        </div>
      ))}
    </div>
  </div>
</section>
<section style={{padding:'100px 48px',background:'#f5f5f7'}}>
  <div style={{maxWidth:980,margin:'0 auto'}}>
    <div style={{marginBottom:64}}>
      <h2 style={{fontSize:'clamp(28px,3.5vw,48px)',fontWeight:800,letterSpacing:'-1.8px',marginBottom:8}}>Tous nos métiers</h2>
      <p style={{fontSize:15,color:'#6e6e73',fontWeight:400}}>Des professionnels qualifiés pour chaque type de travaux</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'rgba(0,0,0,0.06)',borderRadius:16,overflow:'hidden'}}>
      {[['Plomberie & Sanitaires','Fuites, installation, salle de bain, chauffe-eau, débouchage'],['Électricité','Tableau, prises, domotique, borne de recharge, alarme'],['Chauffage & Énergie','Chaudière, climatisation, pompe à chaleur, panneaux solaires'],['Menuiserie & Fenêtres','Fenêtres, portes, volets, portail, véranda, escaliers'],['Maçonnerie & Gros œuvre','Construction, extension, démolition, terrassement, ravalement'],['Peinture & Décoration','Peinture, enduit, papier peint, faux plafond, décoration'],['Toiture & Charpente','Toiture, tuiles, zinguerie, étanchéité, Velux, gouttières'],['Isolation & Combles','Isolation combles, murs, sols, VMC, traitement humidité'],['Carrelage & Sol','Parquet, carrelage, béton ciré, vinyle, sous-couche'],['Serrurerie & Sécurité','Serrure, blindage, porte blindée, coffre-fort, dépannage'],['Jardinage & Extérieur','Terrasse, jardin, élagage, paysagisme, allée, clôture'],['Cuisine & Aménagement','Cuisine équipée, dressing, rangements, agencement intérieur']].map(([t,d],i)=>(
        <div key={i} style={{background:'#fff',padding:'24px 28px'}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:6,color:'#1d1d1f'}}>{t}</div>
          <div style={{fontSize:12,color:'#6e6e73',lineHeight:1.5}}>{d}</div>
        </div>
      ))}
    </div>
  </div>
</section>
<section style={{padding:'100px 48px',background:'#fff'}}>
  <div style={{maxWidth:700,margin:'0 auto'}}>
    <div style={{marginBottom:64}}>
      <h2 style={{fontSize:'clamp(28px,3.5vw,48px)',fontWeight:800,letterSpacing:'-1.8px',marginBottom:8}}>Questions fréquentes</h2>
      <p style={{fontSize:15,color:'#6e6e73',fontWeight:400}}>Tout ce que vous devez savoir</p>
    </div>
    {[['Est-ce vraiment gratuit pour les particuliers ?','Oui, totalement gratuit. Déposez votre demande, recevez des artisans vérifiés et confirmez votre RDV sans aucun frais. Click&fix est financé par les abonnements des artisans.'],['Comment sont vérifiés les artisans ?','Chaque artisan doit fournir son numéro SIRET, son attestation d\'assurance décennale et ses justificatifs professionnels. Notre équipe valide chaque dossier manuellement avant activation.'],['Sous quel délai vais-je être contacté ?','Votre demande est envoyée immédiatement aux artisans qualifiés de votre zone. Vous recevez généralement une réponse sous 24h, souvent bien moins.'],['Que faire si l\'artisan ne convient pas ?','Vous n\'êtes jamais engagé avant d\'avoir accepté un devis. Si l\'artisan ne convient pas, nous en envoyons un autre. Votre satisfaction est notre priorité.']].map(([q,a],i)=>(<FaqItem key={i} q={q} a={a}/>))}
  </div>
</section>

<section style={{padding:'120px 48px',background:'#1d1d1f',textAlign:'center'}}>
  <div style={{maxWidth:640,margin:'0 auto'}}>
    <h2 style={{fontSize:'clamp(32px,4.5vw,60px)',fontWeight:800,letterSpacing:'-2.5px',color:'#fff',marginBottom:16,lineHeight:1.08}}>Prêt à transformer votre habitat ?</h2>
    <p style={{fontSize:17,color:'rgba(255,255,255,0.38)',marginBottom:44,lineHeight:1.65,fontWeight:300}}>Gratuit pour les particuliers. Des artisans vérifiés sous 24h.</p>
    <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
      <button onClick={()=>go('part')} style={{...F,padding:'15px 32px',borderRadius:980,border:'none',background:'#FF6F00',color:'#fff',fontSize:15,fontWeight:600,cursor:'pointer'}}>Déposer une demande</button>
      <button onClick={()=>go('pro')} style={{...F,padding:'15px 32px',borderRadius:980,border:'1.5px solid rgba(255,255,255,0.2)',background:'transparent',color:'rgba(255,255,255,0.8)',fontSize:15,fontWeight:500,cursor:'pointer'}}>Espace artisan</button>
    </div>
  </div>
</section>

<footer style={{background:'#000',padding:'36px 48px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
  <span style={{fontSize:16,fontWeight:800,color:'#fff',letterSpacing:'-0.3px'}}>click<span style={{color:'#FF6F00'}}>&</span>fix</span>
  <div style={{display:'flex',gap:24,fontSize:12,color:'rgba(255,255,255,0.25)'}}>
    <span style={{cursor:'pointer'}}>contact@click-fix.fr</span>
    <span style={{cursor:'pointer'}}>Mentions légales</span>
    <span style={{cursor:'pointer'}}>CGU</span>
  </div>
  <span style={{fontSize:11,color:'rgba(255,255,255,0.12)'}}>© 2025 Click&fix</span>
</footer>
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
              {isPro&&<><Inp label="Nom entreprise *" v={f.entreprise} set={set("entreprise")}/><div style={{ gridColumn:"1/-1" }}><div><Inp label="N SIRET *" v={f.siret} set={set("siret")}/>{f.siret&&!/^[0-9]{14}$/.test(f.siret.replace(/\s/g,""))&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>14 chiffres requis</div>}</div></div><ProAddressInput f={f} setF={setF}/>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={S.lbl}>Rayon d intervention *</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                  {["10 km","20 km","30 km","50 km","100 km","200 km"].map(r=>{
                    const active=f.rayon===r;
                    return <button key={r} type="button" onClick={()=>setF(p=>({...p,rayon:r}))} style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid "+(active?"#FF6F00":"rgba(0,0,0,0.1)"),background:active?"rgba(255,111,0,0.15)":"transparent",color:active?"#FF6F00":"#6e6e73",fontSize:12,cursor:"pointer",fontWeight:active?700:400}}>{r}</button>;
                  })}
                </div>
                {!f.rayon&&<div style={{fontSize:11,color:"rgba(255,165,0,0.7)",marginTop:4}}>Selectionnez votre rayon</div>}
              </div>
              <div style={{ gridColumn:"1/-1" }}><label style={S.lbl}>Vos specialites * ({(f.specialites||[]).length} choisie(s))</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:8,marginBottom:8}}>{TRAVAUX_CATS.map(cat=>{const sel=f.selectedCat===cat.id;return(<button key={cat.id} type="button" onClick={()=>setF(p=>({...p,selectedCat:sel?null:cat.id}))} style={{position:"relative",borderRadius:10,overflow:"hidden",aspectRatio:"1.5",border:"2px solid "+(sel?"#FF6F00":"transparent"),cursor:"pointer",padding:0,display:"block"}}><img src={cat.img} alt={cat.label} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/><div style={{position:"absolute",inset:0,background:sel?"rgba(255,111,0,0.5)":"rgba(0,0,0,0.4)"}}/><div style={{position:"absolute",bottom:0,left:0,right:0,padding:"4px",color:"#fff",fontSize:9,fontWeight:700,textAlign:"center"}}>{cat.label}</div></button>);})}</div>{f.selectedCat&&<div style={{marginBottom:8}}><div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:6}}>Choisissez vos specialites :</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{(SPECIALITES_CATEGORIES.find(s=>s.cat===CAT_MAPPING[f.selectedCat])?.items||[]).map(t=>{const active=(f.specialites||[]).includes(t);return <button key={t} type="button" onClick={()=>{const prev=f.specialites||[];setF(p=>({...p,specialites:active?prev.filter(x=>x!==t):[...prev,t]}));}} style={{padding:"5px 10px",borderRadius:6,border:"1px solid "+(active?"#FF6F00":"rgba(0,0,0,0.1)"),background:active?"rgba(255,111,0,0.15)":"transparent",color:active?"#FF6F00":"#6e6e73",fontSize:11,cursor:"pointer"}}>{t}</button>;})}</div></div>}</div></>}
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

function LeafletMap({loc,artisans}){
  useEffect(()=>{
    const loadMap=()=>{
      const el=document.getElementById("urgence-map");
      if(!el)return;
      if(el._leafmap){el._leafmap.remove();el._leafmap=null;}
      const L=window.L;
      const map=L.map(el).setView([loc.lat,loc.lon],13);
      el._leafmap=map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"OSM"}).addTo(map);
      const you=L.divIcon({html:"<div style='background:#ef4444;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)'></div>",iconSize:[16,16],className:""});
      L.marker([loc.lat,loc.lon],{icon:you}).addTo(map).bindPopup("Votre position").openPopup();
      const pro=L.divIcon({html:"<div style='background:#FF6F00;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)'></div>",iconSize:[14,14],className:""});
      artisans.forEach(a=>{
        if(a.lat&&a.lon){
          L.marker([a.lat,a.lon],{icon:pro}).addTo(map).bindPopup("<b>"+a.prenom+" "+a.nom+"</b><br/>"+a.dist+" km");
        }
      });
    };
    if(window.L){loadMap();}
    else{
      const css=document.createElement("link");css.rel="stylesheet";css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(css);
      const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload=loadMap;document.head.appendChild(s);
    }
    return()=>{const el=document.getElementById("urgence-map");if(el&&el._leafmap){el._leafmap.remove();el._leafmap=null;}};
  },[loc,artisans]);
  return <div id="urgence-map" style={{width:"100%",height:280,borderRadius:16,border:"1px solid #f0f0f0",marginBottom:16}}/>;
}
function UrgencePage({ctx}){
const [step,setStep]=useState("type");
const [type,setType]=useState("");
const [details,setDetails]=useState("");const [photo,setPhoto]=useState(null);const [analyse,setAnalyse]=useState(null);const [analysing,setAnalysing]=useState(false);
const [loc,setLoc]=useState(null);const [cardName,setCardName]=useState("");const [paymentReady,setPaymentReady]=useState(false);const [clientSecret,setClientSecret]=useState(null);const [paymentLoading,setPaymentLoading]=useState(false);const stripeRef=useRef(null);const cardRef=useRef(null);useEffect(()=>{if(step!=="cb"||!clientSecret)return;const mountStripe=()=>{if(!window.Stripe)return;const stripe=window.Stripe("pk_test_51Tcl4JRyxerWKxWhZI5J2yXpqCoIcg83AYXN3GqcRifEt0IbkvAas32Tsg7l8Wb42jJfSXo71PzNCoNLsTRy5iRM00drfgGl6t");stripeRef.current=stripe;const elements=stripe.elements();const card=elements.create("card",{style:{base:{fontSize:"16px",color:"#1d1d1f",fontFamily:"Inter,sans-serif","::placeholder":{color:"#8e8e93"}}},hidePostalCode:true});cardRef.current=card;setTimeout(()=>{const el=document.getElementById("stripe-card-element");if(el&&!el.children.length)card.mount("#stripe-card-element");},100);};if(window.Stripe){mountStripe();}else{const s=document.createElement("script");s.src="https://js.stripe.com/v3/";s.onload=mountStripe;document.head.appendChild(s);}return()=>{if(cardRef.current){cardRef.current.unmount();}};},[step,clientSecret]);
const [loading,setLoading]=useState(false);
const [sent,setSent]=useState(false);
const [artisans,setArtisans]=useState([]);
const F={fontFamily:"'Inter',sans-serif"};
const TYPES=[{id:"plomberie",label:"🚿 Fuite d'eau",desc:"Fuite, dégât des eaux, canalisation"},{id:"electricite",label:"⚡ Panne électrique",desc:"Coupure, court-circuit, tableau"},{id:"serrurerie",label:"🔐 Serrurerie",desc:"Porte bloquée, serrure cassée"},{id:"chauffage",label:"🔥 Chauffage",desc:"Chaudière en panne, radiateur"},{id:"autre",label:"🔧 Autre urgence",desc:"Autre type de dépannage urgent"}];
useEffect(()=>{
if(step==="localisation"){
navigator.geolocation.getCurrentPosition(pos=>{
setLoc({lat:pos.coords.latitude,lon:pos.coords.longitude});
},()=>{setLoc({lat:48.8566,lon:2.3522});});
}
},[step]);
useEffect(()=>{
if(loc&&step==="carte"){
const AK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";
fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/rest/v1/profiles?role=eq.pro&disponible=eq.true&select=id,prenom,nom,entreprise,tel,lat,lon,specialites",{headers:{"apikey":AK}})
.then(r=>r.json()).then(d=>{
function haversine(la1,lo1,la2,lo2){const R=6371;const dLat=(la2-la1)*Math.PI/180;const dLon=(lo2-lo1)*Math.PI/180;const a=Math.sin(dLat/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
const sorted=(d||[]).filter(p=>p.lat&&p.lon).map(p=>({...p,dist:Math.round(haversine(loc.lat,loc.lon,p.lat,p.lon)*10)/10})).sort((a,b)=>a.dist-b.dist).slice(0,5);
setArtisans(sorted);
}).catch(()=>{});
}
},[loc,step]);
async function sendUrgence(artisan){
setLoading(true);
try{
await fetch("/api/urgence-lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({client_nom:ctx.sess?.prenom||"Client",client_tel:ctx.sess?.tel||"",client_email:ctx.sess?.email||"",travaux:type,precision:"Urgence — "+type,details:details+(analyse?" | Diagnostic IA: "+analyse.diagnostic:""),photo:photo||null,analyse_ia:analyse||null,adresse:"Géolocalisation",lat:loc?.lat,lon:loc?.lon,nb_artisans:1,statut:"dispatche",assigned_to:artisan.id,creneaux:"[]",heure:"Immédiatement",user_id:ctx.sess?.id||null,payment_intent_id:clientSecret?clientSecret.split("_secret_")[0]:null,paiement_statut:clientSecret?"pre_autorise":"non_requis"})});
setSent(true);
}catch(e){}
setLoading(false);
}
if(sent)return(
<div style={{...F,minHeight:"100vh",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
<div style={{textAlign:"center",maxWidth:480}}>
<div style={{fontSize:64,marginBottom:24}}>✅</div>
<h2 style={{fontSize:28,fontWeight:800,color:"#1d1d1f",marginBottom:12,letterSpacing:"-1px"}}>Demande envoyée !</h2>
<p style={{fontSize:16,color:"#6e6e73",marginBottom:32,lineHeight:1.6}}>Un artisan disponible près de vous a été alerté. Il devrait vous contacter très rapidement.</p>
<button onClick={()=>ctx.setPage("home")} style={{...F,padding:"14px 32px",background:"#1d1d1f",border:"none",borderRadius:980,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>Retour à l&apos;accueil</button>
</div>
</div>
);
return(
<div style={{...F,minHeight:"100vh",background:"#fff",color:"#1d1d1f"}}>
<div style={{padding:"20px 24px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",gap:16}}>
<button onClick={()=>ctx.setPage("home")} style={{...F,background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#1d1d1f"}}>←</button>
<div>
<div style={{fontSize:18,fontWeight:800,color:"#ef4444",letterSpacing:"-0.5px"}}>🚨 Dépannage urgent</div>
<div style={{fontSize:12,color:"#8e8e93"}}>Artisan disponible près de vous</div>
</div>
</div>
<div style={{padding:"32px 24px",maxWidth:560,margin:"0 auto"}}>
{step==="type"&&(
<div>
<h2 style={{fontSize:22,fontWeight:800,marginBottom:8,letterSpacing:"-0.5px"}}>Quel est le problème ?</h2>
<p style={{fontSize:14,color:"#8e8e93",marginBottom:24}}>Sélectionnez le type d&apos;urgence</p>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
{TYPES.map(t=>(
<button key={t.id} onClick={()=>{setType(t.id);setStep("details");}} style={{...F,padding:"16px 20px",background:type===t.id?"rgba(239,68,68,0.06)":"#fafafa",border:"1.5px solid "+(type===t.id?"#ef4444":"#f0f0f0"),borderRadius:16,textAlign:"left",cursor:"pointer",transition:"all .2s"}}>
<div style={{fontWeight:700,fontSize:15,color:"#1d1d1f",marginBottom:2}}>{t.label}</div>
<div style={{fontSize:12,color:"#8e8e93"}}>{t.desc}</div>
</button>
))}
</div>
</div>
)}
{step==="details"&&(
<div>
<h2 style={{fontSize:22,fontWeight:800,marginBottom:8,letterSpacing:"-0.5px"}}>Décrivez le problème</h2>
<p style={{fontSize:14,color:"#8e8e93",marginBottom:24}}>Quelques mots + une photo pour aider l&apos;artisan</p>
<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Ex: Fuite sous l'évier de la cuisine, eau qui coule partout..." style={{...F,width:"100%",height:100,padding:"14px 16px",border:"1.5px solid #f0f0f0",borderRadius:16,fontSize:14,color:"#1d1d1f",background:"#fafafa",outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.5,marginBottom:12}}/>
<label style={{display:"block",border:"2px dashed #f0f0f0",borderRadius:16,padding:"20px",textAlign:"center",cursor:"pointer",marginBottom:12,background:photo?"#f0fdf4":"#fafafa"}}>
  {photo?<div><div style={{fontSize:32,marginBottom:4}}>✅</div><div style={{fontSize:13,color:"#22c55e",fontWeight:600}}>Photo ajoutée</div></div>:<div><div style={{fontSize:32,marginBottom:4}}>📸</div><div style={{fontSize:13,color:"#8e8e93"}}>Ajouter une photo du problème</div></div>}
  <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=async()=>{const b64=r.result;setPhoto(b64);setAnalysing(true);try{const res=await fetch("/api/analyze-photo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:b64,description:details||type})});const d=await res.json();setAnalyse(d);}catch(e){}setAnalysing(false);};r.readAsDataURL(f);}}/>
</label>
{analysing&&<div style={{padding:"12px 16px",background:"#fafafa",borderRadius:12,marginBottom:12,fontSize:13,color:"#8e8e93"}}>🔍 Analyse IA en cours...</div>}
{analyse&&!analysing&&<div style={{padding:"16px",background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:16,marginBottom:12}}>
  <div style={{fontSize:11,fontWeight:700,color:"#22c55e",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Analyse IA</div>
  <div style={{fontSize:13,color:"#1d1d1f",fontWeight:600,marginBottom:4}}>{analyse.diagnostic}</div>
  {analyse.materiel&&<div style={{fontSize:12,color:"#6e6e73",marginBottom:4}}>🔧 {analyse.materiel?.join(", ")}</div>}
  {analyse.duree&&<div style={{fontSize:12,color:"#6e6e73",marginBottom:2}}>⏱ {analyse.duree}</div>}{analyse.prix_min&&analyse.prix_max&&<div style={{fontSize:13,fontWeight:700,color:"#FF6F00",marginTop:6}}>💰 Estimation : {analyse.prix_min} - {analyse.prix_max}</div>}
</div>}
<button onClick={()=>setStep("paiement")} style={{...F,width:"100%",padding:"15px",background:"#ef4444",border:"none",borderRadius:980,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>Continuer →</button>
</div>
)}
{step==="paiement"&&(
<div>
<h2 style={{fontSize:22,fontWeight:800,marginBottom:8,letterSpacing:"-0.5px"}}>Pré-autorisation CB</h2>
<p style={{fontSize:14,color:"#8e8e93",marginBottom:24}}>Votre carte sera débitée uniquement après validation de l&apos;intervention</p>
<div style={{background:"#fafafa",border:"1.5px solid #f0f0f0",borderRadius:16,padding:"20px",marginBottom:16}}>
  <div style={{fontSize:11,fontWeight:700,color:"#8e8e93",letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>Informations de paiement</div>
  <div style={{marginBottom:12}}>
    <label style={{fontSize:12,color:"#6e6e73",fontWeight:600,display:"block",marginBottom:6}}>Nom sur la carte</label>
    <input value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="Marie Dupont" style={{...F,width:"100%",padding:"12px 14px",border:"1.5px solid #f0f0f0",borderRadius:12,fontSize:14,color:"#1d1d1f",background:"#fff",outline:"none",boxSizing:"border-box"}}/>
  </div>
  <div style={{padding:"14px",background:"#f5f5f7",borderRadius:12,fontSize:13,color:"#6e6e73",marginBottom:12}}>
    <div style={{fontWeight:600,color:"#1d1d1f",marginBottom:4}}>💳 Paiement sécurisé par Stripe</div>
    Numéro de carte, date et CVV seront saisis à l&apos;étape suivante
  </div>
  <div style={{padding:"12px 14px",background:"rgba(255,111,0,0.05)",border:"1px solid rgba(255,111,0,0.15)",borderRadius:12,fontSize:13,color:"#6e6e73"}}>
    💰 Estimation : {analyse?analyse.prix_min+" — "+analyse.prix_max:"50€ — 300€"}<br/>
    <span style={{fontSize:11}}>Montant exact validé après intervention</span>
  </div>
</div>
<button onClick={async()=>{if(!cardName)return;setPaymentLoading(true);try{
if(!window.Stripe){const s=document.createElement("script");s.src="https://js.stripe.com/v3/";await new Promise(r=>{s.onload=r;document.head.appendChild(s);});}
const r=await fetch("/api/create-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:analyse?parseInt((analyse.prix_max||"300").replace(/[^0-9]/g,""))||300:300,client_email:ctx.sess?.email||"",lead_id:"urgence",description:"Dépannage urgence - "+type})});
const d=await r.json();
if(d.client_secret){setClientSecret(d.client_secret);setPaymentReady(true);setStep("cb");}
}catch(e){ctx.notify("Erreur paiement","err");}setPaymentLoading(false);}} disabled={!cardName||paymentLoading} style={{...F,width:"100%",padding:"15px",background:cardName&&!paymentLoading?"#ef4444":"#f0f0f0",border:"none",borderRadius:980,color:cardName&&!paymentLoading?"#fff":"#8e8e93",fontWeight:700,fontSize:15,cursor:cardName&&!paymentLoading?"pointer":"not-allowed"}}>{paymentLoading?"Création en cours...":"Entrer ma carte →"}</button>
</div>
)}
{step==="cb"&&clientSecret&&(
<div>
<h2 style={{fontSize:22,fontWeight:800,marginBottom:8,letterSpacing:"-0.5px"}}>Saisissez votre carte</h2>
<p style={{fontSize:14,color:"#8e8e93",marginBottom:24}}>Pré-autorisation uniquement — débit après validation</p>
<div id="stripe-card-element" style={{padding:"14px 16px",border:"1.5px solid #f0f0f0",borderRadius:16,background:"#fafafa",marginBottom:16,minHeight:44}}/>
<div id="stripe-error" style={{color:"#ef4444",fontSize:13,marginBottom:12}}/>
<button onClick={async()=>{if(!stripeRef.current||!cardRef.current)return;setPaymentLoading(true);const{error}=await stripeRef.current.confirmCardPayment(clientSecret,{payment_method:{card:cardRef.current,billing_details:{name:cardName,email:ctx.sess?.email||""}}});if(error){const el=document.getElementById("stripe-error");if(el)el.textContent=error.message;setPaymentLoading(false);}else{setPaymentReady(true);setStep("localisation");}}} style={{...F,width:"100%",padding:"15px",background:"#ef4444",border:"none",borderRadius:980,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>{paymentLoading?"Vérification...":"✓ Confirmer la pré-autorisation"}</button>
<p style={{fontSize:11,color:"#8e8e93",textAlign:"center",marginTop:12}}>🔒 Paiement 100% sécurisé par Stripe</p>
</div>
)}
{step==="localisation"&&(
<div style={{textAlign:"center",padding:"48px 0"}}>
<div style={{fontSize:64,marginBottom:24}}>📍</div>
<h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Localisation en cours...</h2>
<p style={{fontSize:14,color:"#8e8e93",marginBottom:32}}>Nous localisons les artisans disponibles près de vous</p>
{loc?(
<button onClick={()=>setStep("carte")} style={{...F,padding:"15px 32px",background:"#ef4444",border:"none",borderRadius:980,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>Voir les artisans disponibles →</button>
):(
<div style={{fontSize:13,color:"#8e8e93"}}>Autorisation en cours...</div>
)}
</div>
)}
{step==="carte"&&(
<div>
<h2 style={{fontSize:22,fontWeight:800,marginBottom:8,letterSpacing:"-0.5px"}}>Artisans disponibles</h2>
<p style={{fontSize:14,color:"#8e8e93",marginBottom:16}}>Près de votre position</p><LeafletMap loc={loc} artisans={artisans}/>
{artisans.length===0?(
<div style={{textAlign:"center",padding:"48px 0"}}>
<div style={{fontSize:48,marginBottom:16}}>😔</div>
<p style={{fontSize:15,color:"#8e8e93"}}>Aucun artisan disponible pour l&apos;instant</p>
<button onClick={()=>ctx.setPage("ai-lead")} style={{...F,marginTop:20,padding:"14px 28px",background:"#1d1d1f",border:"none",borderRadius:980,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Déposer une demande classique</button>
</div>
):(
<div style={{display:"flex",flexDirection:"column",gap:10}}>
{artisans.map(a=>(
<div key={a.id} style={{background:"#fff",border:"1.5px solid #f0f0f0",borderRadius:20,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
<div>
<div style={{fontWeight:700,fontSize:16,color:"#1d1d1f"}}>{a.prenom} {a.nom}</div>
<div style={{fontSize:13,color:"#8e8e93",marginTop:2}}>{a.entreprise}</div>
</div>
<div style={{background:"rgba(34,197,94,0.1)",color:"#22c55e",fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:99}}>📍 {a.dist} km</div>
</div>
<div style={{fontSize:12,color:"#8e8e93",marginBottom:14,display:"flex",flexWrap:"wrap",gap:6}}>
{(a.specialites||[]).slice(0,3).map(sp=><span key={sp} style={{background:"#f5f5f7",padding:"3px 8px",borderRadius:6}}>{sp}</span>)}
</div>
<button onClick={()=>sendUrgence(a)} disabled={loading} style={{...F,width:"100%",padding:"12px",background:loading?"#f0f0f0":"#ef4444",border:"none",borderRadius:12,color:loading?"#8e8e93":"#fff",fontWeight:700,fontSize:14,cursor:loading?"not-allowed":"pointer",transition:"all .2s"}}>
{loading?"Envoi en cours...":"🚨 Contacter cet artisan"}
</button>
</div>
))}
</div>
)}
</div>
)}
</div>
</div>
);
}

function PartHome({ctx}){
const [selLead,setSelLead]=useState(null);const [selRdv,setSelRdv]=useState(null);
const s=ctx.sess;
const [tab,setTab]=useState("demandes");
const confirmed=ctx.myLeadsPart.filter(l=>l.statut==="confirme"||l.statut==="confirmed"||l.statut==="confirmé");
const pending=ctx.myLeadsPart.filter(l=>l.statut==="en attente"||l.statut==="dispatche");
const TABS=[{id:"demandes",ico:"📋",label:"Mes demandes"},{id:"rdv",ico:"✅",label:"RDV confirmés"},{id:"profil",ico:"👤",label:"Mon profil"}];
const F={fontFamily:"'Inter',sans-serif"};
function timeAgo(d){const diff=Date.now()-new Date(d).getTime();const mins=Math.floor(diff/60000);const hours=Math.floor(diff/3600000);const days=Math.floor(diff/86400000);if(days>0)return"il y a "+days+" jour"+(days>1?"s":"");if(hours>0)return"il y a "+hours+"h";if(mins>0)return"il y a "+mins+" min";return"à l instant";}
function statusColor(s){if(s==="confirme"||s==="confirmed"||s==="confirmé")return"#22c55e";if(s==="dispatche")return"#38bdf8";return"#FBC005";}
const initiales=((s?.prenom||"")[0]||"")+(((s?.nom||"")[0])||"");
return(
<div style={{...F,minHeight:"100vh",background:"#111113",display:"flex",color:"#fff"}}>
<style>{"@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap')"}</style>
<div style={{width:240,minHeight:"100vh",background:"rgba(255,255,255,0.025)",borderRight:"0.5px solid rgba(255,255,255,0.07)",padding:"24px 14px",flexShrink:0,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0}}>
  <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 8px",marginBottom:28}}>
    <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#38bdf8,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#fff",flexShrink:0}}>{initiales.toUpperCase()}</div>
    <div>
      <div style={{fontSize:13,fontWeight:700,color:"#fff",lineHeight:1.2}}>{s?.prenom} {s?.nom}</div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.28)"}}>Particulier</div>
    </div>
  </div>
  <button onClick={()=>ctx.setPage("urgence")} style={{...F,width:"100%",padding:"11px 16px",background:"#ef4444",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:8,letterSpacing:"-0.2px"}}>🚨 Dépannage urgent</button><button onClick={()=>ctx.setPage("ai-lead")} style={{...F,width:"100%",padding:"11px 16px",background:"#38bdf8",border:"none",borderRadius:12,color:"#000",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:20,letterSpacing:"-0.2px"}}>+ Nouvelle demande</button>
  <div style={{flex:1}}>
    {TABS.map(t=>(
      <button key={t.id} onClick={()=>{setTab(t.id);sessionStorage.setItem("pro_tab",t.id);}} style={{...F,display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:10,border:"none",background:tab===t.id?"rgba(56,189,248,0.1)":"transparent",color:tab===t.id?"#38bdf8":"rgba(255,255,255,0.32)",fontWeight:tab===t.id?600:400,fontSize:13,cursor:"pointer",marginBottom:2,textAlign:"left",transition:"all .2s"}}>
        <span style={{fontSize:14}}>{t.ico}</span>{t.label}
        {t.id==="demandes"&&ctx.myLeadsPart.length>0&&<span style={{marginLeft:"auto",fontSize:11,fontWeight:700,background:"rgba(56,189,248,0.15)",color:"#38bdf8",padding:"2px 7px",borderRadius:99}}>{ctx.myLeadsPart.length}</span>}
      </button>
    ))}
  </div>
  <div style={{padding:"0 8px",marginBottom:8}}>
    <div style={{fontSize:10,color:"rgba(255,255,255,0.15)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>click<span style={{color:"#38bdf8"}}>&</span>fix</div>
  </div>
  <button onClick={ctx.logout} style={{...F,display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 12px",borderRadius:10,border:"none",background:"transparent",color:"rgba(255,255,255,0.18)",fontSize:12,cursor:"pointer",textAlign:"left"}}>Déconnexion</button>
</div>
<div style={{flex:1,marginLeft:240,padding:"40px 48px",minHeight:"100vh"}}>
  <div style={{maxWidth:760,margin:"0 auto"}}>
    <div style={{marginBottom:32}}>
      <h1 style={{fontSize:26,fontWeight:800,letterSpacing:"-0.8px",marginBottom:4}}>Bonjour {s?.prenom} 👋</h1>
      <p style={{fontSize:13,color:"rgba(255,255,255,0.28)",fontWeight:400}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:32}}>
      {[["Demandes",ctx.myLeadsPart.length,"#38bdf8","rgba(56,189,248,0.08)","rgba(56,189,248,0.15)"],["En attente",pending.length,"#FBC005","rgba(251,192,5,0.08)","rgba(251,192,5,0.15)"],["Confirmés",confirmed.length,"#22c55e","rgba(34,197,94,0.08)","rgba(34,197,94,0.15)"]].map(([label,val,color,bg,border])=>(
        <div key={label} style={{background:bg,border:"0.5px solid "+border,borderRadius:16,padding:"18px 20px"}}>
          <div style={{fontSize:10,fontWeight:600,color:color,letterSpacing:2,textTransform:"uppercase",opacity:0.7,marginBottom:6}}>{label}</div>
          <div style={{fontSize:32,fontWeight:800,color:color,letterSpacing:"-1px"}}>{val}</div>
        </div>
      ))}
    </div>
    {tab==="demandes"&&(
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.2)",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Mes demandes</div>
        {ctx.myLeadsPart.length===0?(
          <div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"48px 32px",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>📋</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>Aucune demande</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginBottom:20}}>Déposez votre premier projet gratuitement</div>
            <button onClick={()=>ctx.setPage("ai-lead")} style={{...F,padding:"12px 24px",background:"#38bdf8",border:"none",borderRadius:980,color:"#000",fontWeight:700,fontSize:13,cursor:"pointer"}}>Déposer une demande</button>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {ctx.myLeadsPart.map(l=>(
              <div key={l.id} onClick={()=>setSelLead(selLead?.id===l.id?null:l)} style={{background:"rgba(255,255,255,0.025)",border:"0.5px solid rgba(255,255,255,0.07)",borderLeft:"3px solid "+statusColor(l.statut),borderRadius:14,padding:"16px 18px",cursor:"pointer",transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <span style={{fontWeight:700,fontSize:14,color:"#fff"}}>{l.travaux||""}</span>
                    {l.precision&&<span style={{color:"rgba(255,255,255,0.3)",fontSize:12}}> — {l.precision}</span>}
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.2)",marginTop:4,display:"flex",gap:10,flexWrap:"wrap"}}>
                      {l.budget&&<span>{l.budget}</span>}
                      {l.surface&&<span>{l.surface}</span>}
                      {l.ville&&<span>📍 {l.ville}</span>}
                      <span>{timeAgo(l.created_at)}</span>
                    </div>
                  </div>
                  <SBadge s={l.statut}/>
                </div>
                {selLead?.id===l.id&&(
                  <div style={{marginTop:14,paddingTop:14,borderTop:"0.5px solid rgba(255,255,255,0.06)",display:"grid",gap:8}}>
                    {[["Spécialité",l.precision],["Détails",l.details],["Surface",l.surface],["Budget",l.budget],["Adresse",l.adresse],["Ville",l.ville],["Artisans",l.nb_artisans+" artisans"]].map(([k,v])=>v&&(
                      <div key={k} style={{display:"flex",gap:12}}>
                        <span style={{fontSize:11,color:"rgba(255,255,255,0.22)",minWidth:80,flexShrink:0}}>{k}</span>
                        <span style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    {tab==="rdv"&&(
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.2)",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Rendez-vous confirmés</div>
        {confirmed.length===0?(
          <div style={{background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"48px 32px",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>✅</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>Aucun RDV confirmé</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>Vos RDV confirmés apparaîtront ici</div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {confirmed.map(l=>(
              <div key={l.id} onClick={()=>setSelRdv(selRdv?.id===l.id?null:l)} style={{background:"rgba(34,197,94,0.04)",border:"0.5px solid "+(selRdv?.id===l.id?"rgba(34,197,94,0.4)":"rgba(34,197,94,0.15)"),borderLeft:"3px solid #22c55e",borderRadius:14,padding:"16px 18px",cursor:"pointer",transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><span style={{fontWeight:700,fontSize:14,color:"#fff"}}>{l.travaux||l.precision}</span>{l.ville&&<span style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginLeft:8}}>📍 {l.ville}</span>}</div>
                  <SBadge s={l.statut}/>
                </div>
                {selRdv?.id===l.id&&(
                  <div style={{marginTop:14,paddingTop:14,borderTop:"0.5px solid rgba(34,197,94,0.15)"}}>
                    <div style={{display:"grid",gap:8,marginBottom:12}}>
                      {[["Spécialité",l.precision],["Adresse",l.adresse],["Ville",l.ville],["Surface",l.surface],["Budget",l.budget]].map(([k,v])=>v&&(<div key={k} style={{display:"flex",gap:12}}><span style={{fontSize:11,color:"rgba(255,255,255,0.25)",minWidth:80,flexShrink:0}}>{k}</span><span style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{v}</span></div>))}
                    </div>
                    {l.creneaux&&JSON.parse(typeof l.creneaux==="string"?l.creneaux:"[]").length>0&&(
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:10,fontWeight:600,color:"rgba(56,189,248,0.6)",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Créneaux</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{(typeof l.creneaux==="string"?JSON.parse(l.creneaux):l.creneaux).map((sl,i)=><div key={i} style={{background:"rgba(56,189,248,0.07)",border:"0.5px solid rgba(56,189,248,0.2)",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#38bdf8",fontWeight:500}}>{(sl.label||sl).replace(/([0-9]{2})\/([0-9]{2})\/[0-9]{4} a ([0-9]{2}:[0-9]{2})/,(m,d,mo,h)=>["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][new Date(2026,mo-1,d).getDay()]+" "+d+" "+["jan","fev","mars","avr","mai","juin","juil","aout","sep","oct","nov","dec"][mo-1]+" a "+h)}</div>)}</div>
                      </div>
                    )}
                    {l.assigned_to&&<ArtisanInfo id={l.assigned_to}/>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    {tab==="profil"&&<PartProfilTab s={s} ctx={ctx}/>}
  </div>
</div>
</div>
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
        <BigBtn style={{background:"linear-gradient(135deg,#FF6F00,#FBC005)",boxShadow:"0 4px 24px rgba(255,111,0,0.4)"}} onClick={()=>{if(profile){LS.set("cf_sess",{...profile,pass:s?.pass,token:s?.token});}setTimeout(()=>{window.location.href="/"  },artisans.length>0?100:500);}}>
          Accéder à mon Dashboard →
        </BigBtn>
      </div>
    </div>
  );
}

function PackTab({ s, ctx }) {
async function connectStripe(){
try{
const r=await fetch("/api/stripe-onboard",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s?.email,artisan_id:s?.id})});
const d=await r.json();
if(d.url)window.open(d.url,"_blank");
}catch(e){ctx.notify("Erreur Stripe","err");}
}
  const [sel,setSel]=useState(null);
  const history=(s?.packs_history||[]).slice().reverse();
  const hasMonthly=s?.pack&&(s.pack==="Pro"||s.pack==="Elite");
  return (
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{color:"#1d1d1f",fontWeight:800,fontSize:18}}>Mon Pack</div>
        <button onClick={()=>hasMonthly?window.open("https://buy.stripe.com/test_00w6oJ8diba42kW9pv7wA00","_blank"):ctx.setPage("pro-pricing")} style={{padding:"8px 16px",background:"rgba(255,111,0,0.12)",border:"1px solid rgba(255,111,0,0.3)",borderRadius:8,color:"#FF6F00",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Ajouter un pack</button>
      </div>
      {history.length===0&&<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:32,textAlign:"center",color:"#6e6e73"}}>Aucun pack actif. <span style={{color:"#FF6F00",cursor:"pointer"}} onClick={()=>ctx.setPage("pro-pricing")}>Choisir un pack</span></div>}
      {history.map((p,i)=>(
        <div key={i} onClick={()=>setSel(sel===i?null:i)} style={{background:"rgba(255,111,0,0.07)",border:"1px solid "+(sel===i?"#FF6F00":"rgba(255,111,0,0.2)"),borderRadius:14,padding:"16px 20px",marginBottom:10,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:"#FF6F00",fontWeight:800,fontSize:15}}>{p.name}</div>
              <div style={{color:"#6e6e73",fontSize:12,marginTop:2}}>{p.rdv} RDV · {p.prix} EUR · {new Date(p.date_achat).toLocaleDateString("fr-FR")}</div>
            </div>
            <div style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:p.abonnement?"rgba(255,111,0,0.15)":"rgba(56,189,248,0.15)",color:p.abonnement?"#FF6F00":"#38bdf8"}}>{p.abonnement?"Mensuel":"Unique"}</div>
          </div>
          {sel===i&&<div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px"}}><div style={{color:"#6e6e73",fontSize:11}}>RDV inclus</div><div style={{color:"#1d1d1f",fontWeight:700,fontSize:16}}>{p.rdv}</div></div>
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px"}}><div style={{color:"#6e6e73",fontSize:11}}>Prix</div><div style={{color:"#1d1d1f",fontWeight:700,fontSize:16}}>{p.prix} EUR</div></div>
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px"}}><div style={{color:"#6e6e73",fontSize:11}}>Date achat</div><div style={{color:"#1d1d1f",fontWeight:700,fontSize:13}}>{new Date(p.date_achat).toLocaleDateString("fr-FR")}</div></div>
              {p.date_renouvellement&&<div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px"}}><div style={{color:"#6e6e73",fontSize:11}}>Renouvellement</div><div style={{color:"#FF6F00",fontWeight:700,fontSize:13}}>{new Date(p.date_renouvellement).toLocaleDateString("fr-FR")}</div></div>}
            </div>
            {p.specialites&&p.specialites.length>0&&<div style={{marginTop:8}}><div style={{color:"#6e6e73",fontSize:11,marginBottom:6}}>Specialites</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{p.specialites.map(sp=><span key={sp} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"rgba(255,111,0,0.1)",color:"#FF6F00",border:"1px solid rgba(255,111,0,0.2)"}}>{sp}</span>)}</div></div>}
          </div>}
        </div>
      ))}
      {hasMonthly&&<div style={{fontSize:12,color:"#6e6e73",textAlign:"center",marginTop:8}}>Pour changer de pack mensuel : <a href="mailto:contact@click-fix.fr" style={{color:"#FF6F00"}}>contact@click-fix.fr</a></div>}<div style={{marginTop:16,padding:"16px",background:s?.stripe_account_id?"rgba(34,197,94,0.05)":"rgba(99,102,241,0.05)",border:"1px solid "+(s?.stripe_account_id?"rgba(34,197,94,0.2)":"rgba(99,102,241,0.2)"),borderRadius:14}}><div style={{fontSize:11,fontWeight:700,color:s?.stripe_account_id?"#22c55e":"#6366f1",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Paiements urgences</div><div style={{fontSize:13,color:"#6e6e73",marginBottom:12}}>{s?.stripe_account_id?"✅ Compte Stripe connecté — Vous pouvez recevoir des paiements d urgences":"Connectez votre compte Stripe pour recevoir les paiements d urgences directement."}</div>{!s?.stripe_account_id&&<button onClick={connectStripe} style={{width:"100%",padding:"10px",background:"#6366f1",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔗 Connecter mon compte Stripe</button>}</div>
    </>
  );
}

function CityInput({value,onChange,onSelect,label}){const [sugg,setSugg]=useState([]);const [show,setShow]=useState(false);function search(v){onChange(v);if(v.length<2){setSugg([]);return;}fetch("https://geo.api.gouv.fr/communes?nom="+encodeURIComponent(v)+"\&fields=nom,codesPostaux,centre\&limit=5\&boost=population").then(r=>r.json()).then(d=>{setSugg(d||[]);setShow(true);}).catch(()=>{});}function pick(c){const cp=c.codesPostaux?.[0]||"";const lat=c.centre?.coordinates?.[1]||null;const lon=c.centre?.coordinates?.[0]||null;onSelect({ville:c.nom,code_postal:cp,lat,lon});setSugg([]);setShow(false);}return(<div style={{position:"relative",gridColumn:"1/-1"}}><label style={{display:"block",fontSize:12,color:"#6e6e73",marginBottom:5,fontWeight:600}}>{label}</label><input value={value} onChange={e=>search(e.target.value)} onBlur={()=>setTimeout(()=>setShow(false),200)} style={{width:"100%",background:"#f5f5f7",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:"14px 16px",color:"#1d1d1f",fontSize:15,outline:"none",boxSizing:"border-box"}} placeholder="Ex: Paris, Lyon, Marseille..."/>{show&&sugg.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,zIndex:999,marginTop:4}}>{sugg.map((c,i)=><div key={i} onClick={()=>pick(c)} style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"#1d1d1f",fontSize:14}} onMouseDown={e=>e.preventDefault()}>{c.nom} <span style={{color:"#6e6e73",fontSize:12}}>({c.codesPostaux?.[0]})</span></div>)}</div>}</div>);}
function AddressInput({form,setForm,onValidate}){const [sugg,setSugg]=useState([]);const [show,setShow]=useState(false);function search(v){setForm(f=>({...f,adresse:v}));if(onValidate)onValidate(false);if(onValidate)onValidate(false);if(v.length<3){setSugg([]);return;}fetch("https://api-adresse.data.gouv.fr/search/?q="+encodeURIComponent(v)+"\&limit=5\&type=housenumber").then(r=>r.json()).then(d=>{setSugg(d?.features||[]);setShow(true);}).catch(()=>{});}function pick(f){const p=f.properties;setForm(prev=>({...prev,adresse:p.name||p.label,ville:p.city||"",code_postal:p.postcode||"",lat:f.geometry?.coordinates?.[1]||null,lon:f.geometry?.coordinates?.[0]||null}));setSugg([]);setShow(false);if(onValidate)onValidate(true);}return(<div style={{gridColumn:"1/-1",position:"relative"}}><label style={{display:"block",fontSize:12,color:"#6e6e73",marginBottom:5,fontWeight:600}}>Adresse du chantier *</label><input value={form.adresse} onChange={e=>search(e.target.value)} onBlur={()=>setTimeout(()=>setShow(false),200)} style={{width:"100%",background:"#f5f5f7",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:"14px 16px",color:"#1d1d1f",fontSize:15,outline:"none",boxSizing:"border-box"}} placeholder="Ex: 12 rue de la Paix, Paris..."/>{show&&sugg.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,zIndex:999,marginTop:4}}>{sugg.map((f,i)=><div key={i} onClick={()=>pick(f)} style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"#1d1d1f",fontSize:13}} onMouseDown={e=>e.preventDefault()}>{f.properties.label}</div>)}</div>}{form.ville&&<div style={{marginTop:6,fontSize:12,color:"#6e6e73"}}>{form.ville} {form.code_postal}</div>}</div>);}
function ProAddressInput({f,setF}){const [sugg,setSugg]=useState([]);const [show,setShow]=useState(false);function search(v){setF(p=>({...p,ville_intervention:v,lat:null,lon:null}));if(v.length<3){setSugg([]);return;}fetch("https://api-adresse.data.gouv.fr/search/?q="+encodeURIComponent(v)+"\&limit=5").then(r=>r.json()).then(d=>{setSugg(d?.features||[]);setShow(true);}).catch(()=>{});}function pick(ft){const p=ft.properties;setF(prev=>({...prev,ville_intervention:p.city||p.name,lat:ft.geometry?.coordinates?.[1]||null,lon:ft.geometry?.coordinates?.[0]||null}));setSugg([]);setShow(false);}return(<div style={{position:"relative"}}><label style={{display:"block",fontSize:12,color:"#6e6e73",marginBottom:5,fontWeight:600}}>Adresse entreprise *</label><input value={f.ville_intervention||""} onChange={e=>search(e.target.value)} onBlur={()=>setTimeout(()=>setShow(false),200)} style={{width:"100%",background:"#f5f5f7",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:12,padding:"14px 16px",color:"#1d1d1f",fontSize:15,outline:"none",boxSizing:"border-box"}} placeholder="Ex: 12 rue de la Paix, Paris..."/>{show&&sugg.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,zIndex:999,marginTop:4}}>{sugg.map((ft,i)=><div key={i} onClick={()=>pick(ft)} style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"#1d1d1f",fontSize:13}} onMouseDown={e=>e.preventDefault()}>{ft.properties.label}</div>)}</div>}{f.ville_intervention&&f.lat&&<div style={{marginTop:6,fontSize:12,color:"#22c55e"}}>Adresse validee</div>}</div>);}
function PartProfilTab({s,ctx}){const [f,setF]=useState({prenom:s?.prenom||"",nom:s?.nom||"",tel:s?.tel||"",email:s?.email||""});async function save(){try{const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";const AK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";await fetch(SB+"/rest/v1/profiles?id=eq."+s.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":AK,"Authorization":"Bearer "+(s.token||AK)},body:JSON.stringify({prenom:f.prenom,nom:f.nom,tel:f.tel})});ctx.updateSession({...s,...f});ctx.notify("Profil mis a jour !");}catch(e){ctx.notify("Erreur","err");}}return(<div style={{...S.card,maxWidth:480}}><ST>Mon profil</ST><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}><Inp label="Prenom" v={f.prenom} set={e=>setF(p=>({...p,prenom:e.target.value}))}/><Inp label="Nom" v={f.nom} set={e=>setF(p=>({...p,nom:e.target.value}))}/><Inp label="Telephone" v={f.tel} set={e=>setF(p=>({...p,tel:e.target.value.replace(/[^0-9]/g,"")}))} type="tel"/><Inp label="Email" v={f.email} set={()=>{}}/></div><BigBtn onClick={save}>Enregistrer</BigBtn></div>);}
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
<div style={{ color:"#1d1d1f", fontSize:13, fontWeight:700 }}>{pro.prenom} {pro.nom}</div>
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
function AILeadForm({ctx}){
const s=ctx.sess;
const [msgs,setMsgs]=useState([{role:"assistant",content:"Bonjour "+(s?.prenom||"")+" ! Decrivez-moi votre projet de travaux."}]);
const [input,setInput]=useState("");
const [busy,setBusy]=useState(false);
const [showRecap,setShowRecap]=useState(false);
const [done,setDone]=useState(false);const [leadData,setLeadData]=useState(null);
const [slots,setSlots]=useState([]);
const [showCal,setShowCal]=useState(false);
const [showAddr,setShowAddr]=useState(false);
const [addrForm,setAddrForm]=useState({adresse:"",ville:"",code_postal:"",lat:null,lon:null});
const [addrOk,setAddrOk]=useState(false);
const today=new Date();
const days=Array.from({length:14},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()+i+1);return d;});
const hours=["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"];
function toggleSlot(date,hour){const key=date+"_"+hour;const label=date+" a "+hour;setSlots(prev=>{if(prev.find(sl=>sl.key===key))return prev.filter(sl=>sl.key!==key);if(prev.length>=nbArt)return prev;return[...prev,{key,date,hour,label}];});}
function confirmAddr(){if(!addrOk){alert("Selectionnez une adresse dans la liste");return;}setShowAddr(false);setShowCal(true);setMsgs(prev=>[...prev,{role:"assistant",content:"Adresse : "+addrForm.adresse+", "+addrForm.ville+". Choisissez vos creneaux (minimum 3)."}]);}
const nbArt=parseInt(leadData?.nb_artisans||"3")||3;
async function submitWithSlots(){if(slots.length<nbArt){alert("Minimum "+nbArt+" creneaux (1 par artisan)");return;}setShowCal(false);setShowRecap(true);}
async function confirmAndSend(){await ctx.submitLead({...leadData,...addrForm,prenom:s?.prenom,nom:s?.nom,email:s?.email,tel:s?.tel,creneaux:slots,type:leadData.travaux,nb_artisans:nbArt,details:leadData.details||"",precision:leadData.precision||"",message:""});ctx.setPage("part-home");}
if(done)return(<div style={{minHeight:"100vh",background:"#07090f",display:"flex",alignItems:"center",justifyContent:"center"}}><BgFx/><div style={{zIndex:2,textAlign:"center",maxWidth:480,padding:20}}><div style={{fontSize:60,marginBottom:16}}>🎉</div><h2 style={{color:"#fff",fontSize:28,fontWeight:900,marginBottom:12}}>Demande envoyee !</h2><p style={{color:"rgba(255,255,255,0.5)",marginBottom:28}}>Nous recherchons les meilleurs artisans sous 24h.</p><BigBtn onClick={()=>ctx.setPage("part-home")}>Voir mes demandes</BigBtn></div></div>);
async function send(){if(!input.trim()||busy)return;const newMsgs=[...msgs,{role:"user",content:input}];setMsgs(newMsgs);setInput("");setBusy(true);try{const r=await fetch("/api/ai-chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:newMsgs,prenom:s?.prenom})});const d=await r.json();const text=d.text||"";const re=/\[LEAD\]([\s\S]*?)\[\/LEAD\]/s;const m2=text.match(re);if(m2){try{const lead=JSON.parse(m2[1]);setLeadData(lead);setMsgs(prev=>[...prev,{role:"assistant",content:"Parfait ! Entrez l adresse exacte du chantier."}]);setShowAddr(true);}catch(e){setMsgs(prev=>[...prev,{role:"assistant",content:text.replace(re,"").trim()}]);}}else{setMsgs(prev=>[...prev,{role:"assistant",content:text}]);}}catch(e){setMsgs(prev=>[...prev,{role:"assistant",content:"Erreur. Reessayez."}]);}setBusy(false);}return(
<div style={{minHeight:"100vh",background:"#07090f",display:"flex",flexDirection:"column"}}>
<BgFx/>
<div style={{zIndex:2,display:"flex",alignItems:"center",gap:10,padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
<button onClick={()=>ctx.setPage("part-home")} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.4)",fontSize:20,cursor:"pointer"}}>←</button>
<div style={{color:"#fff",fontWeight:700}}>Assistant Click&fix</div>
<div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",marginLeft:"auto"}}/>
</div>
<div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:12,zIndex:2}}>
{msgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"80%",padding:"12px 16px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.role==="user"?"linear-gradient(135deg,#38bdf8,#0ea5e9)":"rgba(255,255,255,0.07)",color:"#fff",fontSize:14,lineHeight:1.6}}>{m.content}</div></div>))}
{busy&&<div style={{display:"flex"}}><div style={{padding:"12px 16px",borderRadius:"18px 18px 18px 4px",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.5)",fontSize:14}}>...</div></div>}
{showAddr&&<div style={{background:"rgba(56,189,248,0.05)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:16,padding:16,marginTop:8}}><div style={{color:"#38bdf8",fontWeight:700,fontSize:14,marginBottom:12}}>Adresse du chantier</div><AddressInput form={addrForm} setForm={setAddrForm} onValidate={setAddrOk}/><BigBtn style={{marginTop:12,background:addrOk?"linear-gradient(135deg,#38bdf8,#0ea5e9)":"rgba(255,255,255,0.1)"}} onClick={confirmAddr}>Confirmer l adresse</BigBtn></div>}
{showCal&&<div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:16,padding:16,marginTop:8}}><div style={{color:"#38bdf8",fontWeight:700,fontSize:14,marginBottom:12}}>Vos disponibilites — {nbArt} artisan{nbArt>1?"s":""} maximum ({slots.length}/{nbArt} selectionne{slots.length>1?"s":""})</div><div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",fontSize:12,color:"#fff",minWidth:400}}><thead><tr><th style={{padding:"6px 8px",color:"rgba(255,255,255,0.4)"}}></th>{hours.map(h=><th key={h} style={{padding:"6px 8px",color:"rgba(255,255,255,0.4)",fontWeight:600}}>{h}</th>)}</tr></thead><tbody>{days.map(d=>{const dateStr=d.toLocaleDateString("fr-FR");const dayName=d.toLocaleDateString("fr-FR",{weekday:"short"});return(<tr key={dateStr}><td style={{padding:"6px 8px",color:"rgba(255,255,255,0.5)",whiteSpace:"nowrap",paddingRight:12}}>{dayName} {dateStr}</td>{hours.map(h=>{const key=dateStr+"_"+h;const sel=slots.find(sl=>sl.key===key);return(<td key={h} style={{padding:"4px"}}><div onClick={()=>toggleSlot(dateStr,h)} style={{width:28,height:28,borderRadius:6,background:sel?"#38bdf8":"rgba(255,255,255,0.05)",border:"1px solid "+(sel?"#38bdf8":"rgba(255,255,255,0.1)"),cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:sel?"#07090f":"transparent",margin:"0 auto"}}>{sel?"✓":""}</div></td>);})}</tr>)})}</tbody></table></div><BigBtn style={{marginTop:14,background:slots.length>=3?"linear-gradient(135deg,#38bdf8,#0ea5e9)":"rgba(255,255,255,0.1)"}} onClick={submitWithSlots}>Valider les creneaux ({slots.length}/{nbArt})</BigBtn></div>}
{showRecap&&<div style={{background:"rgba(56,189,248,0.05)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:16,padding:20,marginTop:8,zIndex:2}}><div style={{color:"#38bdf8",fontWeight:700,fontSize:16,marginBottom:16}}>Recapitulatif de votre demande</div><div style={{display:"grid",gap:8,marginBottom:14}}>{[["Travaux",leadData?.travaux],["Specialite",leadData?.precision],["Details",leadData?.details],["Surface",leadData?.surface],["Budget",leadData?.budget],["Adresse",addrForm.adresse+", "+addrForm.ville],["Artisans",nbArt+" artisans"],["Creneaux",slots.length+" selectionnes"]].map(([k,v])=>v&&<div key={k} style={{display:"flex",gap:8,padding:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:8}}><span style={{color:"rgba(255,255,255,0.35)",fontSize:12,minWidth:90,flexShrink:0}}>{k}</span><span style={{color:"#fff",fontSize:13}}>{v}</span></div>)}</div><div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>{slots.map(sl=><span key={sl.key} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"rgba(56,189,248,0.1)",color:"#38bdf8"}}>{sl.label}</span>)}</div><div style={{display:"flex",gap:10}}><button onClick={()=>{setShowRecap(false);setShowCal(true);}} style={{flex:1,padding:"11px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:13}}>Modifier</button><BigBtn style={{flex:2,background:"linear-gradient(135deg,#38bdf8,#0ea5e9)"}} onClick={confirmAndSend}>Confirmer et envoyer</BigBtn></div></div>}</div>
{!showAddr&&!showCal&&!showRecap&&<div style={{zIndex:2,padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:10}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ecrivez votre message..." style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px 16px",color:"#fff",fontSize:14,outline:"none"}}/><button onClick={send} disabled={busy||!input.trim()} style={{padding:"12px 20px",background:"linear-gradient(135deg,#38bdf8,#0ea5e9)",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Envoyer</button></div>}
</div>
);
}
function LeadForm({ ctx }) {
  const [step,setStep]   = useState(0);
  const [ans,setAns]     = useState({});
const [form,setForm]= useState({ nom:ctx.sess?.nom||"", prenom:ctx.sess?.prenom||"", email:ctx.sess?.email||"", tel:ctx.sess?.tel||"", adresse:"", ville:"", code_postal:"", message:"" });
  const [adresseOk,setAdresseOk]=useState(false);
  const [done,setDone]=useState(false);  const [sending,setSending] = useState(false);
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
                      }} style={{padding:"6px 12px",borderRadius:8,border:"1.5px solid "+(active?"#FF6F00":"rgba(0,0,0,0.1)"),background:active?"rgba(255,111,0,0.15)":"rgba(255,255,255,0.02)",color:active?"#FF6F00":"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",fontWeight:active?700:400}}>
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
              {(TRAVAUX_CATS.find(c=>c.label===ans.categorie)?.subs||[]).map(sub=>{const active=ans.precision===sub;return(<button key={sub} onClick={()=>setAns({...ans,precision:sub})} style={{background:active?"rgba(255,111,0,0.15)":"rgba(255,255,255,0.03)",border:"1.5px solid "+(active?"#FF6F00":"rgba(0,0,0,0.1)"),borderRadius:12,padding:"14px 12px",cursor:"pointer",textAlign:"left",color:active?"#FF6F00":"rgba(255,255,255,0.7)",fontSize:13,fontWeight:active?700:400}}>{sub}</button>);})}
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
  const s=ctx.sess;
  const [tab,setTab]=useState(()=>sessionStorage.getItem("pro_tab")||"rdv");
  const [profile,setProfile]=useState(s);
  const [selRdv,setSelRdv]=useState(null);
  const [selConf,setSelConf]=useState(null);
  const [dispo,setDispo]=useState(s?.disponible||false);
  async function toggleDispo(){const nd=!dispo;setDispo(nd);const AK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";await fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/rest/v1/profiles?id=eq."+s.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":AK,"Authorization":"Bearer "+(s.token||AK)},body:JSON.stringify({disponible:nd})});ctx.notify(nd?"Vous etes disponible !":"Vous etes hors ligne");}
  const F={fontFamily:"'Inter',sans-serif"};
  const rdv=ctx.myLeadsPro;
  const conf=rdv.filter(l=>l.statut==="confirme"||l.statut==="confirmed"||l.statut==="confirmé").length;
  const pending=rdv.filter(l=>l.statut==="dispatche"||l.statut==="en attente").length;
  const thisMonth=rdv.filter(l=>{const d=new Date(l.created_at);const now=new Date();return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).length;
  useEffect(()=>{if(s?.docs)setProfile(p=>({...p,docs:s.docs}));},[s?.docs]);useEffect(()=>{if(profile?.disponible!==undefined)setDispo(profile.disponible);},[profile?.disponible]);
  useEffect(()=>{
    if(!s?.id)return;
    const AK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";
    fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/rest/v1/profiles?id=eq."+s.id+"&select=*",{headers:{"apikey":AK,"Authorization":"Bearer "+(s.token||AK)}})
    .then(r=>r.json()).then(d=>{if(d[0])setProfile({...s,...d[0]});}).catch(()=>{});
  },[s?.id]);
  const TABS=[{id:"rdv",ico:"📋",label:"Mes RDV"},{id:"confirmes",ico:"✅",label:"Confirmés"},{id:"docs",ico:"📄",label:"Documents"},{id:"pack",ico:"📦",label:"Mon Pack"},{id:"profil",ico:"👤",label:"Profil"}];
  const initiales=((s?.prenom||"")[0]||"")+(((s?.nom||"")[0])||"");
  const rdvPct=profile?.rdv_total>0?Math.round(((profile?.rdv_restants||0)/profile.rdv_total)*100):0;
  return(
<div style={{...F,minHeight:"100vh",background:"#fff",color:"#1d1d1f",display:"flex"}}>
<style>{"@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.pro-row{transition:all .2s;cursor:pointer}.pro-row:hover{transform:translateY(-1px);box-shadow:0 8px 32px rgba(0,0,0,0.08)!important}"}</style>
<div style={{width:260,minHeight:"100vh",background:"#fafafa",borderRight:"1px solid #f0f0f0",padding:"28px 16px",flexShrink:0,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0}}>
  <div style={{display:"flex",alignItems:"center",gap:12,padding:"4px 8px",marginBottom:8}}>
    <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#FF6F00,#FBC005)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#fff",flexShrink:0,boxShadow:"0 4px 12px rgba(255,111,0,0.3)"}}>{initiales.toUpperCase()}</div>
    <div>
      <div style={{fontSize:14,fontWeight:700,color:"#1d1d1f",letterSpacing:"-0.2px"}}>{s?.prenom} {s?.nom}</div>
      <div style={{fontSize:11,color:"#8e8e93",marginTop:1}}>{s?.entreprise||"Artisan"}</div>
    </div>
  </div>
  <div style={{height:1,background:"#f0f0f0",margin:"16px 0"}}/>
  {profile?.pack?(
    <div style={{background:"linear-gradient(135deg,rgba(255,111,0,0.06),rgba(251,192,5,0.06))",border:"1px solid rgba(255,111,0,0.12)",borderRadius:14,padding:"14px 16px",marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:11,fontWeight:700,color:"#FF6F00",letterSpacing:1,textTransform:"uppercase"}}>Pack {profile.pack}</span>
        <span style={{fontSize:11,fontWeight:600,color:"#FF6F00"}}>{profile.rdv_restants||0} RDV</span>
      </div>
      <div style={{height:4,background:"rgba(255,111,0,0.1)",borderRadius:99,overflow:"hidden"}}>
        <div style={{width:rdvPct+"%",height:"100%",background:"linear-gradient(90deg,#FF6F00,#FBC005)",borderRadius:99,transition:"width .5s"}}/>
      </div>
      <div style={{fontSize:10,color:"#8e8e93",marginTop:5}}>{rdvPct}% restants</div>
    </div>
  ):(
    <button onClick={()=>ctx.setPage("pro-pricing")} style={{...F,width:"100%",padding:"11px",background:"linear-gradient(135deg,#FF6F00,#FBC005)",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:20,boxShadow:"0 4px 16px rgba(255,111,0,0.25)"}}>🚀 Activer un pack</button>
  )}
  <div style={{flex:1}}>
    {TABS.map(t=>(
      <button key={t.id} onClick={()=>{setTab(t.id);sessionStorage.setItem("pro_tab",t.id);}} style={{...F,display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 14px",borderRadius:12,border:"none",background:tab===t.id?"linear-gradient(135deg,rgba(255,111,0,0.08),rgba(251,192,5,0.05))":"transparent",color:tab===t.id?"#FF6F00":"#3a3a3c",fontWeight:tab===t.id?700:500,fontSize:13,cursor:"pointer",marginBottom:3,textAlign:"left",transition:"all .2s",boxShadow:tab===t.id?"inset 0 0 0 1px rgba(255,111,0,0.15)":"none"}}>
        <span style={{fontSize:15}}>{t.ico}</span>{t.label}
        {t.id==="rdv"&&pending>0&&<span style={{marginLeft:"auto",fontSize:10,fontWeight:700,background:"#FF6F00",color:"#fff",padding:"2px 7px",borderRadius:99}}>{pending}</span>}
      </button>
    ))}
  </div>
  <div style={{height:1,background:"#f0f0f0",margin:"12px 0"}}/>
  <div style={{padding:"0 8px",marginBottom:8,fontSize:16,fontWeight:800,color:"#1d1d1f",letterSpacing:"-0.3px"}}>click<span style={{color:"#FF6F00"}}>&</span>fix</div>
  <div style={{padding:"10px 14px",marginBottom:8,background:dispo?"rgba(34,197,94,0.06)":"rgba(0,0,0,0.02)",borderRadius:12,border:"1px solid "+(dispo?"rgba(34,197,94,0.2)":"#f0f0f0")}}><div style={{fontSize:10,fontWeight:600,color:"#8e8e93",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Dépannage urgent</div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:600,color:dispo?"#22c55e":"#8e8e93"}}>{dispo?"Disponible":"Hors ligne"}</span><div onClick={toggleDispo} style={{width:44,height:26,borderRadius:13,background:dispo?"#22c55e":"#e5e5ea",position:"relative",cursor:"pointer",transition:"background .3s"}}><div style={{width:22,height:22,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:dispo?20:2,transition:"left .3s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/></div></div></div>
  <button onClick={ctx.logout} style={{...F,display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",borderRadius:12,border:"none",background:"transparent",color:"#8e8e93",fontSize:12,cursor:"pointer",textAlign:"left"}}>↩ Déconnexion</button>
</div>
<div style={{flex:1,marginLeft:260,padding:"40px 48px",minHeight:"100vh",background:"#fff"}}>
  <div style={{maxWidth:820,margin:"0 auto",animation:"fadeUp .5s ease both"}}>
    <div style={{marginBottom:32}}>
      <h1 style={{fontSize:26,fontWeight:800,letterSpacing:"-0.8px",marginBottom:4,color:"#1d1d1f"}}>Bonjour {s?.prenom} 👋</h1>
      <p style={{fontSize:13,color:"#8e8e93",fontWeight:400}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:36}}>
      {[["RDV ce mois",thisMonth,"#FF6F00","rgba(255,111,0,0.06)","rgba(255,111,0,0.1)"],["Confirmés",conf,"#22c55e","rgba(34,197,94,0.06)","rgba(34,197,94,0.12)"],["En attente",pending,"#f59e0b","rgba(245,158,11,0.06)","rgba(245,158,11,0.12)"],["RDV restants",profile?.rdv_restants||0,"#6366f1","rgba(99,102,241,0.06)","rgba(99,102,241,0.12)"]].map(([label,val,color,bg,border])=>(
        <div key={label} style={{background:bg,border:"1px solid "+border,borderRadius:20,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.03)",transition:"transform .2s"}}>
          <div style={{fontSize:10,fontWeight:700,color:color,letterSpacing:2,textTransform:"uppercase",marginBottom:10,opacity:0.9}}>{label}</div>
          <div style={{fontSize:36,fontWeight:800,color:color,letterSpacing:"-1.5px",lineHeight:1}}>{val}</div>
        </div>
      ))}
    </div>
    {tab==="rdv"&&(
      <div style={{animation:"fadeUp .4s ease both"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#8e8e93",letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>Mes RDV</div>
        {rdv.length===0?(
          <div style={{background:"#fafafa",border:"1px solid #f0f0f0",borderRadius:24,padding:"56px 32px",textAlign:"center"}}>
            <div style={{fontSize:52,marginBottom:16}}>📋</div>
            <div style={{fontWeight:700,fontSize:17,marginBottom:8,color:"#1d1d1f"}}>Aucun RDV pour l&apos;instant</div>
            <div style={{fontSize:14,color:"#8e8e93",marginBottom:24}}>Activez un pack pour recevoir vos premiers RDV</div>
            <button onClick={()=>ctx.setPage("pro-pricing")} style={{...F,padding:"13px 32px",background:"linear-gradient(135deg,#FF6F00,#FBC005)",border:"none",borderRadius:980,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 4px 20px rgba(255,111,0,0.25)"}}>Voir les packs</button>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {rdv.map(l=>(
              <div key={l.id} className="pro-row" onClick={()=>setSelRdv(selRdv?.id===l.id?null:l)} style={{background:"#fff",border:"1px solid "+(selRdv?.id===l.id?"rgba(255,111,0,0.3)":"#f0f0f0"),borderLeft:"4px solid #FF6F00",borderRadius:18,padding:"18px 22px",boxShadow:selRdv?.id===l.id?"0 8px 32px rgba(255,111,0,0.08)":"0 2px 8px rgba(0,0,0,0.03)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontWeight:700,fontSize:15,color:"#1d1d1f"}}>{l.client_nom||l.travaux||l.precision}</span>
                    {l.ville&&<span style={{fontSize:12,color:"#8e8e93",marginLeft:8}}>📍 {l.ville}</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <SBadge s={l.statut}/>
                    <span style={{color:"#8e8e93",fontSize:16,transition:"transform .2s",transform:selRdv?.id===l.id?"rotate(180deg)":"rotate(0)"}}></span>
                  </div>
                </div>
                {selRdv?.id===l.id&&(
                  <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid #f5f5f5",animation:"fadeUp .3s ease both"}}>
                    <div style={{display:"grid",gap:8,marginBottom:14}}>
                      {[["Client",l.client_nom],["Téléphone",l.client_tel],["Adresse",l.adresse],["Surface",l.surface],["Budget",l.budget],["Détails",l.details]].map(([k,v])=>v&&(
                        <div key={k} style={{display:"flex",gap:12}}>
                          <span style={{fontSize:11,color:"#8e8e93",minWidth:80,flexShrink:0,fontWeight:500}}>{k}</span>
                          <span style={{fontSize:13,color:"#1d1d1f",fontWeight:500}}>{v}</span>
                        </div>
                      ))}
                    </div>
                    {l.photo&&<div style={{marginBottom:12,borderRadius:12,overflow:"hidden"}}><img src={l.photo} alt="Photo" style={{width:"100%",maxHeight:200,objectFit:"cover",borderRadius:12}}/></div>}
                    {l.analyse_ia&&<div style={{padding:"14px 16px",background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:14,marginBottom:12}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#22c55e",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Analyse IA</div>
                      {l.analyse_ia.diagnostic&&<div style={{fontSize:13,color:"#1d1d1f",fontWeight:600,marginBottom:6}}>{l.analyse_ia.diagnostic}</div>}
                      {l.analyse_ia.materiel&&<div style={{fontSize:12,color:"#6e6e73",marginBottom:4}}>{"🔧 Matériel: "+(l.analyse_ia.materiel||[]).join(", ")}</div>}
                      {l.analyse_ia.duree&&<div style={{fontSize:12,color:"#6e6e73",marginBottom:4}}>{"⏱ Durée: "+l.analyse_ia.duree}</div>}
                      {l.analyse_ia.prix_min&&l.analyse_ia.prix_max&&<div style={{fontSize:13,fontWeight:700,color:"#FF6F00",marginTop:4}}>{"💰 Estimation: "+l.analyse_ia.prix_min+" — "+l.analyse_ia.prix_max+(l.analyse_ia.main_oeuvre?" (MO: "+l.analyse_ia.main_oeuvre+")":"")}</div>}
                    </div>}
                    {(l.statut==="dispatche"||l.statut==="en attente")&&(
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={e=>{e.stopPropagation();ctx.confirmerRdv(l);}} style={{...F,flex:1,padding:"11px",background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,color:"#22c55e",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s"}}>✓ Confirmer</button>
                          <button onClick={e=>{e.stopPropagation();ctx.refuserRdv(l);}} style={{...F,flex:1,padding:"11px",background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:12,color:"#ef4444",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s"}}>✕ Refuser</button>
                        </div>
                        {(l.lat||l.adresse)&&<div style={{display:"flex",gap:8}}>
                          <a href={l.lat?"https://waze.com/ul?ll="+l.lat+","+l.lon+"&navigate=yes":"https://waze.com/ul?q="+encodeURIComponent((l.adresse||"")+" "+(l.ville||"")+" France")} target="_blank" rel="noopener noreferrer" style={{...F,flex:1,padding:"10px",background:"rgba(0,119,195,0.08)",border:"1px solid rgba(0,119,195,0.2)",borderRadius:12,color:"#0077c3",fontWeight:600,fontSize:12,cursor:"pointer",textDecoration:"none",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>🗺 Waze</a>
                          <a href={l.lat?"https://maps.google.com/maps?daddr="+l.lat+","+l.lon:"https://maps.google.com/maps?daddr="+encodeURIComponent((l.adresse||"")+" "+(l.ville||"")+" France")} target="_blank" rel="noopener noreferrer" style={{...F,flex:1,padding:"10px",background:"rgba(66,133,244,0.08)",border:"1px solid rgba(66,133,244,0.2)",borderRadius:12,color:"#4285f4",fontWeight:600,fontSize:12,cursor:"pointer",textDecoration:"none",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>📍 Google Maps</a>
                        </div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    {tab==="confirmes"&&(
      <div style={{animation:"fadeUp .4s ease both"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#8e8e93",letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>RDV confirmés</div>
        {rdv.filter(l=>l.statut==="confirme"||l.statut==="confirmed"||l.statut==="confirmé").length===0?(
          <div style={{background:"#fafafa",border:"1px solid #f0f0f0",borderRadius:24,padding:"56px 32px",textAlign:"center"}}>
            <div style={{fontSize:52,marginBottom:16}}>✅</div>
            <div style={{fontWeight:700,fontSize:17,color:"#1d1d1f"}}>Aucun RDV confirmé</div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {rdv.filter(l=>l.statut==="confirme"||l.statut==="confirmed"||l.statut==="confirmé").map(l=>(
              <div key={l.id} className="pro-row" onClick={()=>setSelConf(selConf?.id===l.id?null:l)} style={{background:"#fff",border:"1px solid "+(selConf?.id===l.id?"rgba(34,197,94,0.3)":"#f0f0f0"),borderLeft:"4px solid #22c55e",borderRadius:18,padding:"18px 22px",boxShadow:selConf?.id===l.id?"0 8px 32px rgba(34,197,94,0.08)":"0 2px 8px rgba(0,0,0,0.03)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontWeight:700,fontSize:15,color:"#1d1d1f"}}>{l.client_nom||l.travaux||l.precision}</span>
                    {l.ville&&<span style={{fontSize:12,color:"#8e8e93",marginLeft:8}}>📍 {l.ville}</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:"rgba(34,197,94,0.1)",color:"#22c55e",fontWeight:700}}>Confirmé</span>
                    <span style={{color:"#8e8e93",fontSize:16,transition:"transform .2s",transform:selConf?.id===l.id?"rotate(180deg)":"rotate(0)"}}></span>
                  </div>
                </div>
                {selConf?.id===l.id&&(
                  <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid #f5f5f5",animation:"fadeUp .3s ease both"}}>
                    <div style={{display:"grid",gap:8,marginBottom:12}}>
                      {[["Client",l.client_nom],["Téléphone",l.client_tel],["Email",l.client_email],["Adresse",l.adresse],["Détails",l.details],["Surface",l.surface],["Budget",l.budget]].map(([k,v])=>v&&(
                        <div key={k} style={{display:"flex",gap:12}}>
                          <span style={{fontSize:11,color:"#8e8e93",minWidth:80,flexShrink:0,fontWeight:500}}>{k}</span>
                          <span style={{fontSize:13,color:"#1d1d1f",fontWeight:500}}>{v}</span>
                        </div>
                      ))}
                    </div>
                    {l.creneaux&&JSON.parse(typeof l.creneaux==="string"?l.creneaux:"[]").length>0&&(
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                        {(typeof l.creneaux==="string"?JSON.parse(l.creneaux):l.creneaux).map((sl,i)=>(
                          <span key={i} style={{fontSize:11,padding:"4px 12px",borderRadius:8,background:"rgba(99,102,241,0.08)",color:"#6366f1",border:"1px solid rgba(99,102,241,0.15)",fontWeight:500}}>📅 {(sl.label||sl).replace(/([0-9]{2})\/([0-9]{2})\/[0-9]{4} a ([0-9]{2}:[0-9]{2})/,(m,d,mo,h)=>["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][new Date(2026,mo-1,d).getDay()]+" "+d+" "+["jan","fev","mars","avr","mai","juin","juil","aout","sep","oct","nov","dec"][mo-1]+" a "+h)}</span>
                        ))}
                      </div>
                    )}
                    {l.payment_intent_id&&<div style={{marginTop:12,padding:"12px 14px",background:"rgba(255,111,0,0.05)",border:"1px solid rgba(255,111,0,0.15)",borderRadius:12}}><div style={{fontSize:11,fontWeight:700,color:"#FF6F00",marginBottom:6}}>Paiement urgence</div>{l.paiement_statut==="pre_autorise"&&<div style={{display:"flex",gap:8,marginTop:8}}><input id={"p"+l.id} type="number" placeholder="Prix EUR" style={{flex:1,padding:"8px 10px",border:"1px solid #f0f0f0",borderRadius:8,fontSize:13,outline:"none"}}/><button onClick={async e=>{e.stopPropagation();const el=document.getElementById("p"+l.id);const prix=parseFloat(el&&el.value);if(!prix)return;const AK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";await fetch("https://bipqtqezntzcmxwiaqdz.supabase.co/rest/v1/leads?id=eq."+l.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":AK,"Authorization":"Bearer "+AK},body:JSON.stringify({prix_final:prix,paiement_statut:"en_attente_validation"})});ctx.notify("Prix envoye");}} style={{padding:"8px 14px",background:"#FF6F00",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Envoyer</button></div>}{l.paiement_statut==="en_attente_validation"&&<div style={{fontSize:12,color:"#FF6F00",marginTop:6}}>{"En attente validation - "+l.prix_final+"EUR"}</div>}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    {tab==="docs"&&<div style={{animation:"fadeUp .4s ease both",background:"#fff",border:"1px solid #f0f0f0",borderRadius:24,padding:32,boxShadow:"0 2px 12px rgba(0,0,0,0.03)"}}><div style={{fontSize:11,fontWeight:700,color:"#8e8e93",letterSpacing:2,textTransform:"uppercase",marginBottom:24}}>Documents requis</div>{[{id:"siret",label:"Justificatif SIRET",required:true},{id:"assurance",label:"Assurance décennale",required:true},{id:"rib",label:"RIB",required:false}].map((d,i,arr)=>(<div key={d.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 0",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}><div><div style={{fontWeight:600,fontSize:14,color:"#1d1d1f"}}>{d.label}{d.required&&<span style={{color:"#ef4444",marginLeft:4}}>*</span>}</div><div style={{fontSize:12,color:profile?.docs?.[d.id]?"#22c55e":"#8e8e93",marginTop:3}}>{profile?.docs?.[d.id]?"✓ Document uploadé":"Non fourni"}</div></div><label style={{padding:"9px 20px",background:profile?.docs?.[d.id]?"rgba(34,197,94,0.08)":"#f5f5f5",border:"1px solid "+(profile?.docs?.[d.id]?"rgba(34,197,94,0.2)":"#e8e8e8"),borderRadius:12,fontSize:12,fontWeight:600,color:profile?.docs?.[d.id]?"#22c55e":"#1d1d1f",cursor:"pointer",transition:"all .2s"}}>{profile?.docs?.[d.id]?"✓ Modifier":"Uploader"}<input type="file" accept=".pdf,.jpg,.png" style={{display:"none"}} onChange={e=>e.target.files[0]&&ctx.uploadDoc(d.id,e.target.files[0])}/></label></div>))}</div>}
    {tab==="pack"&&<div style={{animation:"fadeUp .4s ease both"}}><PackTab s={profile} ctx={ctx}/></div>}
    {tab==="profil"&&<div style={{animation:"fadeUp .4s ease both"}}><ProfilTab s={profile} ctx={ctx}/></div>}
  </div>
</div>
</div>
);
}

function ProfilTab({s,ctx}){const [f,setF]=useState({prenom:s?.prenom||"",nom:s?.nom||"",tel:s?.tel||"",entreprise:s?.entreprise||"",ville_intervention:s?.ville_intervention||"",lat:s?.lat||null,lon:s?.lon||null,rayon:s?.rayon||"",specialites:s?.specialites||[],selectedCat:null});async function save(){try{const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";const AK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";await fetch(SB+"/rest/v1/profiles?id=eq."+s.id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":AK,"Authorization":"Bearer "+(s.token||AK)},body:JSON.stringify({prenom:f.prenom,nom:f.nom,tel:f.tel,entreprise:f.entreprise,ville_intervention:f.ville_intervention,lat:f.lat,lon:f.lon,rayon:f.rayon,specialites:f.specialites})});ctx.updateSession({...s,...f});ctx.notify("Profil mis a jour !");}catch(e){ctx.notify("Erreur","err");}}return(<div style={{maxWidth:560}}><div style={{background:"#fff",border:"0.5px solid rgba(0,0,0,0.1)",borderRadius:18,padding:24,marginBottom:14}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><Inp label="Prenom" v={f.prenom} set={e=>setF(p=>({...p,prenom:e.target.value}))}/><Inp label="Nom" v={f.nom} set={e=>setF(p=>({...p,nom:e.target.value}))}/><Inp label="Telephone" v={f.tel} set={e=>setF(p=>({...p,tel:e.target.value.replace(/[^0-9]/g,"")}))} type="tel"/><Inp label="Entreprise" v={f.entreprise} set={e=>setF(p=>({...p,entreprise:e.target.value}))}/></div></div><div style={{...S.card,marginBottom:14}}><div style={{fontSize:13,color:"#1d1d1f",marginBottom:12,fontWeight:700}}>Mes spécialités</div>{f.specialites.length>0?<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>{f.specialites.map(sp=><span key={sp} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,padding:"4px 10px",borderRadius:6,background:"rgba(255,111,0,0.1)",color:"#FF6F00",border:"1px solid rgba(255,111,0,0.2)"}}>{sp}<span onClick={()=>setF(p=>({...p,specialites:p.specialites.filter(x=>x!==sp)}))} style={{cursor:"pointer",color:"rgba(255,111,0,0.6)",fontWeight:900,marginLeft:2}}>x</span></span>)}</div>:<div style={{color:"#6e6e73",fontSize:13,marginBottom:14}}>Aucune spécialité sélectionnée</div>}<div style={{borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:12}}><div style={{fontSize:12,color:"#6e6e73",marginBottom:8}}>Ajouter des spécialités :</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>{TRAVAUX_CATS.map(cat=>{const sel=f.selectedCat===cat.id;return(<button key={cat.id} type="button" onClick={()=>setF(p=>({...p,selectedCat:sel?null:cat.id}))} style={{position:"relative",borderRadius:10,overflow:"hidden",aspectRatio:"1.5",border:"2px solid "+(sel?"#FF6F00":"transparent"),cursor:"pointer",padding:0}}><img src={cat.img} alt={cat.label} style={{width:"100%",height:"100%",objectFit:"cover"}}/><div style={{position:"absolute",inset:0,background:sel?"rgba(255,111,0,0.5)":"rgba(0,0,0,0.4)"}}/><div style={{position:"absolute",bottom:0,left:0,right:0,padding:"4px",color:"#1d1d1f",fontSize:9,fontWeight:700,textAlign:"center"}}>{cat.label}</div></button>);})}</div>{f.selectedCat&&<div style={{display:"flex",flexWrap:"wrap",gap:5}}>{(SPECIALITES_CATEGORIES.find(sc=>sc.cat===CAT_MAPPING[f.selectedCat])?.items||[]).map(t=>{const active=f.specialites.includes(t);return <button key={t} type="button" onClick={()=>{const prev=f.specialites;setF(p=>({...p,specialites:active?prev.filter(x=>x!==t):[...prev,t]}));}} style={{padding:"5px 10px",borderRadius:6,border:"1px solid "+(active?"#FF6F00":"rgba(0,0,0,0.1)"),background:active?"rgba(255,111,0,0.15)":"transparent",color:active?"#FF6F00":"#6e6e73",fontSize:11,cursor:"pointer"}}>{active?"✓ "+t:t}</button>;})}</div>}</div></div><div style={{...S.card,marginBottom:14}}><div style={{fontSize:13,color:"#1d1d1f",marginBottom:12,fontWeight:700}}>Zone d intervention</div><ProAddressInput f={f} setF={setF}/><div style={{marginTop:14}}><div style={{fontSize:12,color:"#6e6e73",marginBottom:8}}>Rayon</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["10 km","20 km","30 km","50 km","100 km","200 km"].map(r=>{const active=f.rayon===r;return <button key={r} type="button" onClick={()=>setF(p=>({...p,rayon:r}))} style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid "+(active?"#FF6F00":"rgba(0,0,0,0.1)"),background:active?"rgba(255,111,0,0.15)":"transparent",color:active?"#FF6F00":"#6e6e73",fontSize:12,cursor:"pointer"}}>{r}</button>;})}</div></div></div><BigBtn onClick={save}>Enregistrer</BigBtn></div>);}
function Shell({ ctx, color, title, maxW=660, children }) {
  return (
    <div style={{ minHeight:"100vh", position:"relative", padding:"24px 20px" }}>
      <BgFx/>
      <div style={{ zIndex:2, maxWidth:maxW, margin:"0 auto", position:"relative" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:26 }}>
          <div>
            <button onClick={()=>ctx.setPage("home")} style={S.backBtn}> Accueil</button>
            <div style={{ fontSize:21, fontWeight:900, color:"#1d1d1f" }}>click<span style={{ color:"#FF6F00" }}>&</span>fix</div>
            <div style={{ fontSize:13, color, fontWeight:700, marginTop:1 }}>{title}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"rgba(255,255,255,0.48)", fontSize:13, fontWeight:600 }}>{ctx.sess?.prenom} {ctx.sess?.nom}</div>
            <button onClick={ctx.logout} style={{ background:"none", border:"none", color:"#6e6e73", cursor:"pointer", fontSize:12 }}>Déconnexion</button>
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
    <button onClick={onClick} disabled={disabled} style={{ width:"100%", padding:"13px 20px", background:"linear-gradient(135deg,#FF6F00,#FBC005)", border:"none", borderRadius:12, color:"#1d1d1f", fontWeight:800, fontSize:15, cursor:disabled?"not-allowed":"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:"0 4px 24px rgba(255,111,0,.3)", letterSpacing:.2, display:"block", ...style }}>
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
  const ok=s==="confirme"||s==="confirmé"||s==="confirmed";const dispatche=s==="dispatche";
  return <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:99, background:ok?"rgba(34,197,94,0.1)":dispatche?"rgba(56,189,248,0.1)":"rgba(251,192,5,0.1)", color:ok?"#22c55e":dispatche?"#38bdf8":"#FBC005", border:`1px solid ${ok?"rgba(34,197,94,0.4)":"rgba(251,192,5,0.4)"}` }}>{ok?"Confirmé":dispatche?"Artisan trouvé":"En attente"}</span>;
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
  lbl:     { fontSize:11, fontWeight:700, color:"#6e6e73", letterSpacing:.5, textTransform:"uppercase", display:"block", marginBottom:5 },
  inp:     { background:"#f5f5f7", border:"1.5px solid rgba(0,0,0,0.1)", borderRadius:10, padding:"11px 13px", color:"#1d1d1f", fontSize:14, fontFamily:"'Outfit',sans-serif", width:"100%", outline:"none", transition:"border-color .18s" },
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

