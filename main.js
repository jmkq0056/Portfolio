/* ============================================================
   Scroll engine + page behaviour. No dependencies.
   One rAF loop writes --p (0..1) onto every [data-scene]:
     pin  — progress through a section taller than the viewport
            whose .stage is position:sticky (hero, claim, gathr,
            horizontal projects)
     view — progress of the element's travel through the viewport
            (everything that just reveals or parallaxes)
   CSS does the actual animating from --p; JS only measures.
   ============================================================ */

(function () {
  'use strict';

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- boot stinger: terminal types, then the site is revealed ----------
     Skippable with any input, runs once per session, never for reduced motion. */
  (function bootSequence() {
    const boot = document.getElementById('boot');
    const out = document.getElementById('term-out');

    function finish(instant) {
      document.documentElement.classList.add('booted');
      document.documentElement.style.overflow = '';
      if (instant) { boot.remove(); return; }
      /* the reveal always lands on the hero — never a restored mid-page position */
      scrollTo(0, 0);
      boot.classList.add('done');
      setTimeout(() => boot.classList.add('gone'), 550);
    }

    if (!boot) { document.documentElement.classList.add('booted'); return; }
    if (reduced) { finish(true); return; }

    /* keep the browser from re-applying a remembered scroll or anchor under the overlay */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    scrollTo(0, 0);
    document.documentElement.style.overflow = 'hidden';
    let skipped = false;
    const skip = () => { if (!skipped) { skipped = true; finish(false); } };
    /* deliberate exits: the window's close button, Escape, or trying to scroll */
    document.getElementById('term-close').addEventListener('click', skip);
    addEventListener('keydown', e => { if (e.key === 'Escape') skip(); });
    addEventListener('wheel', skip, { once: true, passive: true });
    setTimeout(skip, 9000); // failsafe: nothing may strand a visitor behind the overlay

    const P = '<span class="p">~ %</span> ';
    /* the window title already says who this is — one command is enough */
    const script = [
      { cmd: './portfolio --open', out: null }
    ];
    let html = '';
    const caret = '<span class="caret"></span>';
    const render = extra => { out.innerHTML = html + extra; };

    (async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      render(caret);
      await wait(650);                       // the prompt sits there a beat first
      for (const line of script) {
        if (skipped) return;
        html += P;
        let typed = '';
        for (const ch of line.cmd) {
          if (skipped) return;
          typed += ch;
          render(typed + caret);
          await wait(62);                    // human typing speed
        }
        await wait(260);                     // beat before "enter"
        html += typed + '\n';
        if (line.out) html += '<span class="o">' + line.out + '</span>\n';
        render(caret);
        await wait(line.out ? 1050 : 800);   // time to actually read it
      }
      if (!skipped) { skipped = true; finish(false); }
    })();
  })();

  /* ---------- i18n ---------- */
  const DA = {
    nav_about: 'Om mig', nav_work: 'Projekter', nav_xp: 'Erfaring', nav_skills: 'Kompetencer', nav_contact: 'Kontakt',
    lede: 'Grundlægger af <strong>Gathr Solutions</strong> — en startup, der bygger driftsplatformen til danske vagtfirmaer, live på App Store og Google Play. Jeg tager produkter fra første commit til produktion og holder dem kørende.',
    meta_loc: 'Greve, Storkøbenhavn',
    claim: 'Jeg bygger software, som rigtige forretninger faktisk kører på. En restaurant i dag. Danske vagtfirmaer som de næste.',
    n1: 'App udgivelser, iOS og Android, bygget alene',
    n2: 'Vægtet gennemsnit på bacheloren, Aalborg Universitet',
    n3: 'Bachelorprojekt, topkarakter på 7 trins skalaen',
    k_work: 'Startup · gathrsolutions.dk',
    g1_h: 'Problemet',
    g1_p: 'Danske vagtfirmaer kører på en bunke separate værktøjer. Regneark til vagtplaner, papir til runderingslogs, telefonopkald når noget går galt.',
    g2_h: 'Planlægning',
    g2_p: 'Gathr er bygget til at erstatte bunken. Vagtplanlægning med træk og slip oven på en medarbejderdatabase, der kender certificeringer og rådighed.',
    g3_h: 'Ude i marken',
    g3_p: 'Runderinger verificeres ved NFC, QR, BLE og GPS checkpoints, med hændelsesalarmer i samme øjeblik der sker noget — plus tidsregistrering, rapportering og en kundeportal.',
    g4_h: 'Drift',
    g4_p: 'Jeg har designet den, bygget den og driver den: datamodel, API\'er, web, mobil med offline understøttelse, auth, CI/CD, hosting. Live på App Store og Google Play — en startup i tidlig fase med reel interesse fra danske vagtfirmaer.',
    visit_site: 'Hjemmeside',
    f2_tag: 'Live i produktion · chickenwaves.dk',
    f2_role: 'Online bestillingsplatform, udvikler og IT drift · løbende',
    f2_p1: 'Online bestillingsplatformen jeg har bygget til en restaurant i Greve. Kunderne ser menuen, bestiller og betaler online til afhentning, og køkkenet modtager ordrerne i realtid. Jeg står også for restaurantens IT i det daglige: siden, betalinger, hosting og den digitale skiltning, der styrer skærmene i selve restauranten.',
    f2_p2: 'Endnu en rigtig forretning, der kører på software, jeg har bygget og holder i live.',
    k_proj: 'Udvalgte projekter',
    h_proj: 'Resten af hylden',
    c1_role: 'Backend og DevOps · open source undervisningsplatform',
    c1_p: 'Byggede CI/CD pipelines i GitHub Actions med tests, linting og build checks, satte levering op via Docker images med automatiseret deployment og arbejdede i kortlivede branches med peer review. Også mit femte semesters projekt, karakter 10, et B.',
    c2_h: 'Privatlivsbevarende samkørsel',
    c2_role: 'Bachelorprojekt · 15 ECTS · bedømt 12, et A',
    c2_p: 'Socialt bevidst bipartit matching med non interference fortrolighed til begivenhedsbaseret samkørsel. En matchingalgoritme der parrer passagerer uden at afsløre, hvem de er, eller hvor de skal hen.',
    c3_h: 'Et sprog til smart belysning',
    c3_role: 'Sprogdesign, parser og fortolker',
    c3_p: 'Designede grammatikken til et scriptsprog, der styrer Philips Hue belysning, og byggede derefter en fungerende fortolker til det fra bunden i Java. Parret med et REST API på Azure i C#/.NET 8.',
    c4_h: 'Digital skiltning',
    c4_role: 'Bygget til Chicken N Chicken Waves',
    c4_p: 'Styrer menu og kampagneskærmene i restauranten: hvad der vises på hvilken skærm, opdateret centralt i stedet for med USB stik og en stige. Kører i restauranten hver dag.',
    c5_h: 'Mobilapps',
    c5_role: 'Flutter og native Swift',
    c5_p: 'Focuz, en AI assisteret kalorietæller, og en indkøbsliste app. Lokal persistens, state management og cross platform builds til iOS og Android, plus native Swift hvor det gav mening.',
    c6_h: 'Tidligere projekter',
    c6_role: 'Universitets og fritidsprojekter',
    c6_p: 'Et bestillings og fakturasystem til Sylles Isfabrik i Java, en personlig budget og udgiftstracker i JavaScript og MongoDB, og en rejseplanlægger skrevet i C. Alle tre var gruppeprojekter bedømt til 10, et B.',
    yr_ongoing: 'I produktion', yr_ongoing2: 'Løbende', now: 'nu',
    k_xp: 'Erfaring', h_xp: 'Hvor jeg har arbejdet',
    j1_h: 'Grundlægger og softwareingeniør',
    j1_p: 'Har bygget og driver en vagtplanlægningsplatform til sikkerhedsbranchen, live på iOS, Android og web. Eneste udvikler på tværs af produkt, kode og drift.',
    j2_h: 'Udvikler og IT drift',
    j2_p: 'Udviklede restaurantens online bestillingsplatform og står for deres IT drift: bestillingssiden, betalinger, hosting og de daglige systemer, forretningen er afhængig af.',
    j3_h: 'Instruktor, Internetværk og webprogrammering',
    j3_p: 'Holdt ugentlige øvelsestimer for andensemesterstuderende, gennemgik kode og fejlfandt udviklingsmiljøer på både Windows og macOS. Skrev fejlfindingsmateriale, der blev brugt af hele årgangen.',
    j4_h: 'Mentor og tutor',
    j4_p: 'En til en undervisning i matematik, programmering og naturvidenskab, tilpasset den enkelte elev.',
    j5_h: 'Grafisk designer og webudvikler',
    j5_p: 'Byggede og vedligeholdt responsive websider og visuelt materiale til kundekampagner med HTML, CSS, JavaScript og Photoshop.',
    k_skills: 'Værktøjer', h_skills: 'Hvad jeg arbejder med',
    s1_h: 'Sprog', s2_h: 'Mobil', s2_1: 'Offline first', s2_2: 'State management',
    s3_h: 'Web og backend', s3_sql: 'SQL databaser',
    s4_h: 'Cloud og DevOps', s5_h: 'Engineering',
    s5_1: 'Systemdesign', s5_2: 'Objektorienteret design', s5_3: 'Oversættere', s5_4: 'Agilt samarbejde',
    s6_h: 'Support og drift', s6_1: 'Fejlfinding',
    k_edu: 'Uddannelse',
    e1_h: 'Kandidat (MSc) i software engineering',
    e1_s: 'Det Tekniske Fakultet for IT og Design. Starter september 2026.',
    e2_h: 'Bachelor (BSc) i teknisk videnskab (software), 180 ECTS',
    e2_s: 'Tildelt 6. juli 2026. Bachelorprojekt bedømt til 12, et A på ECTS skalaen.',
    e3_s: 'Gymnasial uddannelse.',
    k_contact: 'Kontakt', h_contact: 'Lad os tage en snak',
    contact_p: 'Full stack, mobil, backend, CI/CD — hvis det ender hos rigtige brugere, interesserer det mig. København eller remote. Den hurtigste vej til mig er en mail.',
    btn_mail: 'Skriv til mig',
    foot: 'København · <a href="https://github.com/jmkq0056/Portfolio" target="_blank" rel="noopener">kildekode</a>'
  };

  const EN = {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    EN[el.dataset.i18n] = EN[el.dataset.i18n] ?? el.innerHTML;
  });

  let lang = 'en';
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = l === 'da' ? (DA[el.dataset.i18n] ?? EN[el.dataset.i18n]) : EN[el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll('#l-en,#l2-en').forEach(e => e.classList.toggle('on', l === 'en'));
    document.querySelectorAll('#l-da,#l2-da').forEach(e => e.classList.toggle('on', l === 'da'));
    document.querySelectorAll('[data-words]').forEach(splitWords); // re-split after innerHTML swap
    measure();
  }
  document.querySelectorAll('#langbtn,#langbtn2').forEach(b =>
    b.addEventListener('click', () => {
      const next = lang === 'en' ? 'da' : 'en';
      setLang(next);
      try { localStorage.setItem('lang', next); } catch (e) {}
    }));

  /* ---------- theme (pre-paint script in <head> set the attribute) ---------- */
  const mq = matchMedia('(prefers-color-scheme: dark)');
  let dark = document.documentElement.dataset.theme === 'dark';
  function setTheme(d, remember) {
    dark = d;
    document.documentElement.dataset.theme = d ? 'dark' : 'light';
    document.querySelectorAll('#themebtn,#themebtn2').forEach(b =>
      b.setAttribute('aria-pressed', String(d)));
    if (remember) { try { localStorage.setItem('theme', d ? 'dark' : 'light'); } catch (e) {} }
  }
  setTheme(dark, false);
  document.querySelectorAll('#themebtn,#themebtn2').forEach(b =>
    b.addEventListener('click', () => setTheme(!dark, true)));
  mq.addEventListener('change', e => {
    let stored = null; try { stored = localStorage.getItem('theme'); } catch (err) {}
    if (!stored) setTheme(e.matches, false);
  });

  /* ---------- word splitting for the claim scene ---------- */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`)
      .join(' ');
    el.style.setProperty('--n', words.length);
  }
  document.querySelectorAll('[data-words]').forEach(splitWords);

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById('burger');
  const mobile = document.getElementById('mobile');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobile.classList.toggle('open');
  });
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open'); mobile.classList.remove('open');
  }));

  /* ---------- scrollspy ---------- */
  const spyTargets = ['about', 'work', 'experience', 'skills', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const allLinks = [...document.querySelectorAll('.navlinks a[href^="#"], .mobile a[href^="#"]')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        allLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  spyTargets.forEach(t => spy.observe(t));

  /* ---------- count-up numbers ---------- */
  function runCounter(span) {
    if (span._done) return;
    span._done = true;
    const target = parseFloat(span.dataset.count);
    const decimals = parseInt(span.dataset.decimals || '0', 10);
    if (reduced) { span.textContent = target.toFixed(decimals); return; }
    const t0 = performance.now(), dur = 1100;
    (function step(t) {
      const k = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      span.textContent = (target * eased).toFixed(decimals);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- the engine ---------- */
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const gathr = document.querySelector('.gathr');
  const gathrSteps = gathr ? [...gathr.querySelectorAll('.step')] : [];
  const gathrDots = gathr ? [...gathr.querySelectorAll('.step-dots i')] : [];
  const numbers = document.querySelector('.numbers');
  const counters = [...document.querySelectorAll('[data-count]')];
  const hscroll = document.querySelector('.hscroll');
  const track = document.getElementById('track');
  const nav = document.getElementById('nav');
  const bar = document.getElementById('bar');
  const isNarrow = () => matchMedia('(max-width: 860px)').matches;

  let vh = innerHeight;

  function measure() {
    vh = innerHeight;
    // horizontal section: its height is the horizontal distance to cover
    if (hscroll && track) {
      if (isNarrow() || reduced) {
        hscroll.style.height = '';
        track.style.setProperty('--shift', '0px');
      } else {
        const shift = Math.max(0, track.scrollWidth - innerWidth);
        track.style.setProperty('--shift', -shift + 'px');
        hscroll.style.height = (vh + shift) + 'px';
      }
    }
    for (const s of scenes) {
      const r = s.getBoundingClientRect();
      s._top = r.top + scrollY;
      s._h = s.offsetHeight;
    }
  }

  function frame() {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 10);
    const doc = document.documentElement;
    bar.style.width = (y / Math.max(1, doc.scrollHeight - doc.clientHeight) * 100) + '%';

    for (const s of scenes) {
      let p;
      if (s.dataset.scene === 'pin') {
        p = clamp((y - s._top) / Math.max(1, s._h - vh), 0, 1);
      } else {
        // progress of the element travelling up through the viewport
        p = clamp((y + vh - s._top) / (vh + s._h), 0, 1);
      }
      if (Math.abs((s._p ?? -1) - p) > 0.0004) {
        s._p = p;
        s.style.setProperty('--p', p.toFixed(4));
      }
    }

    // gathr step switching: panel straightens over the first third,
    // then the four captions take a quarter of the remainder each
    if (gathr && gathr._p !== undefined) {
      const active = clamp(Math.floor(gathr._p * 4.4), 0, 3);
      if (gathr._active !== active) {
        gathr._active = active;
        gathrSteps.forEach((el, i) => el.classList.toggle('on', i === active));
        gathrDots.forEach((el, i) => el.classList.toggle('on', i <= active));
      }
    }

    // counters fire once their band is a third of the way up the screen
    if (numbers && numbers._p > 0.35) counters.forEach(runCounter);

    requestAnimationFrame(frame);
  }

  /* pointer tilt on the 3D panel — desktop only, on top of the scroll pose */
  const visual = document.querySelector('.gathr-visual');
  const panel = document.querySelector('.panel3d');
  if (visual && panel && !reduced && matchMedia('(pointer: fine)').matches) {
    visual.addEventListener('mousemove', e => {
      const r = visual.getBoundingClientRect();
      panel.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * 7);
      panel.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * 7);
    });
    visual.addEventListener('mouseleave', () => {
      panel.style.setProperty('--mx', 0);
      panel.style.setProperty('--my', 0);
    });
  }

  addEventListener('resize', measure, { passive: true });
  addEventListener('load', measure);
  measure();

  if (reduced) {
    // CSS pins --p to 1 and flattens the pinned scenes; just finish the numbers
    counters.forEach(runCounter);
  } else {
    requestAnimationFrame(frame);
  }

  /* restore language: stored choice beats browser locale */
  let storedLang = null; try { storedLang = localStorage.getItem('lang'); } catch (e) {}
  if (storedLang === 'da' || storedLang === 'en') { if (storedLang !== 'en') setLang(storedLang); }
  else {
    /* device language OR a Copenhagen clock reads as a Danish visitor —
       catches Danes whose phone is set to English, no geo request needed */
    const langs = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
    let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (langs.includes('da') || tz === 'Europe/Copenhagen') setLang('da');
  }
})();
