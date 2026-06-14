import React from "react";
import { useState } from "react";

export function CalendarPicker({ selected, onChange }) {
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