export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  
  const sig = req.headers["stripe-signature"];
  const secret = "whsec_FXxLheNTFtDKjx3vOwmve2kd2LHdNb1j";
  const body = JSON.stringify(req.body);
  
  try {
    const event = req.body;
    const SB_URL = "https://bipqtqezntzcmxwiaqdz.supabase.co";
    const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzk5MTAsImV4cCI6MjA5NTY1NTkxMH0.OmScmhwC-qOHf1tW81UxHgk0OHpSJvz5NCpktzMa81M";
    
    if (event.type === "payment_intent.succeeded") {
      const email = event.data.object.receipt_email;
      await fetch(SB_URL + "/rest/v1/profiles?email=eq." + email, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "apikey": SB_KEY },
        body: JSON.stringify({ statut_paiement: "actif" })
      });
    }
    
    if (event.type === "payment_intent.payment_failed") {
      const email = event.data.object.receipt_email;
      await fetch(SB_URL + "/rest/v1/profiles?email=eq." + email, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "apikey": SB_KEY },
        body: JSON.stringify({ statut_paiement: "impaye" })
      });
    }
    
    if (event.type === "customer.subscription.deleted") {
      const email = event.data.object.customer_email;
      await fetch(SB_URL + "/rest/v1/profiles?email=eq." + email, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json", "apikey": SB_KEY },
        body: JSON.stringify({ statut_paiement: "expire", pack: null, rdv_restants: 0 })
      });
    }
    
    res.status(200).json({ received: true });
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
}
