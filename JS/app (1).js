/* =============================================
   UniEmprende — app.js
   Lógica principal: auth, datos, UI
   ============================================= */

/* ── Storage helpers ── */
const Store = {
  get: (k)       => JSON.parse(localStorage.getItem(k) || 'null'),
  set: (k, v)    => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k)    => localStorage.removeItem(k),
};

/* ── Auth helpers ── */
function getCurrentUser()  { return Store.get('uni_user'); }
function isLoggedIn()      { return !!getCurrentUser(); }

function logout() {
  Store.remove('uni_user');
  window.location.href = '/index.html';
}

/* ── Seed data: emprendimientos de ejemplo ── */
function seedEmprendimientos() {
  if (Store.get('uni_emprendimientos')) return;
  const seed = [
    {
      id: 'emp_1', userId: 'seed',
      nombre: 'CodeCampus',
      descripcion: 'Soluciones de software a medida para pequeñas empresas y startups. Desarrollo web, apps móviles y automatización de procesos con tecnología de punta.',
      categoria: 'tecnologia',
      owner: 'Carlos Mejía',
      color: '#FF6B2B',
      inicial: 'C',
    },
    {
      id: 'emp_2', userId: 'seed',
      nombre: 'SaborUni',
      descripcion: 'Comida casera saludable con entrega dentro del campus. Menús semanales equilibrados, opciones veganas y sin gluten. ¡Tu bienestar es nuestra prioridad!',
      categoria: 'alimentacion',
      owner: 'Laura Torres',
      color: '#10b981',
      inicial: 'S',
    },
    {
      id: 'emp_3', userId: 'seed',
      nombre: 'PixelArte Studio',
      descripcion: 'Diseño gráfico, ilustración digital y branding para negocios emergentes. Identidad visual que conecta con tu audiencia y comunica tu esencia.',
      categoria: 'arte',
      owner: 'Sofía Ramos',
      color: '#8b5cf6',
      inicial: 'P',
    },
    {
      id: 'emp_4', userId: 'seed',
      nombre: 'ThreadsUni',
      descripcion: 'Ropa universitaria personalizada: sudaderas, camisetas y accesorios con diseños exclusivos. Expresá tu identidad y orgullo por tu carrera.',
      categoria: 'moda',
      owner: 'Andrés Castro',
      color: '#f59e0b',
      inicial: 'T',
    },
    {
      id: 'emp_5', userId: 'seed',
      nombre: 'TutorRed',
      descripcion: 'Plataforma de tutorías entre pares universitarios. Conecta con estudiantes avanzados para reforzar materias difíciles en horarios flexibles.',
      categoria: 'servicios',
      owner: 'María López',
      color: '#0ea5e9',
      inicial: 'T',
    },
    {
      id: 'emp_6', userId: 'seed',
      nombre: 'EcoTech LAB',
      descripcion: 'Tecnología sostenible: sensores IoT para ahorro energético en hogares y edificios. Innovación verde desde las aulas universitarias.',
      categoria: 'tecnologia',
      owner: 'Diego Herrera',
      color: '#14b8a6',
      inicial: 'E',
    },
  ];
  Store.set('uni_emprendimientos', seed);
}

/* ── Obtener emprendimientos ── */
function getEmprendimientos() {
  return Store.get('uni_emprendimientos') || [];
}

/* ── Navbar state ── */
function updateNavbar() {
  const user = getCurrentUser();
  const loggedIn  = document.getElementById('navLoggedIn');
  const userArea  = document.getElementById('navUserArea');
  const username  = document.getElementById('navUsername');
  if (!loggedIn) return;

  if (user) {
    loggedIn.classList.remove('d-none');
    userArea.classList.add('d-none');
    if (username) username.textContent = `Hola, ${user.nombre.split(' ')[0]}`;
  } else {
    loggedIn.classList.add('d-none');
    userArea.classList.remove('d-none');
  }
}

/* ── Navbar scroll effect ── */
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Contador animado ── */
function animateCounters() {
  const items = document.querySelectorAll('.stat-number[data-target]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const step   = Math.ceil(target / 50);
      let current  = 0;
      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: .5 });

  items.forEach(el => observer.observe(el));
}

/* ── Tarjeta de emprendimiento ── */
function buildCard(emp) {
  return `
    <div class="col-sm-6 col-lg-4 card-item" data-cat="${emp.categoria}">
      <div class="emprendimiento-card">
        <div class="card-cover" style="background: linear-gradient(135deg, ${emp.color}33, ${emp.color}11);">
          <div class="card-cover-gradient"></div>
          <div class="card-avatar" style="background:${emp.color};">${emp.inicial}</div>
          <span class="card-category-badge">${labelCat(emp.categoria)}</span>
        </div>
        <div class="card-body-area">
          <div class="card-business-name">${emp.nombre}</div>
          <div class="card-description">${emp.descripcion}</div>
          <div class="card-owner"><i class="bi bi-person-fill"></i>${emp.owner}</div>
        </div>
      </div>
    </div>`;
}

function labelCat(cat) {
  const map = {
    tecnologia: 'Tecnología', alimentacion: 'Alimentación',
    moda: 'Moda', servicios: 'Servicios', arte: 'Arte & Diseño',
  };
  return map[cat] || cat;
}

/* ── Renderizar grilla ── */
function renderCards(filter = 'todos') {
  const container = document.getElementById('cardsContainer');
  if (!container) return;
  const emps = getEmprendimientos();
  const filtered = filter === 'todos' ? emps : emps.filter(e => e.categoria === filter);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="text-muted">
          <i class="bi bi-search fs-2 d-block mb-2"></i>
          No hay emprendimientos en esta categoría todavía.
        </div>
      </div>`;
    return;
  }
  container.innerHTML = filtered.map(buildCard).join('');
}

/* ── Filtros ── */
function initFilters() {
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCards(btn.dataset.cat);
    });
  });
}

/* ── Init página principal ── */
function initHomePage() {
  seedEmprendimientos();
  initNavScroll();
  updateNavbar();
  animateCounters();
  renderCards();
  initFilters();
}

/* ── Ejecutar según página ── */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (!page || page === 'home') initHomePage();
});
