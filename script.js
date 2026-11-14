// ---------- TEAM DATA ----------
// Put logo files inside the "images" folder with these names (png/jpg/webp -> change ext here)
const teams = {
  mi:   { name:"Mumbai Indians",              short:"MI",   color:"#1e6bff", captain:"Hardik Pandya",   titles:5, img:"images/mi.png" },
  csk:  { name:"Chennai Super Kings",         short:"CSK",  color:"#ffc400", captain:"Ruturaj Gaikwad", titles:5, img:"images/csk.png" },
  rcb:  { name:"Royal Challengers Bengaluru", short:"RCB",  color:"#e5253d", captain:"Rajat Patidar",   titles:1, img:"images/rcb.png" },
  kkr:  { name:"Kolkata Knight Riders",       short:"KKR",  color:"#7a3fd1", captain:"Ajinkya Rahane",  titles:3, img:"images/kkr.png" },
  dc:   { name:"Delhi Capitals",              short:"DC",   color:"#2aa0ff", captain:"Axar Patel",      titles:0, img:"images/dc.png" },
  srh:  { name:"Sunrisers Hyderabad",         short:"SRH",  color:"#ff7a1a", captain:"Pat Cummins",     titles:1, img:"images/srh.png" },
  rr:   { name:"Rajasthan Royals",            short:"RR",   color:"#ff4fa3", captain:"Sanju Samson",    titles:1, img:"images/rr.png" },
  gt:   { name:"Gujarat Titans",              short:"GT",   color:"#5fb4d8", captain:"Shubman Gill",    titles:1, img:"images/gt.png" },
  pbks: { name:"Punjab Kings",                short:"PBKS", color:"#ff3b3b", captain:"Shreyas Iyer",    titles:0, img:"images/pbks.png" },
  lsg:  { name:"Lucknow Super Giants",        short:"LSG",  color:"#25c9d0", captain:"Rishabh Pant",    titles:0, img:"images/lsg.png" }
};

// Returns an <img>. If the image file is missing, it shows a colored circle with team short name.
function logo(key) {
  const t = teams[key];
  return `<img src="${t.img}" alt="${t.name}" onerror="fixLogo(this,'${key}')">`;
}
function fixLogo(el, key) {
  const t = teams[key];
  const d = document.createElement("div");
  d.className = "fallback " + el.className;
  d.style.background = t.color;
  d.style.color = key === "csk" ? "#222" : "#fff";
  d.textContent = t.short;
  el.replaceWith(d);
}
function setLogo(id, key) {
  const el = document.getElementById(id);
  el.outerHTML = logo(key).replace("<img", `<img id="${id}"`);
}

// ---------- STATIC SECTIONS ----------
setLogo("logoA", "mi");
setLogo("logoB", "csk");

document.getElementById("teamGrid").innerHTML = Object.keys(teams).map(k => {
  const t = teams[k];
  return `<div class="team-card" style="--c:${t.color}">
    ${logo(k)}
    <h3>${t.name}</h3>
    <p>Captain: ${t.captain}</p>
    <p>Titles: ${t.titles}</p>
  </div>`;
}).join("");

const points = [["gt",9,7,2,"+0.92"],["mi",9,6,3,"+0.64"],["rcb",9,6,3,"+0.41"],["csk",9,5,4,"+0.22"],["dc",9,5,4,"+0.05"],
  ["srh",9,4,5,"-0.12"],["lsg",9,4,5,"-0.31"],["kkr",9,3,6,"-0.48"],["rr",9,3,6,"-0.70"],["pbks",9,2,7,"-0.95"]];
document.getElementById("pointsBody").innerHTML = points.map((p,i) => `
  <tr><td>${i+1}</td>
  <td><div class="pt-team">${logo(p[0])} ${teams[p[0]].name}</div></td>
  <td>${p[1]}</td><td>${p[2]}</td><td>${p[3]}</td><td>${p[4]}</td><td><b>${p[2]*2}</b></td></tr>`).join("");

// ---------- LIVE MATCH SIMULATION ----------
const TARGET = 187;
const batters = ["Rohit Sharma","Ryan Rickelton","Suryakumar Yadav","Tilak Varma","Hardik Pandya","Naman Dhir","Mitchell Santner","Deepak Chahar","Jasprit Bumrah","Trent Boult","Ashwani Kumar"];
const bowlerNames = ["Khaleel Ahmed","Noor Ahmad","Matheesha Pathirana","Ravindra Jadeja","Ravichandran Ashwin"];
let m, timer, paused = false;

function startMatch() {
  m = { runs:62, wkts:1, balls:48, striker:0, partner:2, next:3, bowler:0, over:[],
        bat: batters.map(n => ({ n, r:0, b:0, f:0, s:0, out:false })),
        bowl: bowlerNames.map(n => ({ n, b:12, r:20, w:0 })) };
  m.bat[0].r = 31; m.bat[0].b = 22; m.bat[0].f = 4; m.bat[0].s = 1;
  m.bat[1].out = true; m.bat[1].r = 9; m.bat[1].b = 11;
  m.bat[2].r = 18; m.bat[2].b = 12; m.bat[2].f = 2; m.bat[2].s = 1;
  m.bowl[4].b = 0; m.bowl[4].r = 0;
  document.getElementById("comm").innerHTML = "";
  paused = false;
  document.getElementById("pauseBtn").textContent = "Pause";
  show();
  clearInterval(timer);
  timer = setInterval(nextBall, 2500);
}

