'use strict';

// ── Custom Cursor ─────────────────────────────
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursor-trail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});
(function animateTrail() {
  tx += (mx - tx) * 0.12;
  ty += (my - ty) * 0.12;
  trail.style.left = tx + 'px';
  trail.style.top  = ty + 'px';
  requestAnimationFrame(animateTrail);
})();

const hoverTargets = 'a, button, [role="button"], input, textarea, .tech-card, .project-card, .clink, .music-bubble, #easter-trigger';
document.querySelectorAll(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

// ══════════════════════════════════════════════
//  MUSIC BUBBLE
// ══════════════════════════════════════════════
const musicAudio  = document.getElementById('musicAudio');
const musicBubble = document.getElementById('musicBubble');
const mbDiscWrap  = document.getElementById('mbDiscWrap');

let isPlaying = false;

function setPlayState(playing) {
  isPlaying = playing;
  if (playing) {
    musicBubble.classList.add('is-playing');
    musicAudio.play().catch(() => {});
  } else {
    musicBubble.classList.remove('is-playing');
    musicAudio.pause();
  }
}

// Klik bubble → toggle play/pause
musicBubble.addEventListener('click', () => {
  setPlayState(!isPlaying);
});

// Sync jika audio dihentikan oleh browser
musicAudio.addEventListener('pause', () => {
  if (isPlaying) musicBubble.classList.remove('is-playing');
  isPlaying = false;
});
musicAudio.addEventListener('play', () => {
  musicBubble.classList.add('is-playing');
  isPlaying = true;
});

// ── Particles ─────────────────────────────────
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let W, H;
function resizeCanvas() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.size  = Math.random() * 1.5 + 0.3;
    this.alpha = Math.random() * 0.4 + 0.05;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3 - 0.1;
    this.life = 0; this.maxLife = Math.random() * 300 + 150;
    this.color = Math.random() > 0.7 ? '#f59e0b' : '#f0f0f2';
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.life++;
    if (this.life > this.maxLife || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    const p = this.life / this.maxLife;
    const fade = p < 0.1 ? p / 0.1 : p > 0.9 ? (1 - p) / 0.1 : 1;
    ctx.save(); ctx.globalAlpha = this.alpha * fade;
    ctx.fillStyle = this.color; ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
}
const particles = Array.from({ length: 120 }, () => {
  const p = new Particle(); p.life = Math.floor(Math.random() * p.maxLife); return p;
});
(function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(drawParticles);
})();

// ── Navbar scroll ──────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 40); }, { passive: true });

// ── Mobile menu ────────────────────────────────
const menuBtn    = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;
menuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('active', menuOpen);
  menuBtn.setAttribute('aria-expanded', menuOpen);
});
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => {
  menuOpen = false; mobileMenu.classList.remove('active'); menuBtn.setAttribute('aria-expanded', false);
}));

// ── Scroll Reveal ──────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseFloat(entry.target.style.getPropertyValue('--delay') || '0');
    setTimeout(() => entry.target.classList.add('visible'), delay * 1000);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

// ── Counter Animation ──────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.count), duration = 1500, start = performance.now();
  (function update(now) {
    const ease = 1 - Math.pow(1 - Math.min((now - start) / duration, 1), 3);
    el.textContent = Math.floor(ease * target);
    if (ease < 1) requestAnimationFrame(update); else el.textContent = target;
  })(start);
}
new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
    counterObs.unobserve(entry.target);
  });
}, { threshold: 0.5 }).observe(document.getElementById('about'));
const counterObs = new IntersectionObserver(() => {}, {});

// ── Skill Bar Animation ────────────────────────
new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = 'var(--fill)'; bar.classList.add('animated'); }, i * 120);
    });
    skillObs.unobserve(entry.target);
  });
}, { threshold: 0.3 }).observe(document.getElementById('skills'));
const skillObs = new IntersectionObserver(() => {}, {});

// ── Counter observer fix ───────────────────────
new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
  });
}, { threshold: 0.5 }).observe(document.getElementById('about'));

