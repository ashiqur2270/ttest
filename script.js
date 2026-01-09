// --- Navigation Logic ---
function show(id) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById('homeUI').style.display = 'none';
    document.getElementById(id).style.display = 'block';
    window.scrollTo(0,0);
}

function goHome() {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById('homeUI').style.display = 'grid';
}

function toggle(id) { document.getElementById(id).classList.toggle('hidden'); }

// --- Search Logic ---
function globalSearch(q){
    q=q.toLowerCase();
    document.querySelectorAll(".home-btn").forEach(b => {
        b.style.display = b.innerText.toLowerCase().includes(q) ? "block":"none";
    });
}
   

// ===== COPY RESULT =====
function copyScan(){
    let txt = document.getElementById("scanResult").innerText;
    navigator.clipboard.writeText(txt);
    alert("Copied ✅");
}


    // -------- Calculator Functions ---
    
    
    let screen = document.getElementById('scr');
    function cPress(v) { if(screen.innerText === '0') screen.innerText = v; else screen.innerText += v; }
    function cClr() { screen.innerText = '0'; }
    function cBack() { screen.innerText = screen.innerText.slice(0, -1) || '0'; }
    function cRes() { try { screen.innerText = eval(screen.innerText); } catch { screen.innerText = "Error"; } }

    let cHis = JSON.parse(localStorage.getItem('cHis') || '[]');
    function addCalcFromScr() {
        let type = document.getElementById('cType').value || "অন্যান্য";
        let val = parseFloat(screen.innerText) || 0;
        cHis.push({t: type, v: val});
        localStorage.setItem('cHis', JSON.stringify(cHis));
        renderCHis();
    }
    function renderCHis() {
        let t = 0;
        document.getElementById('cBody').innerHTML = cHis.map((h, i) => { 
            t += h.v; 
            return `<tr><td>${h.t}</td><td>${h.v}</td><td><button class="red" onclick="delCHis(${i})">X</button></td></tr>`; 
        }).join('');
        document.getElementById('cTotal').innerText = t;
    }
    function delCHis(i) { cHis.splice(i,1); localStorage.setItem('cHis', JSON.stringify(cHis)); renderCHis(); }


// ----------Backup System----------

