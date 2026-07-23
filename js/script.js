let podcastPlayer = null;
let currentPodcast = null;

document.addEventListener('DOMContentLoaded', () => {
  renderDays();
  renderSchedule(getToday());
  renderPodcasts();
  initNavScroll();
});

function getToday() {
  const idx = new Date().getDay();
  return DAYS[idx === 0 ? 6 : idx - 1];
}

/* NAV */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function initNavScroll() {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-links a');

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navLinks').classList.remove('open');
    });
  });

  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 120;
      if (window.scrollY >= top) current = s.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
}

/* SCHEDULE */
function renderDays() {
  const container = document.getElementById('daysFilter');
  const today = getToday();
  DAYS.forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'day-btn' + (day === today ? ' active' : '');
    btn.textContent = day;
    btn.onclick = () => {
      document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSchedule(day);
    };
    container.appendChild(btn);
  });
}

function renderSchedule(day) {
  const container = document.getElementById('scheduleList');
  container.innerHTML = `
    <div style="text-align:center;padding:60px 20px;">
      <i class="fas fa-calendar-alt" style="font-size:48px;color:var(--gold);opacity:0.5;margin-bottom:16px;"></i>
      <p style="color:var(--text-dim);font-size:16px;">Próximamente</p>
      <p style="color:var(--text-dim);font-size:13px;margin-top:8px;">Estamos preparando nuestra parrilla de programación</p>
    </div>
  `;
}

/* PODCASTS */
function renderPodcasts() {
  const container = document.getElementById('podcastGrid');
  if (!podcasts.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;grid-column:1/-1;">
        <i class="fas fa-podcast" style="font-size:48px;color:var(--gold);opacity:0.5;margin-bottom:16px;"></i>
        <p style="color:var(--text-dim);font-size:16px;">Próximamente</p>
        <p style="color:var(--text-dim);font-size:13px;margin-top:8px;">Estamos preparando nuestro contenido de podcasts</p>
      </div>
    `;
    return;
  }
  container.innerHTML = podcasts.map(p => `
    <div class="podcast-card">
      <div class="podcast-header">
        <div class="podcast-icon"><i class="fas fa-microphone"></i></div>
        <div>
          <h4>${p.title}</h4>
          <div class="podcast-meta">${p.date} · ${p.duration}</div>
        </div>
      </div>
      <p>${p.desc}</p>
      <button class="btn-play" data-id="${p.id}" onclick="togglePodcast('${p.id}')">
        <i class="fas fa-play"></i> Escuchar
      </button>
    </div>
  `).join('');
}

function togglePodcast(id) {
  const podcast = podcasts.find(p => p.id === id);
  if (!podcast) return;

  const btn = document.querySelector(`.btn-play[data-id="${id}"]`);

  if (currentPodcast === id && podcastPlayer && !podcastPlayer.paused) {
    podcastPlayer.pause();
    btn.innerHTML = '<i class="fas fa-play"></i> Escuchar';
    btn.classList.remove('playing');
    currentPodcast = null;
    return;
  }

  if (podcastPlayer) {
    podcastPlayer.pause();
    document.querySelectorAll('.btn-play').forEach(b => {
      b.innerHTML = '<i class="fas fa-play"></i> Escuchar';
      b.classList.remove('playing');
    });
  }

  podcastPlayer = new Audio(podcast.url);
  podcastPlayer.play();
  btn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
  btn.classList.add('playing');
  currentPodcast = id;

  podcastPlayer.onended = () => {
    btn.innerHTML = '<i class="fas fa-play"></i> Escuchar';
    btn.classList.remove('playing');
    currentPodcast = null;
  };
}

/* LIVE PLAYER */
let liveAudio = null;

function toggleLivePlayer() {
  const icon = document.getElementById('playIcon');
  const text = document.getElementById('playText');

  if (liveAudio && !liveAudio.paused) {
    liveAudio.pause();
    liveAudio.src = '';
    liveAudio = null;
    icon.className = 'fas fa-play';
    text.textContent = 'Escuchar en vivo';
    return;
  }

  if (liveAudio) {
    liveAudio.src = '';
    liveAudio = null;
  }

  liveAudio = new Audio();
  liveAudio.crossOrigin = 'anonymous';
  liveAudio.preload = 'none';

  liveAudio.onerror = () => {
    icon.className = 'fas fa-play';
    text.textContent = 'Escuchar en vivo';
    liveAudio = null;
    alert('No se pudo conectar con la radio. Verifica tu conexión e intenta de nuevo.');
  };

  liveAudio.oncanplay = () => {
    liveAudio.play().catch(() => {
      liveAudio = null;
      alert('No se pudo reproducir el audio. Intenta de nuevo.');
    });
  };

  liveAudio.src = STREAM_URL;

  icon.className = 'fas fa-spinner fa-spin';
  text.textContent = 'Conectando...';
}

/* CONTACT */
function handleContact(e) {
  e.preventDefault();
  const form = e.target;
  const name = form[0].value;
  const email = form[1].value;
  const msg = form[2].value;

  const subject = encodeURIComponent('Mensaje de ' + name);
  const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${msg}`);
  window.open(`mailto:esperanzaradioquibor@gmail.com?subject=${subject}&body=${body}`);

  alert('Gracias por contactarnos. Te responderemos pronto.');
  form.reset();
}