// ── Toast ──────────────────────────────────────
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg, duration = 3000) {
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Contact Form — Web3Forms API ───────────────
const contactForm   = document.getElementById('contact-form');
const btnSend       = document.getElementById('btn-send');
const btnSendText   = document.getElementById('btn-send-text');
const btnSendIcon   = document.getElementById('btn-send-icon');
const btnSendSpinner = document.getElementById('btn-send-spinner');
const formStatus    = document.getElementById('form-status');
const captchaQuestion = document.getElementById('captcha-question');
const captchaAnswer   = document.getElementById('captcha-answer');

let expectedCaptchaSum = 0;

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 90) + 10; // 10-99
  const num2 = Math.floor(Math.random() * 90) + 10; // 10-99
  expectedCaptchaSum = num1 + num2;
  if (captchaQuestion) {
    captchaQuestion.textContent = `${num1} + ${num2} =`;
  }
  if (captchaAnswer) {
    captchaAnswer.value = '';
  }
}

// Generate initial captcha
if (contactForm) {
  generateCaptcha();
}

function setFormLoading(loading) {
  btnSend.disabled    = loading;
  btnSendText.textContent = loading ? 'Mengirim...' : 'Kirim Pesan';
  btnSendIcon.style.display    = loading ? 'none' : 'inline';
  btnSendSpinner.style.display = loading ? 'inline' : 'none';
}

function showFormStatus(type, msg) {
  formStatus.className = 'form-status';          // reset
  formStatus.textContent = msg;
  // trigger reflow so transition plays
  void formStatus.offsetHeight;
  formStatus.classList.add('show', type);
}

contactForm?.addEventListener('submit', async e => {
  e.preventDefault();

  // Basic client-side validation
  const name    = contactForm.querySelector('#form-name').value.trim();
  const email   = contactForm.querySelector('#form-email').value.trim();
  const message = contactForm.querySelector('#form-message').value.trim();
  const answer  = parseInt(captchaAnswer.value.trim(), 10);

  if (!name || !email || !message) {
    showFormStatus('error', '⚠️ Isi semua field dulu, bro.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFormStatus('error', '⚠️ Format email gak valid nih.');
    return;
  }
  if (isNaN(answer) || answer !== expectedCaptchaSum) {
    showFormStatus('error', '⚠️ Jawaban matematika salah, kamu bot ya?');
    generateCaptcha(); // Regenerate on wrong answer to prevent brute force
    return;
  }

  setFormLoading(true);
  formStatus.className = 'form-status'; // hide previous status

  try {
    const formData = new FormData(contactForm);
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();

    if (data.success) {
      showFormStatus('success', '✅ Pesan terkirim! Gue bakal bales secepatnya.');
      showToast('📨 Pesan sukses dikirim ke inbox!', 4000);
      contactForm.reset();
      generateCaptcha();
    } else {
      throw new Error(data.message || 'Gagal kirim pesan.');
    }
  } catch (err) {
    console.error('Web3Forms error:', err);
    showFormStatus('error', '❌ Gagal kirim. Cek koneksi atau coba lagi.');
    showToast('❌ Gagal kirim pesan. Coba lagi.', 4000);
    generateCaptcha();
  } finally {
    setFormLoading(false);
  }
});

// ── Konami Code Easter Egg ─────────────────────
const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let ki = 0;
document.addEventListener('keydown', e => {
  ki = e.key === konamiSeq[ki] ? ki + 1 : 0;
  if (ki === konamiSeq.length) {
    ki = 0; triggerConfetti();
    showToast('🎉 Konami Code unlocked! Programmer mode: ON', 4000);
  }
});
document.getElementById('easter-trigger')?.addEventListener('click', () => {
  triggerConfetti(); showToast('🥚 Easter egg found! +100 XP', 3000);
});

// ── Confetti ───────────────────────────────────
function triggerConfetti() {
  const cc = document.getElementById('confetti-canvas');
  cc.width = innerWidth; cc.height = innerHeight;
  const c = cc.getContext('2d');
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * cc.width, y: -20 - Math.random() * 100,
    w: Math.random() * 8 + 4, h: Math.random() * 4 + 2,
    color: ['#f59e0b','#f97316','#fbbf24','#fff','#ff6b6b'][Math.floor(Math.random() * 5)],
    vx: (Math.random() - 0.5) * 4, vy: Math.random() * 4 + 2,
    angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.2, alive: true,
  }));
  let frame;
  (function draw() {
    c.clearRect(0, 0, cc.width, cc.height);
    pieces.forEach(p => {
      if (!p.alive) return;
      p.x += p.vx; p.y += p.vy; p.angle += p.spin; p.vy += 0.08;
      if (p.y > cc.height + 20) p.alive = false;
      c.save(); c.translate(p.x, p.y); c.rotate(p.angle);
      c.fillStyle = p.color; c.globalAlpha = 0.9;
      c.fillRect(-p.w/2, -p.h/2, p.w, p.h); c.restore();
    });
    if (pieces.some(p => p.alive)) frame = requestAnimationFrame(draw);
    else { c.clearRect(0,0,cc.width,cc.height); cancelAnimationFrame(frame); }
  })();
}

