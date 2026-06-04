export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const event = req.body;
    const SB = "https://bipqtqezntzcmxwiaqdz.supabase.co";
    const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
    const H = {"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};

    const PACKS = {
      "price_1TclbHRyxerWKxWhTNUQcpsz": {name:"Decouverte", rdv:5,  total:5,  abonnement:false},
      "price_1TclozRyxerWKxWhMKwd8Ar2": {name:"Pro",        rdv:15, total:15, abonnement:true},
      "price_1TclhzRyxerWKxWhph7X0DO1": {name:"Elite",      rdv:30, total:30, abonnement:true}
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email || session.customer_details?.email;
      const priceId = session.line_items?.data?.[0]?.price?.id || session.metadata?.price_id;
      const pack = PACKS[priceId];
      if (email && pack) {
        await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email), {
          method:"PATCH", headers:H,
          body:JSON.stringify({statut_paiement:"actif", pack:pack.name, rdv_restants:pack.rdv, rdv_total:pack.total})
        });
      }
    }

    if (event.type === "invoice.paid") {
      const email = event.data.object.customer_email;
      const priceId = event.data.object.lines?.data?.[0]?.price?.id;
      const pack = PACKS[priceId];
      if (email && pack) {
        await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email), {
          method:"PATCH", headers:H,
          body:JSON.stringify({statut_paiement:"actif", pack:pack.name, rdv_restants:pack.rdv, rdv_total:pack.total})
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const email = event.data.object.customer_email;
      if (email) {
        await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email), {
          method:"PATCH", headers:H,
          body:JSON.stringify({statut_paiement:"expire", pack:null, rdv_restants:0})
        });
      }
    }

    if (event.type === "invoice.payment_failed") {
      const email = event.data.object.customer_email;
      if (email) {
        await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email), {
          method:"PATCH", headers:H,
          body:JSON.stringify({statut_paiement:"impaye"})
        });
      }
    }

    res.status(200).json({received:true});
  } catch(e) {
    res.status(500).json({error:e.message});
  }
}