function randomOutcome() {
  const list = ["0","0","0","1","1","1","1","2","3","4","4","6","6","W","wd"];
  return list[Math.floor(Math.random() * list.length)];
}
const words = {
  "0": ["Dot ball. Good line from the bowler.", "Beaten! Just misses the edge."],
  "1": ["Pushed for a quick single.", "Worked away to square leg for one."],
  "2": ["Placed in the gap, they run two."],
  "3": ["Great running, three runs!"],
  "4": ["FOUR! Cracked through the covers.", "FOUR! Races to the boundary."],
  "6": ["SIX! Massive hit over long on!", "SIX! That is out of the ground!"],
  "W": ["OUT! Clean bowled!", "OUT! Caught in the deep!"],
  "wd": ["Wide ball. Extra run."]
};
const pick = a => a[Math.floor(Math.random() * a.length)];

function nextBall() {
  if (m.balls >= 120 || m.wkts >= 10 || m.runs >= TARGET) return finish();
  const o = randomOutcome();
  const b = m.bat[m.striker], bw = m.bowl[m.bowler];
  let cls = "", legal = true, add = 0;

  if (o === "wd") { legal = false; add = 1; }
  else if (o === "W") { b.b++; b.out = true; m.wkts++; bw.w++; cls = "out"; }
  else {
    add = Number(o); b.r += add; b.b++;
    if (add === 4) { b.f++; cls = "four"; }
    if (add === 6) { b.s++; cls = "six"; }
  }
  m.runs += add; bw.r += add;
  if (legal) { m.balls++; bw.b++; }

  m.over.push({ t: o === "wd" ? "Wd" : o, cls });
  const oversText = Math.floor((m.balls - (legal ? 1 : 0)) / 6) + "." + (((m.balls - (legal ? 1 : 0)) % 6) + 1);
  const li = document.createElement("li");
  li.innerHTML = `<b>${legal ? oversText : "Wd"}</b> ${bw.n} to ${b.n}: ${pick(words[o])}`;
  document.getElementById("comm").prepend(li);

  if (o === "W") { m.striker = m.next++; }
  else if (add % 2 === 1 && legal) { [m.striker, m.partner] = [m.partner, m.striker]; }

  if (legal && m.balls % 6 === 0) {
    [m.striker, m.partner] = [m.partner, m.striker];
    m.over = [];
    m.bowler = (m.bowler + 1) % bowlerNames.length;
  }
  show();
  if (m.runs >= TARGET || m.wkts >= 10 || m.balls >= 120) finish();
}

function finish() {
  clearInterval(timer);
  const msg = m.runs >= TARGET ? `Mumbai Indians won by ${10 - m.wkts} wickets!` : `Chennai Super Kings won by ${TARGET - 1 - m.runs} runs!`;
  document.getElementById("status").textContent = "Match over: " + msg;
  document.getElementById("pauseBtn").textContent = "Finished";
}

function show() {
  const left = 120 - m.balls, need = TARGET - m.runs;
  document.getElementById("runs").textContent = m.runs;
  document.getElementById("wkts").textContent = m.wkts;
  document.getElementById("overs").textContent = Math.floor(m.balls / 6) + "." + (m.balls % 6);
  document.getElementById("crr").textContent = (m.runs / m.balls * 6).toFixed(2);
  document.getElementById("rrr").textContent = left ? (Math.max(need, 0) / left * 6).toFixed(2) : "0.00";
  if (m.runs < TARGET && m.balls < 120 && m.wkts < 10)
    document.getElementById("status").textContent = `Mumbai Indians need ${need} runs in ${left} balls`;

  document.getElementById("thisOver").innerHTML = m.over.map(x => `<div class="ball ${x.cls}">${x.t}</div>`).join("");

  document.getElementById("batBody").innerHTML = m.bat
    .filter((x, i) => x.b > 0 || i === m.striker || i === m.partner)
    .map(x => {
      const i = m.bat.indexOf(x);
      const mark = (i === m.striker && !x.out) ? " *" : "";
      return `<tr><td>${x.n}${mark}${x.out ? " (out)" : ""}</td><td><b>${x.r}</b></td><td>${x.b}</td><td>${x.f}</td><td>${x.s}</td></tr>`;
    }).join("");

  document.getElementById("bowlBody").innerHTML = m.bowl
    .filter(x => x.b > 0)
    .map(x => `<tr><td>${x.n}</td><td>${Math.floor(x.b / 6)}.${x.b % 6}</td><td>${x.r}</td><td><b>${x.w}</b></td></tr>`).join("");
}

document.getElementById("pauseBtn").onclick = function () {
  if (m.balls >= 120 || m.wkts >= 10 || m.runs >= TARGET) return;
  paused = !paused;
  if (paused) { clearInterval(timer); this.textContent = "Resume"; }
  else { timer = setInterval(nextBall, 2500); this.textContent = "Pause"; }
};
document.getElementById("restartBtn").onclick = startMatch;

startMatch();