// ── Console Easter Egg ─────────────────────────
setTimeout(() => {
  console.log('%c[alfa.]', 'color:#f59e0b;font-size:2rem;font-weight:bold;font-family:monospace');
  console.log('%cHai! Kamu lagi inspect element ya? Respect.', 'color:#f59e0b;font-family:monospace');
  console.log('%cAlfachridzy — XI TKJ | "Code is poetry, tapi deadline adalah prosa."', 'color:rgba(240,240,242,.6);font-size:.8rem;font-family:monospace');
  console.log('%c💡 Tip: Coba Konami Code. (↑↑↓↓←→←→BA)', 'color:rgba(240,240,242,.4);font-size:.75rem;font-family:monospace');
  console.log('%c🎵 Tip: Klik bubble musik di pojok kanan bawah!', 'color:rgba(245,158,11,.7);font-size:.75rem;font-family:monospace');
}, 500);

// ── Parallax ──────────────────────────────────
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const o1 = document.querySelector('.orb-1'); if (o1) o1.style.transform = `translateY(${y*0.08}px)`;
  const o2 = document.querySelector('.orb-2'); if (o2) o2.style.transform = `translateY(${-y*0.05}px)`;
}, { passive: true });

// ── Magnetic buttons ───────────────────────────
document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.3}px, ${(e.clientY-r.top-r.height/2)*0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ── Spotlight on about card ────────────────────
const aboutCard = document.getElementById('about-card');
if (aboutCard) {
  aboutCard.addEventListener('mousemove', e => {
    const r = aboutCard.getBoundingClientRect();
    const glow = aboutCard.querySelector('.glass-card-glow');
    if (glow) { glow.style.left = (e.clientX-r.left-100)+'px'; glow.style.top = (e.clientY-r.top-100)+'px'; }
  });
}

// ── 3D Tilt on cards ──────────────────────────
document.querySelectorAll('.tech-card, .project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top - r.height/2) / r.height) * -6;
    const ry = ((e.clientX - r.left - r.width/2) / r.width) * 6;
    card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ── Hero headline stagger ──────────────────────
window.addEventListener('load', () => {
  document.querySelectorAll('.headline-word').forEach((el, i) => {
    el.style.cssText = 'opacity:0;transform:translateY(30px);transition:opacity .7s cubic-bezier(.25,.46,.45,.94),transform .7s cubic-bezier(.25,.46,.45,.94)';
    setTimeout(() => { el.style.opacity='1'; el.style.transform='translateY(0)'; }, 300 + i*100);
  });
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal-up').forEach((el, i) => setTimeout(() => el.classList.add('visible'), i*150));
  }, 100);
});

// ── Smooth scroll ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