function exportBackup() {
    let data = {
        notes,
        ecData,
        ageStore,
        cHis
    };
    let blob = new Blob([JSON.stringify(data)], {type:"application/json"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dashboard-backup.json";
    a.click();
}

function importBackup() {
    let file = document.getElementById("backupFile").files[0];
    if (!file) return alert("ফাইল সিলেক্ট করো");
    let r = new FileReader();
    r.onload = e => {
        let d = JSON.parse(e.target.result);
        notes = d.notes || [];
        ecData = d.ecData || [];
        ageStore = d.ageStore || [];
        cHis = d.cHis || [];

        localStorage.setItem("notes",JSON.stringify(notes));
        localStorage.setItem("ecData",JSON.stringify(ecData));
        localStorage.setItem("ageStore",JSON.stringify(ageStore));
        localStorage.setItem("cHis",JSON.stringify(cHis));

        renderNotes(); renderEC(); renderAge(); renderCHis();
        alert("Restore Complete ✅");
    };
    r.readAsText(file);
}


// --- Scientific Calculator Logic ---


let sciScreen = document.getElementById('sci-screen');

function sciPress(v) {
    if (sciScreen.innerText === '0') {
        sciScreen.innerText = v;
    } else {
        sciScreen.innerText += v;
    }
}

function cClrSci() {
    sciScreen.innerText = '0';
}

function cBackSci() {
    sciScreen.innerText = sciScreen.innerText.slice(0, -1) || '0';
}

function squareSci() {
    try {
        let v = eval(sciScreen.innerText);
        sciScreen.innerText = v * v;
    } catch {
        sciScreen.innerText = "Error";
    }
}

function reciprocalSci() {
    try {
        let v = eval(sciScreen.innerText);
        if (v === 0) {
            sciScreen.innerText = "∞";
            return;
        }
        sciScreen.innerText = (1 / v).toFixed(8);
    } catch {
        sciScreen.innerText = "Error";
    }
}

function absSci() {
    try {
        let v = eval(sciScreen.innerText);
        sciScreen.innerText = Math.abs(v);
    } catch {
        sciScreen.innerText = "Error";
    }
}

function cResSci() {
    try {
        let exp = sciScreen.innerText
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(');

        let r = eval(exp);

        sciScreen.innerText = Number.isInteger(r)
            ? r
            : r.toFixed(8);

    } catch {
        sciScreen.innerText = "Error";
        setTimeout(() => sciScreen.innerText = "0", 1500);
    }
}


    // --- Earning & Cost ---
    let ecData = JSON.parse(localStorage.getItem('ecData') || '[]');
    function addEC() {
        let entry = {
            date: document.getElementById('ecDate').value || new Date().toLocaleString(),
            type: document.getElementById('ecType').value,
            inc: parseFloat(document.getElementById('ecIn').value)||0,
            exp: parseFloat(document.getElementById('ecOut').value)||0
        };
        ecData.push(entry);
        localStorage.setItem('ecData', JSON.stringify(ecData));
        document.getElementById('ecType').value=""; document.getElementById('ecIn').value=""; document.getElementById('ecOut').value="";
        renderEC();
    }
    function renderEC() {
        let bal = 0;
        document.getElementById('ecBody').innerHTML = ecData.map((d, i) => {
            bal += (d.inc - d.exp);
            return `<tr><td>${i+1}</td><td>${d.date}</td><td>${d.type}</td><td>${d.inc}</td><td>${d.exp}</td><td>${bal}</td>
            <td><button class="red" onclick="delEC(${i})">X</button></td></tr>`;
        }).join('');
    }
    function delEC(i) { ecData.splice(i,1); localStorage.setItem('ecData', JSON.stringify(ecData)); renderEC(); }

    // -------- Age Calculator Logic (New & Improved) ---
    let liveInterval;
    let savedInterval;

    function parseDate(str) {
        let parts = str.split('-');
        if(parts.length !== 3) return null;
        return new Date(parts[2], parts[1]-1, parts[0]);
    }

    function calculateLiveAge(dobDate) {
        const now = new Date();
        let diff = now - dobDate;
        if(diff < 0) return "ভবিষ্যতের তারিখ সম্ভব নয়";

        let years = now.getFullYear() - dobDate.getFullYear();
        let months = now.getMonth() - dobDate.getMonth();
        let days = now.getDate() - dobDate.getDate();
        let hours = now.getHours() - dobDate.getHours();
        let mins = now.getMinutes() - dobDate.getMinutes();
        let secs = now.getSeconds() - dobDate.getSeconds();

        if (secs < 0) { mins--; secs += 60; }
        if (mins < 0) { hours--; mins += 60; }
        if (hours < 0) { days--; hours += 24; }
        if (days < 0) { 
            months--; 
            let prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            days += prevMonth; 
        }
        if (months < 0) { years--; months += 12; }

        return `${years}Y ${months}M ${days}D | ${hours}h ${mins}m ${secs}s`;
    }

    function getNextBirthday(dobDate) {
        let now = new Date();
        let next = new Date(now.getFullYear(), dobDate.getMonth(), dobDate.getDate());
        if (next < now) next.setFullYear(now.getFullYear() + 1);
        let diff = next - now;
        let d = Math.floor(diff / (1000 * 60 * 60 * 24));
        let h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        return `${d} দিন ${h} ঘণ্টা পর`;
    }

    function startLiveAge() {
        clearInterval(liveInterval);
        let dobStr = document.getElementById('dob').value;
        let dobDate = parseDate(dobStr);
        
        if(!dobDate || isNaN(dobDate)) {
            alert("সঠিক ফরম্যাটে তারিখ দিন (DD-MM-YYYY)");
            return;
        }

        let resBox = document.getElementById('ageResult');
        resBox.classList.remove('hidden');
        
        liveInterval = setInterval(() => {
            resBox.innerText = calculateLiveAge(dobDate);
        }, 1000);
    }

    let ageStore = JSON.parse(localStorage.getItem('ageStore') || '[]');

    function saveAge() {
        let name = document.getElementById('ageName').value;
        let dobStr = document.getElementById('dob').value;
        if(!name || !dobStr) return alert("নাম ও তারিখ উভয়ই দিন");
        
        ageStore.push({name, dob: dobStr});
        localStorage.setItem('ageStore', JSON.stringify(ageStore));
        renderAge();
        alert("সংরক্ষিত হয়েছে!");
    }

    function renderAge() {
        clearInterval(savedInterval);
        const container = document.getElementById('savedAgesContainer');
        
        const updateTable = () => {
            container.innerHTML = `<table>
                <thead><tr><th>নাম</th><th>বর্তমান বয়স (লাইভ)</th><th>পরবর্তী জন্মদিন</th><th>X</th></tr></thead>
                <tbody>
                    ${ageStore.map((item, i) => {
                        let d = parseDate(item.dob);
                        return `<tr>
                            <td><b>${item.name}</b><br><small>${item.dob}</small></td>
                            <td style="font-size:12px; color:blue;">${calculateLiveAge(d)}</td>
                            <td>${getNextBirthday(d)}</td>
                            <td><button class="red" onclick="deleteAge(${i})">X</button></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>`;
        };

        updateTable();
        savedInterval = setInterval(updateTable, 1000);
    }

    function deleteAge(i) {
        ageStore.splice(i, 1);
        localStorage.setItem('ageStore', JSON.stringify(ageStore));
        renderAge();
    }

    


    // -------- Tally & Notepad --------
    let tc = 0; function tally(v) { tc = v===0?0:tc+v; tCnt.innerText = tc; }
    let notes = JSON.parse(localStorage.getItem('notes') || '[]');
    function saveNote() { notes.push({t: noteTitle.value, txt: noteText.value}); localStorage.setItem('notes', JSON.stringify(notes)); renderNotes(); }
    function renderNotes() { document.getElementById('noteList').innerHTML = notes.map((n, i) => `<div class="card"><h4>${n.t}</h4><p>${n.txt}</p><button class="red" onclick="notes.splice(${i},1);localStorage.setItem('notes',JSON.stringify(notes));renderNotes()">Delete</button></div>`).join(''); }


    // ------------- Converter --------
    function unitConvert() {
        let v = parseFloat(unitVal.value), f = unitFrom.value, t = unitTo.value;
        let factors = { ft: 0.3048, cm: 0.01, m: 1, in: 0.0254 };
        let res = (v * factors[f]) / factors[t];
        unitRes.classList.remove('hidden');
        unitRes.innerText = `Result: ${res.toFixed(4)} ${t}`;
    }

// ------------------ Loan -------------
    function loanCalc(type) {
        let p = parseFloat(lAmt.value), r = parseFloat(lRate.value)/100;
        let interest = type==='simple' ? p*r : p*(Math.pow(1+r, 1)-1);
        loanRes.classList.remove('hidden');
        loanRes.innerHTML = `সুদ: ${interest.toFixed(2)} ৳ <br> মোট: ${(p+interest).toFixed(2)} ৳`;
    }
    function loanReset() { loanRes.classList.add('hidden'); lAmt.value=""; lRate.value=""; }

    // ------------- Dollar -------------
    function dollarCalc() {
        dollarRes.classList.remove('hidden');
        dollarRes.innerText = `BDT: ${(dRate.value * dAmt.value).toFixed(2)} ৳`;
    }

    // ----------------- M/B/T ---------
    function mbConverter() {
        let v = parseFloat(mbVal.value), type = mbType.value, dr = parseFloat(mbDRate.value) || 1;
        let f = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
        let total = v * f[type] * dr;
        mbRes.classList.remove('hidden');
        mbRes.innerHTML = `মোট: ${total.toLocaleString()} ৳ <br> লক্ষ্য: ${(total/1e5).toFixed(2)} <br> কোটি: ${(total/1e7).toFixed(4)}`;
    }
    function mbReset() { mbRes.classList.add('hidden'); mbVal.value=""; mbDRate.value=""; }


//---------------password genarator------
function generatePassword() {
    const length = parseInt(document.getElementById("pwdLength").value);
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    let pass = "";

    for (let i = 0; i < length; i++) {
        pass += chars[Math.floor(Math.random() * chars.length)];
    }
    document.getElementById("passOutput").innerText = pass;
}

function copyPassword() {
    navigator.clipboard.writeText(
        document.getElementById("passOutput").innerText
    );
    alert("Copied ✅");
}

// ----------- Stopwatch Logic --------
let swStartTime, swElapsedTime = 0, swInterval;
let swRunning = false;
let lapCounter = 1;

function startStopwatch() {
    if (!swRunning) {
        swStartTime = Date.now() - swElapsedTime;
        swInterval = setInterval(updateStopwatch, 100);
        document.getElementById('swStartBtn').innerText = "Pause";
        swRunning = true;
    } else {
        clearInterval(swInterval);
        document.getElementById('swStartBtn').innerText = "Start";
        swRunning = false;
    }
}

function updateStopwatch() {
    swElapsedTime = Date.now() - swStartTime;
    let totalSeconds = Math.floor(swElapsedTime / 1000);
    let m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    let s = (totalSeconds % 60).toString().padStart(2, '0');
    let ms = Math.floor((swElapsedTime % 1000) / 100);
    document.getElementById('swDisplay').innerText = `${m}:${s}.${ms}`;
}

function lapStopwatch() {
    if (swRunning || swElapsedTime > 0) {
        const lapTime = document.getElementById('swDisplay').innerText;
        const lapDiv = document.createElement('div');
        lapDiv.style.padding = "8px";
        lapDiv.style.borderBottom = "1px solid #eee";
        lapDiv.innerHTML = `<strong>Lap ${lapCounter++}:</strong> ${lapTime}`;
        document.getElementById('lapList').prepend(lapDiv);
    }
}

function resetStopwatch() {
    clearInterval(swInterval);
    swRunning = false;
    swElapsedTime = 0;
    lapCounter = 1;
    document.getElementById('swDisplay').innerText = "00:00:00.0";
    document.getElementById('swStartBtn').innerText = "Start";
    document.getElementById('lapList').innerHTML = "";
}

// ------------- Timer Logic ----------
let timerInterval;
let timerRunning = false;

function startTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        document.getElementById('timerStartBtn').innerText = "Resume";
        timerRunning = false;
        return;
    }

    let m = parseInt(document.getElementById('tMin').value) || 0;
    let s = parseInt(document.getElementById('tSec').value) || 0;
    let totalSeconds = (m * 60) + s;

    if (totalSeconds <= 0) return alert("সময় নির্ধারণ করুন!");

    timerRunning = true;
    document.getElementById('timerStartBtn').innerText = "Pause";

    timerInterval = setInterval(() => {
        totalSeconds--;
        let displayM = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        let displayS = (totalSeconds % 60).toString().padStart(2, '0');
        document.getElementById('tDisplay').innerText = `${displayM}:${displayS}`;

        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            document.getElementById('timerStartBtn').innerText = "Start Timer";
            alert("সময় শেষ!");
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('tDisplay').innerText = "00:00";
    document.getElementById('timerStartBtn').innerText = "Start Timer";
    document.getElementById('tMin').value = "";
    document.getElementById('tSec').value = "";
}
// -------- Unit Converter Logic --------

function updateUnits() {
    const type = document.getElementById('unitType').value;
    const label1 = document.getElementById('unitLabel1');
    const label2 = document.getElementById('unitLabel2');
    
    const unitNames = {
        "m-ft": ["Meter", "Feet"],
        "ft-in": ["Feet", "Inch"],
        "in-cm": ["Inch", "Centimeter"],
        "kwh-w": ["kWh", "Watt"],
        "mbps-mb": ["Mbps", "MegaByte (MB)"],
        "kmh-ms": ["Km/h", "Meter/Sec"],
        "c-f": ["Celsius (°C)", "Fahrenheit (°F)"],
        "kg-ton": ["KG", "Ton"],
        "g-kg": ["Gram (g)", "KG"],
        "kg-lb": ["KG", "Pound (lb)"],
        "km-m": ["Kilometer (km)", "Meter (m)"]
    };

    label1.innerText = unitNames[type][0];
    label2.innerText = unitNames[type][1];
    resetUnits();
}

function convert(source) {
    const type = document.getElementById('unitType').value;
    const v1 = document.getElementById('val1');
    const v2 = document.getElementById('val2');

    let inputVal = source === 1 ? parseFloat(v1.value) : parseFloat(v2.value);
    
    if (isNaN(inputVal)) {
        if(source === 1) v2.value = ""; else v1.value = "";
        return;
    }

    let result;

    switch (type) {
        case "m-ft":
            result = source === 1 ? inputVal * 3.28084 : inputVal / 3.28084;
            break;
        case "ft-in":
            result = source === 1 ? inputVal * 12 : inputVal / 12;
            break;
        case "in-cm":
            result = source === 1 ? inputVal * 2.54 : inputVal / 2.54;
            break;
        case "kwh-w":
            result = source === 1 ? inputVal * 1000 : inputVal / 1000;
            break;
        case "mbps-mb":
            result = source === 1 ? inputVal / 8 : inputVal * 8;
            break;
        case "kmh-ms":
            result = source === 1 ? inputVal / 3.6 : inputVal * 3.6;
            break;
        case "c-f":
            result = source === 1 ? (inputVal * 9/5) + 32 : (inputVal - 32) * 5/9;
            break;
        case "kg-ton":
            result = source === 1 ? inputVal / 1000 : inputVal * 1000;
            break;
        case "g-kg":
            result = source === 1 ? inputVal / 1000 : inputVal * 1000;
            break;
        case "kg-lb":
            result = source === 1 ? inputVal * 2.20462 : inputVal / 2.20462;
            break;
        case "km-m":
            result = source === 1 ? inputVal * 1000 : inputVal / 1000;
            break;
    }

    // রেজাল্ট ৪ দশমিক ঘর পর্যন্ত দেখাবে
    if (source === 1) {
        v2.value = Number(result.toFixed(4));
    } else {
        v1.value = Number(result.toFixed(4));
    }
}

function resetUnits() {
    document.getElementById('val1').value = "";
    document.getElementById('val2').value = "";
}
//_________-----_Land_____________

function calculateLandAdvanced() {
    // বাহুসমূহ
    const ab = parseFloat(document.getElementById('L1').value) || 0;
    const cd = parseFloat(document.getElementById('L2').value) || 0;
    const ac = parseFloat(document.getElementById('W1').value) || 0;
    const bd = parseFloat(document.getElementById('W2').value) || 0;
    
    // কর্ণসমূহ
    const bc = parseFloat(document.getElementById('D_BC').value) || 0;
    const ad = parseFloat(document.getElementById('D_AD').value) || 0;

    const resBox = document.getElementById('landResult');

    if (ab <= 0 || cd <= 0 || ac <= 0 || bd <= 0) {
        alert("সবগুলো বাহুর মাপ সঠিকভাবে দিন!");
        return;
    }

    let area = 0;

    // যদি কোনো কর্ণ না দেওয়া হয় (গড় পদ্ধতি)
    if (bc === 0 && ad === 0) {
        area = ((ab + cd) / 2) * ((ac + bd) / 2);
    } 
    // যদি কর্ণ দেওয়া হয় (ত্রিভুজ পদ্ধতি - হ্যারনস ফর্মুলা)
    else {
        let diag = 0;
        if (bc > 0 && ad > 0) diag = (bc + ad) / 2; // দুই কর্ণ থাকলে গড় হবে
        else diag = bc > 0 ? bc : ad; // একটি থাকলে সেটিই হবে

        // ১ম ত্রিভুজ (AB, AC, Diag)
        let s1 = (ab + ac + diag) / 2;
        let area1 = Math.sqrt(s1 * (s1 - ab) * (s1 - ac) * (s1 - diag));

        // ২য় ত্রিভুজ (CD, BD, Diag)
        let s2 = (cd + bd + diag) / 2;
        let area2 = Math.sqrt(s2 * (s2 - cd) * (s2 - bd) * (s2 - diag));

        area = area1 + area2;
    }

    if (isNaN(area) || area <= 0) {
        alert("মাপগুলো যৌক্তিক নয়! দয়া করে সঠিক মাপ দিন।");
        return;
    }

    let shotansho = area / 435.6;
    let katha = area / 720;

    resBox.classList.remove('hidden');
    resBox.innerHTML = `
        <b>মোট এলাকা:</b> ${area.toFixed(2)} বর্গফুট<br>
        <span style="color:blue"><b>শতাংশ:</b> ${shotansho.toFixed(3)}</span><br>
        <b>কাঠা:</b> ${katha.toFixed(3)}
    `;}

const DPI = 96;

function execCmd(command, value = null) {
    document.execCommand(command, false, value);
}

function toggleCustomSize() {
    const size = document.getElementById('pageSize').value;
    const customWrap = document.getElementById('customSizeWrap');
    size === 'custom' ? customWrap.classList.remove('hidden') : customWrap.classList.add('hidden');
    applyPageSettings();
}
//_______________Calender_____________
// কিবোর্ড দিয়ে টাইপ করার সময় অটো ফরম্যাট (DD-MM-YYYY)
function formatAndStyleDate(el) {
    let val = el.value.replace(/\D/g, ''); // শুধু সংখ্যা রাখবে
    if (val.length > 8) val = val.slice(0, 8);
    
    let formatted = "";
    if (val.length > 0) formatted += val.substring(0, 2);
    if (val.length > 2) formatted += '-' + val.substring(2, 4);
    if (val.length > 4) formatted += '-' + val.substring(4, 8);
    
    el.value = formatted;

    // যদি পুরো তারিখ (১০ ক্যারেক্টার) লেখা হয়, তবে বাংলা তারিখ দেখাবে
    if (formatted.length === 10) {
        const parts = formatted.split('-');
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        
        const dateObj = new Date(year, month, day);
        
        // তারিখটি সঠিক কি না চেক করা (যেমন ৩০শে ফেব্রুয়ারি চেক করা)
        if (dateObj.getFullYear() === year && dateObj.getMonth() === month && dateObj.getDate() === day) {
            document.getElementById('bnDateRes').innerText = getBanglaDate(dateObj);
        } else {
            document.getElementById('bnDateRes').innerText = "সঠিক তারিখ দিন";
        }
    } else {
        document.getElementById('bnDateRes').innerText = "লিখুন...";
    }
}

function getBanglaDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    
    let bnYear = (month < 4 || (month === 4 && day < 14)) ? year - 594 : year - 593;
    const bnMonths = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
    const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];

    if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
        monthDays[10] = 31; 
    }

    const refDate = new Date(year, 3, 14);
    let diff = Math.floor((date - refDate) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
        const prevYear = year - 1;
        const isPrevLeap = (prevYear % 4 === 0 && prevYear % 100 !== 0) || (prevYear % 400 === 0);
        diff += (isPrevLeap ? 366 : 365);
    }

    let m = 0;
    while (diff >= monthDays[m]) {
        diff -= monthDays[m];
        m++;
    }
    
    let bnDay = diff + 1;
    let bnMonthName = bnMonths[m];

    const toBn = (n) => n.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
    return `${toBn(bnDay)} ${bnMonthName}, ${toBn(bnYear)}`;
}

// পেজ লোড হলে আজকের তারিখ অটো ইনপুট দেওয়া
window.addEventListener('load', () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const inputEl = document.getElementById('calInput');
    if(inputEl) {
        inputEl.value = `${d}-${m}-${y}`;
        formatAndStyleDate(inputEl);
    }
});


// উইন্ডো রিসাইজ করলে স্কেল ঠিক করা
window.addEventListener('resize', applyPageSettings);
window.addEventListener('load', () => { renderDocList(); applyPageSettings(); });


    // --- Export ---
    function exportData(id, mode, fsId) {
        let el = document.getElementById(id);
        el.style.fontSize = document.getElementById(fsId).value + "px";
        if(mode === 'pdf') html2pdf().from(el).save('Report.pdf');
        else html2canvas(el).then(c => { let a = document.createElement('a'); a.href=c.toDataURL(); a.download='Report.png'; a.click(); });
    }

    window.onload = () => { renderEC(); renderCHis(); renderAge(); renderNotes(); goHome() ; };
    //---------App signal cmd--------
    
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swCode = `
      self.addEventListener('fetch', (event) => {
        event.respondWith(fetch(event.request));
      });
    `;
    const blob = new Blob([swCode], {type: 'text/javascript'});
    const url = URL.createObjectURL(blob);
    navigator.serviceWorker.register(url);
  });
}

// Service Worker Registration for Offline Support and PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        const scriptContent = `
            const CACHE_NAME = 'my-dash-v1';
            self.addEventListener('install', event => {
                event.waitUntil(caches.open(CACHE_NAME));
            });
            self.addEventListener('fetch', event => {
                event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
            });
        `;
        const blob = new Blob([scriptContent], { type: 'text/javascript' });
        const swUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(swUrl).then(() => {
            console.log('Service Worker Registered');
        }).catch(err => console.log('SW Registration Failed', err));
    });
}
