document.addEventListener('DOMContentLoaded', () => {
    // ======== Utilities ========
    const $ = (sel, el = document) => el.querySelector(sel);
    const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
    const store = {
        get(k, def) {
            try { return JSON.parse(localStorage.getItem(k)) ?? def } catch { return def }
        },
        set(k, v) { localStorage.setItem(k, JSON.stringify(v)) }
    };

    // ======== Page Navigation ========
    const landingPage = $('#landing-page');
    const aboutPage = $('#about-page');
    const dashboardPage = $('#dashboard-page');
    const exploreBtn = $('#exploreBtn');
    const homeLinks = $$('.home-link');
    const aboutLinks = $$('.about-link');
    const logoLinks = $$('.logo-link');

    function showPage(pageToShow) {
        $$('.page').forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active-page');
        });
        pageToShow.style.display = 'flex'; // Use flex for pages to ensure consistent layout
        pageToShow.classList.add('active-page');
        // Update URL hash for direct linking/refreshing
        window.location.hash = pageToShow.id;
    }

    // Initial page load based on URL hash
    if (window.location.hash === '#dashboard-page') {
        showPage(dashboardPage);
    } else if (window.location.hash === '#about-page') {
        showPage(aboutPage);
    }
    else {
        showPage(landingPage);
    }

    exploreBtn.addEventListener('click', () => showPage(dashboardPage));
    homeLinks.forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(landingPage);
    }));
    aboutLinks.forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(aboutPage);
    }));
    logoLinks.forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(landingPage);
    }));

    // ======== Theme ========
    // Select all theme buttons
    const themeBtns = $$('#themeBtn, #themeBtnAbout, #themeBtnDashboard');
    const applyTheme = (mode) => {
        if (mode === 'light') document.documentElement.classList.add('light');
        else document.documentElement.classList.remove('light');
        store.set('theme', mode);
    };
    const toggleTheme = () => {
        const cur = store.get('theme', 'dark');
        applyTheme(cur === 'dark' ? 'light' : 'dark');
    };
    themeBtns.forEach(btn => btn.addEventListener('click', toggleTheme));
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 't') toggleTheme();
    });
    applyTheme(store.get('theme', 'dark'));

    // ======== Greeting & date ========
    const hello = $('#hello');
    const today = $('#today');

    function updateGreeting() {
        const now = new Date();
        const hour = now.getHours();
        const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        hello.textContent = `${part}, friend!`;
        today.textContent = now.toLocaleString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    updateGreeting();

    // ======== Quotes ========
    const QUOTES = [
        { q: "The secret of getting ahead is getting started.", a: "Mark Twain" },
        { q: "It always seems impossible until it’s done.", a: "Nelson Mandela" },
        { q: "Well begun is half done.", a: "Aristotle" },
        { q: "Simplicity is the soul of efficiency.", a: "Austin Freeman" },
        { q: "Action is the foundational key to all success.", a: "Pablo Picasso" },
        { q: "Dream big. Start small. Act now.", a: "Robin Sharma" },
        { q: "You don’t have to be great to start, but you have to start to be great.", a: "Zig Ziglar" },
        { q: "Focus is the art of knowing what to ignore.", a: "James Clear" },
        { q: "The best time to plant a tree was 20 years ago. The second best time is now.", a: "Chinese Proverb" },
        { q: "If you get tired, learn to rest, not to quit.", a: "Banksy" }
    ];

    function setRandomQuote() {
        const { q, a } = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        $('#quote').textContent = `“${q}”`;
        $('#author').textContent = `— ${a}`;
    }
    setRandomQuote();
    $('#newQuote').addEventListener('click', setRandomQuote);

    // ======== To‑Do ========
    const todoListEl = $('#todoList');
    const todoStats = $('#todoStats');
    let todos = store.get('todos', []);

    function renderTodos() {
        todoListEl.innerHTML = '';
        todos.forEach((t, i) => {
            const row = document.createElement('div');
            row.className = 'task' + (t.done ? ' done' : '');
            row.innerHTML = `
                <input type="checkbox" ${t.done ? 'checked' : ''}>
                <div class="name">${t.name}</div>
                <button class="btn btn-secondary" style="padding:6px 10px" title="Delete">✕</button>
            `;
            const [chk, name, del] = row.children;
            chk.addEventListener('change', () => {
                t.done = chk.checked;
                saveTodos();
            });
            del.addEventListener('click', () => {
                todos.splice(i, 1);
                saveTodos();
            });
            todoListEl.appendChild(row);
        });
        const done = todos.filter(t => t.done).length;
        todoStats.textContent = `${todos.length} tasks • ${done} done`;
    }

    function saveTodos() {
        store.set('todos', todos);
        renderTodos();
    }
    renderTodos();

    const taskInput = $('#taskInput');
    taskInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && taskInput.value.trim()) {
            todos.unshift({ name: taskInput.value.trim(), done: false });
            taskInput.value = '';
            saveTodos();
        }
    });
    $('#clearDone').addEventListener('click', () => {
        todos = todos.filter(t => !t.done);
        saveTodos();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'n') {
            taskInput.focus();
            e.preventDefault();
        }
    });

    // ======== Habits ========
    const habitList = $('#habitList');
    let habits = store.get('habits', [
        { name: 'Coding', goal: 1, progress: 0 },
        { name: 'Exercise', goal: 1, progress: 0 }
    ]);

    function renderHabits() {
        habitList.innerHTML = '';
        habits.forEach((h, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'habit';
            const pct = Math.min(100, Math.round((h.progress / h.goal) * 100));
            wrap.innerHTML = `
                <div class="row">
                    <div style="font-weight:700">${h.name}</div>
                    <div class="space"></div>
                    <div class="tiny">${h.progress}/${h.goal}</div>
                    <button class="btn btn-secondary" style="padding:6px 10px">+1</button>
                    <button class="btn btn-secondary" style="padding:6px 10px" title="Reset">↺</button>
                    <button class="btn btn-secondary" style="padding:6px 10px; color:var(--danger);" title="Delete">✕</button>
                </div>
                <div class="bar"><span style="width:${pct}%"></span></div>
            `;
            const btnInc = wrap.querySelectorAll('button')[0];
            const btnReset = wrap.querySelectorAll('button')[1];
            const btnDelete = wrap.querySelectorAll('button')[2];

            btnInc.addEventListener('click', () => {
                h.progress = Math.min(h.goal, h.progress + 1);
                saveHabits();
            });
            btnReset.addEventListener('click', () => {
                h.progress = 0;
                saveHabits();
            });
            btnDelete.addEventListener('click', () => {
                habits.splice(idx, 1);
                saveHabits();
            });
            habitList.appendChild(wrap);
        });
    }

    function saveHabits() {
        store.set('habits', habits);
        renderHabits();
    }
    renderHabits();

    $('#addHabit').addEventListener('click', () => {
        const name = $('#habitName').value.trim();
        const goal = Math.max(1, parseInt($('#habitGoal').value || '1', 10));
        if (!name) return;
        habits.push({ name, goal, progress: 0 });
        $('#habitName').value = '';
        $('#habitGoal').value = '';
        saveHabits();
    });

    // ======== Timer / Stopwatch ========
    const clock = $('#clock');
    const timerTitle = $('#timerTitle');
    const lenSel = $('#pomoLength');
    const startBtn = $('#startPomo');
    const resetBtn = $('#resetPomo');
    const swapModeBtn = $('#swapMode');

    let isTimer = true;
    let seconds = parseInt(lenSel.value, 10) * 60;
    let stopwatchSeconds = 0;
    let tick = null;

    function fmt(t) {
        const m = Math.floor(t / 60).toString().padStart(2, '0');
        const s = Math.floor(t % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateClock() {
        if (isTimer) {
            clock.textContent = fmt(seconds);
        } else {
            clock.textContent = fmt(stopwatchSeconds);
        }
    }

    function startStop() {
        if (tick) {
            clearInterval(tick);
            tick = null;
            startBtn.textContent = 'Start';
        } else {
            startBtn.textContent = 'Pause';
            if (isTimer) {
                tick = setInterval(() => {
                    seconds--;
                    updateClock();
                    if (seconds <= 0) {
                        clearInterval(tick);
                        tick = null;
                        startBtn.textContent = 'Start';
                        alert('Time! Great job 👏');
                        seconds = parseInt(lenSel.value, 10) * 60;
                        updateClock();
                    }
                }, 1000);
            } else {
                tick = setInterval(() => {
                    stopwatchSeconds++;
                    updateClock();
                }, 1000);
            }
        }
    }

    function reset() {
        clearInterval(tick);
        tick = null;
        startBtn.textContent = 'Start';
        if (isTimer) {
            seconds = parseInt(lenSel.value, 10) * 60;
        } else {
            stopwatchSeconds = 0;
        }
        updateClock();
    }
    
    function swapMode() {
      reset();
      isTimer = !isTimer;
      if (isTimer) {
          timerTitle.textContent = 'Timer';
          lenSel.style.display = 'block';
          swapModeBtn.textContent = 'Switch to Stopwatch';
      } else {
          timerTitle.textContent = 'Stopwatch';
          lenSel.style.display = 'none';
          swapModeBtn.textContent = 'Switch to Timer';
      }
      updateClock();
    }

    startBtn.addEventListener('click', startStop);
    resetBtn.addEventListener('click', reset);
    lenSel.addEventListener('change', () => {
        if (isTimer) {
            seconds = parseInt(lenSel.value, 10) * 60;
            updateClock();
        }
    });
    swapModeBtn.addEventListener('click', swapMode);
    
    updateClock();

    // ======== Calculator ========
    const calcScreen = $('#calcScreen');
    let expr = '0';

    function setScreen(v) { calcScreen.textContent = v; }

    function pushKey(k) {
        if (k === 'C') {
            expr = '0';
        } else if (k === 'back') {
            expr = expr.length > 1 ? expr.slice(0, -1) : '0';
        } else if (k === '=') {
            expr = safeEval(expr);
        } else {
            if (expr === '0' && /[0-9.]/.test(k)) expr = k;
            else expr += k;
        }
        setScreen(expr);
    }

    function safeEval(s) {
        s = s.replace(/×/g, '*').replace(/÷/g, '/');
        if (!/^[-+*/()% .0-9]+$/.test(s)) return 'Err';
        try {
            const val = Function(`"use strict";return (${s})`)();
            if (!isFinite(val)) return 'Err';
            return String(+parseFloat(val.toFixed(10)));
        } catch {
            return 'Err';
        }
    }
    $$('.key').forEach(k => k.addEventListener('click', () => pushKey(k.dataset.k)));

    // ======== Converters ========
    const TYPE_UNITS = {
        length: {
            units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, inch: 0.0254, ft: 0.3048 },
            labels: { m: 'Meters', km: 'Kilometers', cm: 'Centimeters', mm: 'Millimeters', inch: 'Inches', ft: 'Feet' }
        },
        weight: {
            units: { kg: 1, g: 0.001, lb: 0.45359237 },
            labels: { kg: 'Kilograms', g: 'Grams', lb: 'Pounds' }
        },
        temp: {
            units: { C: 1, F: 1, K: 1 }, // Handled specially
            labels: { C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin' }
        },
        currency: {
            units: { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 },
            labels: { INR: 'Indian Rupee', USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound' }
        },
        base: {
            units: { 2: 1, 10: 1, 16: 1 }, // Values here don't matter, handled by parseInt/toString
            labels: { 2: 'Binary', 10: 'Decimal', 16: 'Hexadecimal' }
        }
    };

    const convType = $('#convType');
    const fromUnit = $('#convFromUnit');
    const toUnit = $('#convToUnit');
    const fromVal = $('#convFromVal');
    const toVal = $('#convToVal');

    function populateUnits() {
        const t = convType.value;
        const { labels } = TYPE_UNITS[t];
        fromUnit.innerHTML = '';
        toUnit.innerHTML = '';
        for (const k of Object.keys(labels)) {
            const o1 = document.createElement('option');
            o1.value = k;
            o1.textContent = `${k} — ${labels[k]}`;
            fromUnit.appendChild(o1);
            const o2 = document.createElement('option');
            o2.value = k;
            o2.textContent = `${k} — ${labels[k]}`;
            toUnit.appendChild(o2);
        }
        
        // Set sensible defaults for different converter types
        if (t === 'length') { fromUnit.value = 'm'; toUnit.value = 'ft'; fromVal.type = 'number'; }
        else if (t === 'weight') { fromUnit.value = 'kg'; toUnit.value = 'lb'; fromVal.type = 'number'; }
        else if (t === 'temp') { fromUnit.value = 'C'; toUnit.value = 'F'; fromVal.type = 'number'; }
        else if (t === 'currency') { fromUnit.value = 'INR'; toUnit.value = 'USD'; fromVal.type = 'number'; }
        else if (t === 'base') { 
            fromVal.type = 'text'; // Allow text input for binary/hex
            fromUnit.value = '10'; 
            toUnit.value = '2'; 
        }
        
        convert();
    }

    function convert() {
        const t = convType.value;
        const a = fromUnit.value;
        const b = toUnit.value;
        const v = fromVal.value;

        if (t === 'temp') {
            toVal.value = tempConvert(parseFloat(v || '0'), a, b).toFixed(2);
        } else if (t === 'base') {
            try {
                // parseInt uses the 'from' base (a)
                const decValue = parseInt(v, parseInt(a)); 
                if (isNaN(decValue)) throw new Error('Invalid input');
                // toString converts to the 'to' base (b)
                toVal.value = decValue.toString(parseInt(b)).toUpperCase(); // ToUpperCase for hex readability
            } catch {
                toVal.value = 'Error';
            }
        } else {
            const floatV = parseFloat(v || '0');
            if(isNaN(floatV)) { toVal.value = ''; return; } // Handle empty or invalid number input
            const baseA = TYPE_UNITS[t].units[a];
            const baseB = TYPE_UNITS[t].units[b];
            const inBase = floatV * baseA;
            const out = inBase / baseB;
            toVal.value = (Math.round(out * 1e6) / 1e6).toString();
        }
    }

    function tempConvert(v, a, b) {
        let c = v; // Value in Celsius
        if (a === 'F') c = (v - 32) * 5 / 9;
        else if (a === 'K') c = v - 273.15;
        
        // Convert from Celsius to target unit
        if (b === 'C') return c;
        if (b === 'F') return c * 9 / 5 + 32;
        if (b === 'K') return c + 273.15;
        return v; // Should not happen if units are valid
    }

    convType.addEventListener('change', populateUnits);
    [fromUnit, toUnit, fromVal].forEach(el => el.addEventListener('input', convert));
    $('#swapConv').addEventListener('click', () => {
        const fu = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = fu;
        convert();
    });
    populateUnits(); // Initial population on load

    // ======== Weather (Open‑Meteo + geocoding) ========
    const wxTemp = $('#wxTemp');
    const wxCity = $('#wxCity');
    const wxDesc = $('#wxDesc');

    async function geocode(city) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('geo');
        const j = await res.json();
        if (!j.results || !j.results.length) throw new Error('notfound');
        const r = j.results[0];
        return { name: `${r.name}${r.admin1?(', '+r.admin1):''}, ${r.country_code}`, lat: r.latitude, lon: r.longitude };
    }

    async function fetchWeather(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('wx');
        return res.json();
    }

    function wxCodeToText(code) {
        const m = { 0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Depositing rime fog', 51: 'Drizzle', 61: 'Rain', 80: 'Rain showers' };
        return m[code] || '—';
    }

    async function updateWeatherByCityName(name) {
        try {
            const g = await geocode(name);
            store.set('wxCity', g);
            await updateWeather(g);
        } catch (e) {
            wxDesc.textContent = 'City not found';
        }
    }
    async function updateWeather(geo) {
        try {
            wxCity.textContent = geo.name;
            const j = await fetchWeather(geo.lat, geo.lon);
            const t = Math.round(j.current.temperature_2m);
            wxTemp.textContent = `${t}°`;
            wxDesc.textContent = wxCodeToText(j.current.weather_code);
        } catch (e) {
            wxDesc.textContent = 'Weather unavailable';
        }
    }

    async function initWeather() {
        const saved = store.get('wxCity');
        if (saved) { updateWeather(saved); return; }
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                const guess = { name: 'Your location', lat, lon };
                store.set('wxCity', guess);
                updateWeather(guess);
            }, () => {
                wxDesc.textContent = 'Type a city to set weather';
            });
        } else {
            wxDesc.textContent = 'Type a city to set weather';
        }
    }
    initWeather();

    $('#wxRefresh').addEventListener('click', () => {
        const g = store.get('wxCity');
        if (g) updateWeather(g);
    });
    $('#setCity').addEventListener('click', () => {
        const city = $('#cityInput').value.trim();
        if (city) updateWeatherByCityName(city);
    });
});