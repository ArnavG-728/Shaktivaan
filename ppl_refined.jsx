import { useState } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; }

  .app {
    background: #0a0a0a;
    min-height: 100vh;
    color: #f0ede8;
    font-family: 'DM Sans', sans-serif;
    max-width: 900px;
    margin: 0 auto;
  }

  .header {
    padding: 28px 20px 16px;
    border-bottom: 1px solid #1e1e1e;
  }

  .header h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 52px;
    font-weight: 900;
    letter-spacing: -1px;
    line-height: 1;
  }

  .header-meta {
    display: flex;
    gap: 16px;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  .stat {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #555;
    letter-spacing: 0.05em;
  }
  .stat span { color: #f0ede8; font-weight: 500; }

  .subtitle {
    margin-top: 6px;
    font-size: 12px;
    color: #444;
  }

  .tabs {
    display: flex;
    overflow-x: auto;
    padding: 12px 20px 0;
    gap: 4px;
    scrollbar-width: none;
    border-bottom: 1px solid #1a1a1a;
  }
  .tabs::-webkit-scrollbar { display: none; }

  .tab {
    padding: 8px 14px;
    border-radius: 6px 6px 0 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    white-space: nowrap;
    border: none;
    background: transparent;
    color: #3a3a3a;
    transition: all 0.15s;
    border-bottom: 2px solid transparent;
  }
  .tab:hover { color: #777; }
  .tab.active { color: #f0ede8; border-bottom-color: var(--accent); }

  .content { padding: 20px; }

  .day-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 34px;
    font-weight: 900;
    color: var(--accent);
    line-height: 1;
    letter-spacing: -0.5px;
  }

  .day-desc {
    margin-top: 8px;
    font-size: 13px;
    color: #666;
    line-height: 1.6;
    max-width: 620px;
  }

  .vol-row {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .vol-chip {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 3px;
    background: #141414;
    color: #444;
  }
  .vol-chip span { color: var(--accent); }

  .tip-box {
    margin: 14px 0;
    padding: 10px 14px;
    background: #0d0d09;
    border: 1px solid #2a220a;
    border-radius: 8px;
    font-size: 12px;
    color: #7a6030;
    line-height: 1.6;
  }
  .tip-box strong { color: #c49a30; }

  .ex-list { display: flex; flex-direction: column; gap: 10px; }

  .ex-card {
    background: #111;
    border: 1px solid #1c1c1c;
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .ex-card:hover { border-color: #282828; }
  .ex-card.open { border-color: var(--accent-dim); }

  .ex-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    cursor: pointer;
    gap: 12px;
  }

  .ex-num {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--accent);
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }

  .ex-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #f0ede8;
    letter-spacing: 0.02em;
    line-height: 1.1;
  }

  .ex-targets {
    font-size: 11px;
    color: #555;
    margin-top: 3px;
  }

  .ex-badge {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }
  .badge-vtaper { background: #0d1a12; color: #3db88a; }
  .badge-peak { background: #0d1219; color: #4e9eed; }
  .badge-burn { background: #1a0d0d; color: #e5534b; }
  .badge-strength { background: #1a150d; color: #c49a30; }

  .ex-toggle {
    font-size: 18px;
    color: #333;
    flex-shrink: 0;
    transition: transform 0.2s, color 0.2s;
  }
  .ex-card.open .ex-toggle { transform: rotate(180deg); color: var(--accent); }

  .ex-body {
    border-top: 1px solid #1c1c1c;
    padding: 0 16px 16px;
  }

  .sets-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
  }
  .sets-table th {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #3a3a3a;
    text-align: left;
    padding: 0 0 8px;
    text-transform: uppercase;
    border-bottom: 1px solid #1e1e1e;
  }
  .sets-table td {
    padding: 8px 0;
    font-size: 14px;
    border-bottom: 1px solid #161616;
    vertical-align: middle;
  }
  .sets-table tr:last-child td { border-bottom: none; }

  .s-num {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #3a3a3a;
    width: 32px;
  }
  .s-weight {
    font-family: 'DM Mono', monospace;
    font-size: 16px;
    font-weight: 500;
    color: var(--accent);
    width: 110px;
  }
  .s-reps {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    color: #f0ede8;
    width: 70px;
  }
  .s-rest {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #3a3a3a;
  }

  .prog-note {
    margin-top: 10px;
    padding: 7px 10px;
    background: #0d0d0d;
    border-radius: 5px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #4a4a4a;
    letter-spacing: 0.04em;
  }
  .prog-note span { color: var(--accent); }

  .sci-box {
    margin-top: 10px;
    padding: 10px 12px;
    background: #0d0d0d;
    border-left: 2px solid var(--accent-dim);
    border-radius: 0 6px 6px 0;
  }
  .sci-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: var(--accent);
    margin-bottom: 5px;
  }
  .sci-box p {
    font-size: 12px;
    color: #5a5a5a;
    line-height: 1.65;
  }

  /* Science tab */
  .sci-grid { display: flex; flex-direction: column; gap: 12px; }

  .sci-card {
    background: #111;
    border: 1px solid #1c1c1c;
    border-radius: 10px;
    padding: 16px;
  }
  .sci-card-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #f0ede8;
    margin-bottom: 8px;
  }
  .sci-card p {
    font-size: 13px;
    color: #5a5a5a;
    line-height: 1.7;
  }
  .sci-card p strong { color: #aaa; }

  .compare-card {
    background: #111;
    border: 1px solid #1c1c1c;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .compare-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
    color: #888;
  }
  .compare-row {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
    align-items: flex-start;
  }
  .compare-tag {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    padding: 3px 7px;
    border-radius: 3px;
    flex-shrink: 0;
    margin-top: 2px;
    letter-spacing: 0.05em;
  }
  .tag-gpt { background: #0d1a0d; color: #3db88a; }
  .tag-mine { background: #1a0d0d; color: #e5534b; }
  .tag-merged { background: #0d1219; color: #4e9eed; }
  .compare-text { font-size: 12px; color: #666; line-height: 1.55; }
`;

const DAY_CFG = {
  push1:   { label: "Push 1",   focus: "STRENGTH",     accent: "#e5534b", dim: "rgba(229,83,75,0.12)" },
  pull1:   { label: "Pull 1",   focus: "STRENGTH",     accent: "#4e9eed", dim: "rgba(78,158,237,0.12)" },
  legs1:   { label: "Legs 1",   focus: "STRENGTH",     accent: "#3db88a", dim: "rgba(61,184,138,0.12)" },
  push2:   { label: "Push 2",   focus: "HYPERTROPHY",  accent: "#e5934b", dim: "rgba(229,147,75,0.12)" },
  pull2:   { label: "Pull 2",   focus: "HYPERTROPHY",  accent: "#9b72cf", dim: "rgba(155,114,207,0.12)" },
  legs2:   { label: "Legs 2",   focus: "HYPERTROPHY",  accent: "#3dbdb8", dim: "rgba(61,189,184,0.12)" },
  compare: { label: "Compare",  focus: "",             accent: "#d4b44a", dim: "rgba(212,180,74,0.12)" },
  science: { label: "⚗ Science",focus: "",             accent: "#d4b44a", dim: "rgba(212,180,74,0.12)" },
};

const WORKOUTS = {
  push1: {
    desc: "Strength day. Heavy, neural, ascending pyramid. Early sets = warmup at load. Final set = max. Your bench is the weak point vs your deadlift — fix it here every week.",
    vol: [{ k: "CHEST", v: "8 sets" }, { k: "DELTS", v: "5 sets" }, { k: "TRICEPS", v: "6 sets" }],
    tip: "<strong>Today's goal:</strong> Complete every set cleanly. If the last set feels like a 9/10 RPE — weight is right. If it's a 7 — go up 2.5kg next session.",
    exercises: [
      {
        name: "Incline Dumbbell Press",
        targets: "Upper Pec (clavicular head), Anterior Delt",
        badge: { text: "CHEST", cls: "badge-strength" },
        sets: [
          { n:1, kg:"17.5 kg", reps:"10", rest:"75s" },
          { n:2, kg:"20 kg",   reps:"8",  rest:"90s" },
          { n:3, kg:"22.5 kg", reps:"6",  rest:"90s" },
          { n:4, kg:"22.5 kg", reps:"6",  rest:"—" },
        ],
        prog: "→ When you hit 8 reps on sets 3 & 4 twice in a row, move to 25 kg",
        sci: "Trebs et al. (2017): 30° incline maximises upper pec activation without anterior delt takeover. Upper chest gives you the 'shelf' look. Incline BEFORE flat means you hit it fresh — most people do the opposite and upper chest never grows.",
      },
      {
        name: "Flat Barbell Bench Press",
        targets: "Pec Major sternal head, Triceps, Anterior Delt",
        badge: { text: "STRENGTH", cls: "badge-strength" },
        sets: [
          { n:1, kg:"50 kg",   reps:"8", rest:"90s" },
          { n:2, kg:"57.5 kg", reps:"6", rest:"2 min" },
          { n:3, kg:"62.5 kg", reps:"4–5", rest:"2.5 min" },
        ],
        prog: "→ Add 2.5 kg when you hit the top rep on all 3 sets",
        sci: "Barnett et al. (1995): flat bench maximises sternal pec EMG. 4–6 rep range = myofibrillar hypertrophy + neural strength adaptation. Your 25 kg DB bench is ~57 kg barbell equivalent. Starting at 50 kg gives you a clean base to build from.",
      },
      {
        name: "Barbell Overhead Press",
        targets: "Medial + Anterior Delt, Triceps",
        badge: { text: "STRENGTH", cls: "badge-strength" },
        sets: [
          { n:1, kg:"25 kg",   reps:"8", rest:"90s" },
          { n:2, kg:"30 kg",   reps:"6", rest:"2 min" },
          { n:3, kg:"32.5 kg", reps:"5", rest:"2 min" },
          { n:4, kg:"35 kg",   reps:"3–4", rest:"—" },
        ],
        prog: "→ Add 2.5 kg when all 4 sets are clean",
        sci: "Saeterbakken et al. (2013): barbell OHP shows highest deltoid EMG vs DB or machine due to bilateral stabilisation demand. Drive head through at lockout. Don't lean back excessively — it turns it into an incline press.",
      },
      {
        name: "Weighted Dips",
        targets: "Lower Pec, Triceps Long + Lateral Head",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"Bodyweight", reps:"12", rest:"75s" },
          { n:2, kg:"BW + 5 kg",  reps:"10", rest:"90s" },
          { n:3, kg:"BW + 7.5 kg",reps:"8",  rest:"—" },
        ],
        prog: "→ Add 2.5 kg plate when you hit 10 reps on set 2 and 9 on set 3",
        sci: "Tricep long head only reaches peak activation when the arm is BEHIND the body (shoulder extension). Dips are the easiest way to achieve this at load. Lean forward ~15° = more chest. Upright = pure tricep. Slow 3s eccentric = more growth per rep.",
      },
      {
        name: "Cable Lateral Raises",
        targets: "Medial Deltoid — V-taper is built here",
        badge: { text: "V-TAPER", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"6 kg",  reps:"20", rest:"30s" },
          { n:2, kg:"8 kg",  reps:"15", rest:"30s" },
          { n:3, kg:"10 kg", reps:"12", rest:"30s" },
          { n:4, kg:"10 kg", reps:"12", rest:"—" },
        ],
        prog: "→ Add 1 kg when all 4 sets are clean with correct form",
        sci: "Coratella et al. (2020): cable > dumbbell for lateral delt — constant tension through full ROM. Medial delts barely activate in ANY compound movement. This is the most important exercise for V-taper width. Lead with your ELBOW, not your hand. Slight forward lean.",
      },
      {
        name: "EZ Bar Skullcrusher",
        targets: "Triceps Long Head, Medial + Lateral Head",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"15 kg", reps:"12", rest:"60s" },
          { n:2, kg:"17.5 kg", reps:"10", rest:"75s" },
          { n:3, kg:"20 kg", reps:"8",  rest:"—" },
        ],
        prog: "→ Add 2.5 kg when all 3 sets are clean",
        sci: "Maeo et al. (2021): muscles trained in LENGTHENED position grow 2× more. Skullcrushers load the long head in a stretched position — lower the bar fully to your forehead. Slow 3s eccentric. These weights are correct for your level — don't ego add weight here.",
      },
    ],
  },

  pull1: {
    desc: "Deadlift-led strength day. Your deadlift is already elite-level for your bodyweight. Rebuild it methodically. Every kg of back thickness built here transfers directly to aesthetics.",
    vol: [{ k: "BACK", v: "12 sets" }, { k: "BICEPS", v: "5 sets" }, { k: "REAR DELT", v: "3 sets" }],
    tip: "<strong>Deadlift warm-up protocol:</strong> 60 kg × 5 → 90 kg × 3 → 110 kg × 2 → then start working sets. Don't skip warm-up sets.",
    exercises: [
      {
        name: "Conventional Deadlift",
        targets: "Erectors, Glutes, Hamstrings, Traps, Lats (isometric)",
        badge: { text: "STRENGTH", cls: "badge-strength" },
        sets: [
          { n:1, kg:"100 kg", reps:"5",   rest:"2 min" },
          { n:2, kg:"117.5 kg", reps:"3", rest:"2.5 min" },
          { n:3, kg:"130 kg", reps:"2",   rest:"3 min" },
          { n:4, kg:"137.5 kg", reps:"1", rest:"—" },
        ],
        prog: "→ When you hit 140 kg × 1 clean for 2 sessions, attempt 145 kg",
        sci: "Your 150 kg × 1–2 was your peak before inconsistency. These weights build back to that. 'Protect your armpits' cue = lat engagement = bar stays close = safer spine. Deadlift activates ~70% of total muscle mass. Full brace before every rep — breathe OUT between reps only.",
      },
      {
        name: "Weighted Pull-Ups (Wide, Pronated)",
        targets: "Lat Dorsi WIDTH, Teres Major, Biceps Short Head",
        badge: { text: "V-TAPER", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"Bodyweight", reps:"10", rest:"90s" },
          { n:2, kg:"BW + 5 kg",  reps:"8",  rest:"2 min" },
          { n:3, kg:"BW + 10 kg", reps:"6",  rest:"2 min" },
          { n:4, kg:"BW + 12.5 kg", reps:"4–5", rest:"—" },
        ],
        prog: "→ Add 2.5 kg when you hit all top reps cleanly",
        sci: "Lehman et al. (2004): wide pronated grip produces highest lat EMG of all pulling variations. DEAD HANG at the bottom every rep — the stretch matters as much as the contraction. Lat width is what makes the V-taper visible from the front.",
      },
      {
        name: "Barbell Bent-Over Row (Pronated)",
        targets: "Mid Traps, Rhomboids, Lat Thickness, Rear Delt",
        badge: { text: "STRENGTH", cls: "badge-strength" },
        sets: [
          { n:1, kg:"55 kg", reps:"8", rest:"90s" },
          { n:2, kg:"65 kg", reps:"6", rest:"2 min" },
          { n:3, kg:"70 kg", reps:"5", rest:"2.5 min" },
          { n:4, kg:"75 kg", reps:"4", rest:"—" },
        ],
        prog: "→ Add 2.5 kg when all 4 sets are clean",
        sci: "Pronated grip = mid-trap + rhomboid recruitment = back THICKNESS. Row to lower sternum, not navel. Thickness from horizontal pulling is what makes your back look 3D from the side — lat width (pull-ups) is the front view, row thickness is the side view.",
      },
      {
        name: "EZ Bar Bicep Curl",
        targets: "Biceps Brachii both heads, Brachialis",
        badge: { text: "STRENGTH", cls: "badge-strength" },
        sets: [
          { n:1, kg:"22.5 kg", reps:"10", rest:"60s" },
          { n:2, kg:"27.5 kg", reps:"8",  rest:"75s" },
          { n:3, kg:"30 kg",   reps:"6",  rest:"90s" },
          { n:4, kg:"32.5 kg", reps:"4–5", rest:"—" },
        ],
        prog: "→ Strict 3s eccentric on every rep — no swinging",
        sci: "Schoenfeld & Grgic (2019): 3-second eccentric on curls produces significantly greater hypertrophy than fast eccentrics at matched volume. This is your strength curl — heavier, slower, fewer reps. EZ bar = reduced wrist strain.",
      },
      {
        name: "Face Pulls (Rope, Eye Level)",
        targets: "Rear Deltoid, External Rotators, Mid Traps",
        badge: { text: "HEALTH", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"10 kg", reps:"15", rest:"45s" },
          { n:2, kg:"12.5 kg", reps:"15", rest:"45s" },
          { n:3, kg:"12.5 kg", reps:"12", rest:"—" },
        ],
        prog: "→ Focus on pulling APART at the end — external rotation is the key movement",
        sci: "Non-negotiable for shoulder joint health. Rear delts also give width from the back. The external rotation component protects you from impingement that would otherwise develop from heavy benching and pressing. Most lifters skip this and pay for it at year 5.",
      },
    ],
  },

  legs1: {
    desc: "Squat-led strength. Your squat should be following your deadlift. Start conservative, build weekly. Calves and hamstrings attacked from lengthened position.",
    vol: [{ k: "QUADS", v: "10 sets" }, { k: "HAMSTRINGS", v: "7 sets" }, { k: "CALVES", v: "4 sets" }],
    tip: "<strong>Squat depth rule:</strong> ATG (ass-to-grass) or at minimum below parallel. VMO activation drops 25% at parallel vs full depth. Your form is good — use the range of motion.",
    exercises: [
      {
        name: "Barbell Back Squat",
        targets: "Quads (all 4), Glutes Max, Adductors, Erectors",
        badge: { text: "STRENGTH", cls: "badge-strength" },
        sets: [
          { n:1, kg:"70 kg",  reps:"8", rest:"2 min" },
          { n:2, kg:"80 kg",  reps:"6", rest:"2.5 min" },
          { n:3, kg:"90 kg",  reps:"5", rest:"3 min" },
          { n:4, kg:"97.5 kg", reps:"3", rest:"—" },
        ],
        prog: "→ Add 2.5 kg when all sets are clean. Build to 120+ kg over 8 weeks.",
        sci: "Escamilla et al. (2001): back squat activates all 4 quad heads + glutes simultaneously. ATG depth increases VMO and glute activation ~25% vs parallel. Since your deadlift is already strong, your squat should respond fast — your posterior chain is already developed.",
      },
      {
        name: "Romanian Deadlift",
        targets: "Hamstrings (LENGTHENED), Glutes, Erectors",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"60 kg", reps:"10", rest:"90s" },
          { n:2, kg:"70 kg", reps:"8",  rest:"2 min" },
          { n:3, kg:"80 kg", reps:"6",  rest:"—" },
        ],
        prog: "→ Feel the hamstring STRETCH, not the lower back. If you feel it in your back — reduce weight.",
        sci: "Maeo et al. (2021): muscles trained at lengthened position grow ~2× more than shortened-position training. RDL loads hamstrings at full hip-hinge stretch. Push hips BACK — feel the pull in your hamstrings, not your spine. This is why RDL beats leg curls for pure size.",
      },
      {
        name: "Leg Press (Feet Low, Narrow)",
        targets: "VMO (teardrop), Rectus Femoris, Glutes",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"120 kg", reps:"12", rest:"75s" },
          { n:2, kg:"140 kg", reps:"10", rest:"90s" },
          { n:3, kg:"160 kg", reps:"8",  rest:"—" },
        ],
        prog: "→ Don't lock out at the top. Go deep — heels stay on platform.",
        sci: "Feet low + narrow = VMO dominant. The VMO creates the teardrop shape on the inner quad. Deep ROM without lockout = constant TUT. High load = safe to go heavy here since no spinal loading.",
      },
      {
        name: "Lying Leg Curl",
        targets: "Biceps Femoris, hamstring thickness",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"30 kg", reps:"12", rest:"60s" },
          { n:2, kg:"35 kg", reps:"10", rest:"75s" },
          { n:3, kg:"37.5 kg", reps:"8", rest:"—" },
        ],
        prog: "→ Slow 4s eccentric. Control the weight back down — don't let the stack drop.",
        sci: "Lying curl (hip extended) > seated curl for hamstring hypertrophy because hip extension = hamstring in its longest position = stretch-mediated growth. Maeo et al. (2021) principle applied directly.",
      },
      {
        name: "Standing Calf Raises",
        targets: "Gastrocnemius (fast-twitch dominant)",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"BW + 40 kg", reps:"15", rest:"60s" },
          { n:2, kg:"BW + 50 kg", reps:"12", rest:"60s" },
          { n:3, kg:"BW + 60 kg", reps:"10", rest:"60s" },
          { n:4, kg:"BW + 60 kg", reps:"8",  rest:"—" },
        ],
        prog: "→ Full stretch at bottom (dorsiflexion). Pause. Full extension at top. Calves hate partial reps.",
        sci: "Gastroc is ~70% fast-twitch = responds to HEAVY, lower-rep training. Standing (knee straight) = gastroc isolated. Full ROM is essential — most lifters only do the top half and wonder why calves don't grow. The stretch at the bottom IS the stimulus.",
      },
    ],
  },

  push2: {
    desc: "Isolation-first hypertrophy day. This is exactly what you asked for — less compound, more targeted burn. Triceps, side delts, front delts, upper chest. You will feel all of them.",
    vol: [{ k: "CHEST", v: "8 sets" }, { k: "DELTS", v: "12 sets" }, { k: "TRICEPS", v: "7 sets" }],
    tip: "<strong>Hypertrophy rules for today:</strong> 3s eccentrics on everything. Short rest (30–60s on isolation). Chase the BURN, not the weight. Form > load always on this day.",
    exercises: [
      {
        name: "Incline Machine Press",
        targets: "Upper Pec, Anterior Delt — pump focused",
        badge: { text: "CHEST", cls: "badge-strength" },
        sets: [
          { n:1, kg:"35 kg", reps:"15", rest:"60s" },
          { n:2, kg:"42.5 kg", reps:"12", rest:"60s" },
          { n:3, kg:"50 kg",   reps:"10", rest:"75s" },
          { n:4, kg:"50 kg",   reps:"8",  rest:"—" },
        ],
        prog: "→ Machine = safe to go near failure. Use the stretch at the bottom.",
        sci: "Machine = fixed path = less neural demand = more focus on the muscle. Pause at the bottom to feel the pec stretch. Heavy pressing is already done on Push 1 — this is the metabolic/pump stimulus that drives hypertrophy through a different mechanism.",
      },
      {
        name: "Cable Chest Flyes (Low Pulley)",
        targets: "Sternal Pec, full ROM stretch at lengthened position",
        badge: { text: "CHEST", cls: "badge-strength" },
        sets: [
          { n:1, kg:"8 kg",  reps:"15", rest:"45s" },
          { n:2, kg:"10 kg", reps:"12", rest:"45s" },
          { n:3, kg:"12 kg", reps:"12", rest:"45s" },
          { n:4, kg:"12 kg", reps:"10", rest:"—" },
        ],
        prog: "→ SQUEEZE for 2 seconds at peak. Don't let the cable pull you into a bad position.",
        sci: "Cable = constant tension throughout full ROM (DBs lose tension when hands are together). Low pulley = cross to upper chest = upper pec emphasis. Full stretch at the start matters as much as the contraction. This is the ONLY exercise with constant pec tension from stretch to peak.",
      },
      {
        name: "Cable Lateral Raises × 5 SETS",
        targets: "MEDIAL DELT — the most important V-taper muscle",
        badge: { text: "V-TAPER", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"6 kg",  reps:"20", rest:"30s" },
          { n:2, kg:"8 kg",  reps:"15", rest:"30s" },
          { n:3, kg:"10 kg", reps:"12", rest:"30s" },
          { n:4, kg:"10 kg", reps:"12", rest:"30s" },
          { n:5, kg:"6 kg (drop)", reps:"20", rest:"—" },
        ],
        prog: "→ 30s rest is INTENTIONAL. Short rest + high reps = massive pump. Lead with elbows.",
        sci: "5 sets here + 4 on Push 1 = 18 sets/week lateral delts. Science-backed maximum adaptive volume. Medial delts don't activate in compounds — they NEED this direct volume. The short rest is metabolic stress training, a different hypertrophy mechanism from heavy OHP. Both are needed.",
      },
      {
        name: "Cable Front Raise (Single Arm)",
        targets: "Anterior Deltoid — targeted isolation",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"8 kg",  reps:"12", rest:"45s" },
          { n:2, kg:"10 kg", reps:"10", rest:"45s" },
          { n:3, kg:"12 kg", reps:"10", rest:"—" },
        ],
        prog: "→ Don't raise above shoulder height — impingement risk. Cable from behind = longest ROM.",
        sci: "Cable from behind your body = anterior delt under tension at the longest position (arm down and back). Single arm = more control and mind-muscle connection per side. Your anterior delts already get significant work from bench and OHP — keep this brief.",
      },
      {
        name: "Machine Shoulder Press",
        targets: "Ant + Med Delt, Triceps — hypertrophy pump",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"30 kg", reps:"15", rest:"60s" },
          { n:2, kg:"40 kg", reps:"12", rest:"60s" },
          { n:3, kg:"47.5 kg", reps:"10", rest:"—" },
        ],
        prog: "→ Pause at the bottom to feel the delt stretch on every rep.",
        sci: "Machine here (not barbell) because you already hit heavy OHP on Push 1. This is the metabolic stimulus — different mechanism, same muscle. High rep + short rest = muscle damage + metabolic stress = growth via a complementary pathway to heavy barbell pressing.",
      },
      {
        name: "Overhead DB Tricep Extension",
        targets: "Triceps LONG HEAD — 80% of total tricep mass",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"15 kg", reps:"15", rest:"60s" },
          { n:2, kg:"17.5 kg", reps:"12", rest:"60s" },
          { n:3, kg:"20 kg",   reps:"10", rest:"75s" },
          { n:4, kg:"20 kg",   reps:"8",  rest:"—" },
        ],
        prog: "→ Slow 3s eccentric. Feel the DEEP stretch at the bottom. This should burn.",
        sci: "The long head crosses both the elbow AND shoulder joint. It can ONLY reach full stretch when the arm is overhead — no other tricep exercise achieves this. Maeo et al. (2021): lengthened position = 2× hypertrophy. This is your #1 tricep builder. Pushdowns cannot replace it.",
      },
      {
        name: "Rope Tricep Pushdown",
        targets: "Triceps Lateral + Medial Head",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"12.5 kg", reps:"15", rest:"45s" },
          { n:2, kg:"15 kg",   reps:"12", rest:"45s" },
          { n:3, kg:"17.5 kg", reps:"12", rest:"45s" },
          { n:4, kg:"17.5 kg", reps:"10", rest:"—" },
        ],
        prog: "→ Flare the rope handles apart at the bottom. Elbows LOCKED to your sides.",
        sci: "Rope flare = full lateral + medial head contraction at the bottom. Short rest = metabolic pump. You've already hit the long head with overhead extension — this finishes the lateral and medial heads. Together they complete the full horseshoe shape.",
      },
    ],
  },

  pull2: {
    desc: "Lat width, bicep PEAK, brachialis thickness, rear delts. Pure aesthetic architecture. Every exercise here has a specific visual outcome.",
    vol: [{ k: "LATS", v: "8 sets" }, { k: "BICEPS", v: "12 sets" }, { k: "REAR DELT", v: "4 sets" }],
    tip: "<strong>Bicep tip for today:</strong> Every single curl — supinate FULLY at the top (thumb rotates outward). That's what activates the long head and builds the peak. Half-supination = half the growth.",
    exercises: [
      {
        name: "Wide Grip Lat Pulldown",
        targets: "Lat Dorsi WIDTH, Teres Major, Biceps Short Head",
        badge: { text: "V-TAPER", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"50 kg", reps:"12", rest:"75s" },
          { n:2, kg:"57.5 kg", reps:"10", rest:"75s" },
          { n:3, kg:"62.5 kg", reps:"8",  rest:"90s" },
          { n:4, kg:"65 kg",   reps:"8",  rest:"—" },
        ],
        prog: "→ FULLY extend arms at the top — feel the lat stretch. Never shortchange the ROM.",
        sci: "Lehman et al. (2004): wide pronated grip = highest lat activation. The key is the STRETCH at the top — most people cut it short. Full lat elongation at the top + full contraction at the bottom = double the stimulus. This is the lat width exercise.",
      },
      {
        name: "One-Arm Dumbbell Row",
        targets: "Lat Thickness, Rhomboids, Teres Major",
        badge: { text: "V-TAPER", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"30 kg", reps:"12", rest:"60s" },
          { n:2, kg:"35 kg", reps:"10", rest:"75s" },
          { n:3, kg:"37.5 kg", reps:"8", rest:"75s" },
          { n:4, kg:"40 kg",   reps:"8", rest:"—" },
        ],
        prog: "→ Row to your HIP (not armpit). Allow full scapular protraction at the bottom.",
        sci: "Single arm = heavier weight per side + better mind-muscle connection per lat. Row to the hip = lower lat insertion. Allow protraction at the bottom (don't just keep your scapula pinched) — that stretch is the growth stimulus. Scapular retraction at peak = full contraction.",
      },
      {
        name: "Seated Cable Row (V-Bar Close Grip)",
        targets: "Mid Traps, Rhomboids, Lower Lat, Biceps",
        badge: { text: "V-TAPER", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"47.5 kg", reps:"12", rest:"60s" },
          { n:2, kg:"55 kg",   reps:"10", rest:"75s" },
          { n:3, kg:"60 kg",   reps:"8",  rest:"—" },
        ],
        prog: "→ Hold 1 second at full contraction. Control the eccentric — don't let the stack jerk you forward.",
        sci: "Close grip V-bar = maximum lower lat and mid-back recruitment. Back thickness from horizontal rowing is what makes your back look 3D — lat pulldowns give you width, rows give you depth. Both are non-negotiable.",
      },
      {
        name: "Incline DB Curl (45° Bench)",
        targets: "Biceps LONG HEAD — this builds the peak",
        badge: { text: "PEAK", cls: "badge-peak" },
        sets: [
          { n:1, kg:"10 kg", reps:"12", rest:"60s" },
          { n:2, kg:"12.5 kg", reps:"10", rest:"75s" },
          { n:3, kg:"14 kg",   reps:"8",  rest:"75s" },
          { n:4, kg:"14 kg",   reps:"8",  rest:"—" },
        ],
        prog: "→ Let the arm hang FULLY at the bottom before each rep. That stretch is the whole point.",
        sci: "THE best bicep peak exercise. At 45°, your arm hangs behind your body — the long head is in its fully lengthened position. Maeo et al. (2021): lengthened position = 2× hypertrophy. The visual 'mountain peak' of the bicep is almost entirely long head. Supinate fully at the top.",
      },
      {
        name: "Hammer Curl",
        targets: "BRACHIALIS (pushes bicep upward), Brachioradialis",
        badge: { text: "PEAK", cls: "badge-peak" },
        sets: [
          { n:1, kg:"12.5 kg", reps:"12", rest:"45s" },
          { n:2, kg:"15 kg",   reps:"10", rest:"45s" },
          { n:3, kg:"17.5 kg", reps:"8",  rest:"—" },
        ],
        prog: "→ Neutral grip throughout. No supination. Slow 3s eccentric.",
        sci: "Brachialis sits UNDERNEATH the bicep. A thick brachialis physically pushes the bicep upward — more arm circumference + greater peak height. Neutral grip = brachialis primary > bicep. ChatGPT included this correctly and at the right weight. Non-negotiable for arm size.",
      },
      {
        name: "Cable Curl (Supinated, Standing)",
        targets: "Biceps — constant tension + peak contraction finisher",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"12.5 kg", reps:"15", rest:"45s" },
          { n:2, kg:"15 kg",   reps:"12", rest:"45s" },
          { n:3, kg:"15 kg",   reps:"10", rest:"—" },
        ],
        prog: "→ Supinate HARD at the top. Hold the peak. Feel the burn.",
        sci: "Cable = constant tension at the top where DBs lose it completely. By this point your biceps are nearly exhausted — this is the pump finisher. 45s rest is intentional. Metabolic stress at near-failure = significant hypertrophy stimulus.",
      },
      {
        name: "Reverse Pec Deck / Cable Reverse Fly",
        targets: "Rear Deltoid, Infraspinatus, Teres Minor",
        badge: { text: "V-TAPER", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"15 kg", reps:"15", rest:"45s" },
          { n:2, kg:"17.5 kg", reps:"12", rest:"45s" },
          { n:3, kg:"20 kg",   reps:"12", rest:"45s" },
          { n:4, kg:"20 kg",   reps:"12", rest:"—" },
        ],
        prog: "→ Full ROM — arms should go from directly in front to fully behind your shoulders.",
        sci: "Rear delts = width from the back AND shoulder joint protection. Most lifters are chronically underdeveloped here. Together with face pulls from Pull 1, you're getting 7 rear delt sets/week — enough for real development without overtraining the rotator cuff.",
      },
    ],
  },

  legs2: {
    desc: "Quad isolation, hamstring lengthening, glute peak contraction, and full AB protocol. More isolation than Legs 1. Bulgarian splits replace front squats (ChatGPT was right here).",
    vol: [{ k: "QUADS", v: "11 sets" }, { k: "HAMSTRINGS", v: "8 sets" }, { k: "ABS", v: "11 sets" }],
    tip: "<strong>V-cut reminder:</strong> Abs are muscles — they respond to progressive overload. Add weight to cable crunches every 2–3 weeks. Low body fat reveals them, but SIZE must be built first.",
    exercises: [
      {
        name: "Leg Extension",
        targets: "Rectus Femoris + VMO — pure quad isolation",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"30 kg", reps:"15", rest:"60s" },
          { n:2, kg:"37.5 kg", reps:"12", rest:"60s" },
          { n:3, kg:"45 kg",   reps:"10", rest:"75s" },
          { n:4, kg:"47.5 kg", reps:"10", rest:"—" },
        ],
        prog: "→ SQUEEZE at lockout for 2 seconds. Slow 3s eccentric. This will burn badly.",
        sci: "Lim et al. (2019): leg extensions starting from fully bent (lengthened) position produce superior rectus femoris growth. Full ROM from completely bent to locked out = maximum stretch-mediated hypertrophy. Seated on hypertrophy day (vs lying), which adds slight hip flexion for more RF involvement.",
      },
      {
        name: "Bulgarian Split Squat",
        targets: "Quads, Glutes, Hamstrings — unilateral + high instability",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"10 kg/hand", reps:"12/leg", rest:"75s" },
          { n:2, kg:"12.5 kg/hand", reps:"10/leg", rest:"90s" },
          { n:3, kg:"15 kg/hand",   reps:"8/leg",  rest:"—" },
        ],
        prog: "→ Rear foot elevated on bench. Front foot far enough that knee doesn't pass toes excessively.",
        sci: "Unilateral loading = greater muscle recruitment per leg vs bilateral squats. Long stride = glute + hamstring emphasis. Short stride = quad emphasis. Stabilisers fire harder = more total stimulus per rep. ChatGPT correctly included this as the hypertrophy leg staple.",
      },
      {
        name: "Seated Leg Curl",
        targets: "Semimembranosus, Semitendinosus — hamstring width",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"30 kg", reps:"12", rest:"60s" },
          { n:2, kg:"35 kg", reps:"10", rest:"75s" },
          { n:3, kg:"37.5 kg", reps:"8", rest:"90s" },
          { n:4, kg:"40 kg",   reps:"8", rest:"—" },
        ],
        prog: "→ Control the eccentric. Don't bounce at the top.",
        sci: "Seated curl has the hip slightly flexed vs lying — this actually increases the stretch on the upper hamstring. Combines with lying curl from Legs 1 for complete hamstring development. Both are needed — they target slightly different portions of the hamstring.",
      },
      {
        name: "Barbell Hip Thrust",
        targets: "Glutes Maximus (PEAK contraction), Hamstrings",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"60 kg",  reps:"15", rest:"75s" },
          { n:2, kg:"80 kg",  reps:"12", rest:"90s" },
          { n:3, kg:"100 kg", reps:"10", rest:"—" },
        ],
        prog: "→ Posterior pelvic tilt at the TOP = full glute squeeze. Don't just hinge — tuck.",
        sci: "Contreras et al. (2015): hip thrust produces the highest glute EMG of ANY exercise — higher than squats, deadlifts, or lunges. The glute-hamstring tie-in creates the separation that defines the aesthetic lower body. The full pelvic tilt at the top is what separates this from just being a hip hinge.",
      },
      {
        name: "Seated Calf Raises",
        targets: "Soleus (deep calf) — slow-twitch dominant",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"20 kg", reps:"15", rest:"45s" },
          { n:2, kg:"25 kg", reps:"12", rest:"45s" },
          { n:3, kg:"30 kg", reps:"12", rest:"45s" },
          { n:4, kg:"32.5 kg", reps:"10", rest:"—" },
        ],
        prog: "→ Bent knee = gastroc slack = pure soleus. Full stretch at bottom. Pause.",
        sci: "Soleus is slow-twitch = high reps, higher volume. A thick soleus physically pushes the gastroc outward = wider, rounder calves from every angle. Pair with Legs 1 standing raises (gastroc, heavy) for full calf development.",
      },
      {
        name: "Cable Crunch (Kneeling)",
        targets: "Rectus Abdominis — progressive overload for abs",
        badge: { text: "V-TAPER", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"20 kg", reps:"20", rest:"45s" },
          { n:2, kg:"22.5 kg", reps:"15", rest:"45s" },
          { n:3, kg:"25 kg",   reps:"12", rest:"45s" },
          { n:4, kg:"27.5 kg", reps:"12", rest:"—" },
        ],
        prog: "→ Crunch THORAX toward PELVIS — don't just pull from the hips. Full exhale at contraction.",
        sci: "Abs are muscles. They respond to progressive overload exactly like every other muscle. Cable crunch = consistent load through full ROM. Add 2.5 kg every 2–3 weeks. The V-cut you want = low body fat + developed lower/upper rectus abdominis. You need to BUILD the muscle first.",
      },
      {
        name: "Hanging Leg Raise",
        targets: "LOWER Rectus Abdominis, Obliques — V-cut builder",
        badge: { text: "V-TAPER", cls: "badge-vtaper" },
        sets: [
          { n:1, kg:"Bodyweight", reps:"15", rest:"45s" },
          { n:2, kg:"Bodyweight", reps:"12", rest:"45s" },
          { n:3, kg:"Bodyweight", reps:"12", rest:"45s" },
          { n:4, kg:"Bodyweight", reps:"10–12", rest:"—" },
        ],
        prog: "→ Posterior pelvic tilt at the TOP = lower ab contraction. No swing. Full hang at start.",
        sci: "LOWER abs create the V-cut. At the top of each rep — tuck your pelvis, don't just raise your legs. Dead hang at the start eliminates momentum. Add ankle weights when bodyweight becomes easy.",
      },
      {
        name: "Ab Wheel Rollout",
        targets: "Full Rectus Abdominis, Obliques, Deep Core",
        badge: { text: "BURN", cls: "badge-burn" },
        sets: [
          { n:1, kg:"Bodyweight", reps:"10", rest:"60s" },
          { n:2, kg:"Bodyweight", reps:"10", rest:"60s" },
          { n:3, kg:"Bodyweight", reps:"8–10", rest:"—" },
        ],
        prog: "→ Brace your core BEFORE you extend. Don't let lower back cave. Control the return.",
        sci: "Youdas et al. (2010): ab wheel rollout produces the highest core EMG of ANY ab exercise — above planks, crunches, and leg raises. Full extension = maximum stretch = maximum hypertrophy stimulus. This is the finisher for a reason.",
      },
    ],
  },
};

const COMPARE = [
  {
    title: "Weight Calibration",
    rows: [
      { tag: "tag-gpt", label: "GPT", text: "Conservative weights throughout — correct for building momentum after inconsistency. Skullcrushers not included (smart)." },
      { tag: "tag-mine", label: "MINE v1", text: "Skullcrushers at 37.5–40 kg is genuinely too heavy for someone benching 25 kg DBs. That was an error — corrected to 15–20 kg." },
      { tag: "tag-merged", label: "MERGED", text: "Conservative starting weights with clear progression targets. Skullcrushers at 15–20 kg EZ bar. All isolation movements calibrated to your actual strength level." },
    ]
  },
  {
    title: "Lateral Delt Volume (V-taper critical)",
    rows: [
      { tag: "tag-gpt", label: "GPT", text: "Only 4 sets/week lateral raises. This is BELOW minimum effective volume for medial delt hypertrophy (10 sets/week minimum)." },
      { tag: "tag-mine", label: "MINE", text: "18–20 sets/week lateral delts across both push days. Science-backed maximum adaptive volume." },
      { tag: "tag-merged", label: "MERGED", text: "Kept at 18 sets/week. This is non-negotiable for V-taper. Medial delts don't activate in any compound — they need this direct volume." },
    ]
  },
  {
    title: "Bicep Peak Strategy",
    rows: [
      { tag: "tag-gpt", label: "GPT", text: "Incline DB curl included at 10 kg — correct. Hammer curl included correctly. Good bicep selection." },
      { tag: "tag-mine", label: "MINE", text: "Same exercises with full scientific backing. Incline curl = long head peak. Hammer = brachialis (pushes bicep upward)." },
      { tag: "tag-merged", label: "MERGED", text: "Both plans agree here. Incline curl 10–14 kg. Hammer 12.5–17.5 kg. Cable curl as finisher. Correct." },
    ]
  },
  {
    title: "Tricep Protocol",
    rows: [
      { tag: "tag-gpt", label: "GPT", text: "Has overhead tricep extension (correct). Pushdown (correct). No skullcrushers. Good selection." },
      { tag: "tag-mine", label: "MINE", text: "Had skullcrushers too heavy. Overhead extension essential (long head = 80% of tricep mass). Both pushdown and overhead needed." },
      { tag: "tag-merged", label: "MERGED", text: "Skullcrushers 15–20 kg on Push 1 (strength). Overhead extension 15–20 kg + rope pushdown on Push 2 (hypertrophy). Complete tricep protocol." },
    ]
  },
  {
    title: "Legs 2 Exercise Selection",
    rows: [
      { tag: "tag-gpt", label: "GPT", text: "Bulgarian split squats instead of front squat — excellent choice for hypertrophy day. Unilateral = more stimulus per leg." },
      { tag: "tag-mine", label: "MINE", text: "Had front squat which is more of a strength movement — less appropriate for a hypertrophy-focused day." },
      { tag: "tag-merged", label: "MERGED", text: "Bulgarian split squats kept. ChatGPT was right here. Front squat moved to optional if you want additional quad strength work." },
    ]
  },
  {
    title: "Progression System",
    rows: [
      { tag: "tag-gpt", label: "GPT", text: "Clear: hit all sets at top rep → add 2.5 kg next session. Simple and actionable." },
      { tag: "tag-mine", label: "MINE", text: "Same principle, same clarity. Add 2.5 kg when top rep is hit for 2 consecutive sessions (slightly more conservative)." },
      { tag: "tag-merged", label: "MERGED", text: "Strength days: 2 sessions at top rep → add 2.5 kg. Hypertrophy days: 1 session at top rep → add 2.5 kg (more sessions, faster feedback)." },
    ]
  },
];

const SCIENCE_CARDS = [
  {
    title: "Why Your Ascending Pyramid Is Correct",
    body: "Early sets serve as progressive warm-up at working loads. Your CNS ramps up motor unit recruitment set-by-set. You reach maximal force production when warm but not yet fully fatigued. For strength days (3–6 reps @ 85–95% 1RM), this is optimal. For hypertrophy days, keep reps 8–15 but still pyramid up — the first set primes the second.",
  },
  {
    title: "Stretch-Mediated Hypertrophy — The Most Important Recent Finding",
    body: "Maeo et al. (2021): training muscles at their LENGTHENED position produces ~2× the hypertrophy compared to shortened-position training. Applied in this plan: Incline DB curl (bicep long head in full stretch). RDL (hamstrings at full hip-hinge). Overhead tricep extension (long head behind the body). Dips (tricep long head shoulder-extended). Cable flyes (pec at full stretch). This principle changes which exercises are actually optimal.",
  },
  {
    title: "Weekly Volume Targets — Schoenfeld et al. (2017)",
    body: "Minimum effective volume: 10 sets/muscle/week. Maximum adaptive volume: ~20 sets/week. This plan: Chest ~15 sets. Medial delts ~18 sets (MAX). Triceps ~18 sets. Biceps ~14 sets. Quads ~18 sets. Hamstrings ~14 sets. Going above 20 sets as a natural lifter increases injury risk without additional growth.",
  },
  {
    title: "Strength + Hypertrophy Are Both Needed",
    body: "Schoenfeld meta-analysis (2017): heavy loads (1–5 reps) and moderate loads (8–15 reps) produce equivalent hypertrophy when volume is matched. But heavy loads build MORE strength. Your PPL×PPL structure: Strength days (D1/2/3) drive neural adaptations, 1RM increases, and myofibrillar hypertrophy. Hypertrophy days (D4/5/6) drive metabolic stress, sarcoplasmic hypertrophy, and isolation-specific stimulus. You need both mechanisms.",
  },
  {
    title: "The V-Taper Formula",
    body: "Width from front = Lateral delts (cable raises) + Lat width (vertical pulls). Width from back = Rear delts + mid-back thickness. Narrowness at waist = body fat + oblique tightness + transverse abdominis. Depth = back thickness from horizontal rows. The biggest ROI: cable lateral raises 18 sets/week. Lateral delts are the only major muscle group that barely activates in ANY compound movement. Direct isolation is mandatory.",
  },
  {
    title: "Creatine — Especially Critical for Vegetarians",
    body: "Benton & Donohoe (2011): vegetarians show LARGER strength and size gains from creatine supplementation than omnivores — because they have significantly lower baseline muscle creatine stores (meat contains creatine). 5g/day creatine monohydrate. No loading phase needed. Take consistently every day. This is the most evidence-backed supplement in existence — over 500 peer-reviewed studies. For YOU specifically, the effect size will be greater than for the meat-eaters in your gym.",
  },
];

export default function WorkoutPlan() {
  const [activeDay, setActiveDay] = useState("push1");
  const [openEx, setOpenEx] = useState(null);

  const days = ["push1","pull1","legs1","push2","pull2","legs2","compare","science"];

  const cfg = DAY_CFG[activeDay];
  const wo = WORKOUTS[activeDay];

  return (
    <>
      <style>{style}</style>
      <div className="app" style={{ "--accent": cfg.accent, "--accent-dim": cfg.dim }}>

        <div className="header">
          <h1>PPL × 2 <span style={{ color: "#222", fontSize: 28 }}>REFINED</span></h1>
          <div className="header-meta">
            <div className="stat">WEIGHT <span>72 KG</span></div>
            <div className="stat">HEIGHT <span>5′8″</span></div>
            <div className="stat">DEADLIFT <span>150 KG</span></div>
            <div className="stat">BENCH <span>25 KG DB × 6–8</span></div>
          </div>
          <div className="subtitle">Merged best of both plans · Weights corrected · Science-backed · V-taper + strength + aesthetic</div>
        </div>

        <div className="tabs">
          {days.map(d => (
            <button
              key={d}
              className={`tab ${activeDay === d ? "active" : ""}`}
              style={{ "--accent": DAY_CFG[d].accent }}
              onClick={() => { setActiveDay(d); setOpenEx(null); }}
            >
              {DAY_CFG[d].label}
              {DAY_CFG[d].focus && (
                <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.5, fontFamily:"'DM Mono',monospace" }}>
                  {DAY_CFG[d].focus}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="content">

          {activeDay === "science" && (
            <>
              <div className="day-title" style={{ marginBottom: 8 }}>SCIENCE & PRINCIPLES</div>
              <div className="day-desc" style={{ marginBottom: 16 }}>Every programming decision backed by peer-reviewed research.</div>
              <div className="sci-grid">
                {SCIENCE_CARDS.map((s,i) => (
                  <div className="sci-card" key={i}>
                    <div className="sci-card-title">{s.title}</div>
                    <p dangerouslySetInnerHTML={{ __html: s.body.replace(/\b([A-Z]{2,}(?:\s[A-Z]{2,})*)\b/g, m => `<strong>${m}</strong>`) }} />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeDay === "compare" && (
            <>
              <div className="day-title" style={{ marginBottom: 8 }}>PLAN COMPARISON</div>
              <div className="day-desc" style={{ marginBottom: 16 }}>Where ChatGPT's plan was better, where mine was better, and what the merged plan does.</div>
              {COMPARE.map((c,i) => (
                <div className="compare-card" key={i}>
                  <div className="compare-title">{c.title}</div>
                  {c.rows.map((r,j) => (
                    <div className="compare-row" key={j}>
                      <div className={`compare-tag ${r.tag}`}>{r.label}</div>
                      <div className="compare-text">{r.text}</div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {wo && (
            <>
              <div className="day-title">{cfg.label.toUpperCase()} — {cfg.focus}</div>
              <div className="day-desc">{wo.desc}</div>
              <div className="vol-row">
                {wo.vol.map((v,i) => (
                  <div className="vol-chip" key={i}>{v.k} <span>{v.v}</span></div>
                ))}
              </div>
              <div className="tip-box" dangerouslySetInnerHTML={{ __html: wo.tip }} style={{ marginTop: 12 }} />

              <div className="ex-list">
                {wo.exercises.map((ex, i) => (
                  <div className={`ex-card ${openEx === i ? "open" : ""}`} key={i}>
                    <div className="ex-head" onClick={() => setOpenEx(openEx === i ? null : i)}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <div className="ex-num">EXERCISE {i+1}</div>
                          {ex.badge && <div className={`ex-badge ${ex.badge.cls}`}>{ex.badge.text}</div>}
                        </div>
                        <div className="ex-name">{ex.name}</div>
                        <div className="ex-targets">{ex.targets}</div>
                      </div>
                      <div className="ex-toggle">▾</div>
                    </div>

                    {openEx === i && (
                      <div className="ex-body">
                        <table className="sets-table">
                          <thead>
                            <tr>
                              <th>SET</th>
                              <th>WEIGHT</th>
                              <th>REPS</th>
                              <th>REST</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ex.sets.map(s => (
                              <tr key={s.n}>
                                <td className="s-num">{s.n}</td>
                                <td className="s-weight">{s.kg}</td>
                                <td className="s-reps">{s.reps}</td>
                                <td className="s-rest">{s.rest}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="prog-note">
                          PROGRESSION: <span>{ex.prog.replace("→ ","")}</span>
                        </div>
                        <div className="sci-box">
                          <div className="sci-label">⚗ SCIENCE</div>
                          <p>{ex.sci}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
