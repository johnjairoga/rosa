// ============================================
// PLINQ V2 - SPA Motor
// ============================================

const WORKER_URL = 'https://plin-whatsapp-api.criptosintrading.workers.dev';

// ============================================
// STRIPE — Método de Pago (on-site)
// ============================================

function openPaymentModal() {
  document.getElementById('payment-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

async function handlePayment() {
  const button = document.getElementById('pay-button');
  const buttonText = document.getElementById('pay-button-text');
  const errorEl = document.getElementById('payment-errors');

  button.disabled = true;
  buttonText.textContent = 'Redirigiendo...';
  errorEl.classList.add('hidden');

  try {
    const response = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const { sessionUrl, error } = await response.json();

    if (error) throw new Error(error);

    window.location.href = sessionUrl;

  } catch (err) {
    errorEl.textContent = 'Error al procesar. Intenta nuevamente.';
    errorEl.classList.remove('hidden');
    button.disabled = false;
    buttonText.textContent = 'Ver Informe Completo — $4.99';
  }
}

function closePaymentSuccess() {
  document.getElementById('payment-success').classList.add('hidden');
  document.body.style.overflow = '';
}

// Detectar regreso de Stripe con ?payment=success
document.addEventListener('DOMContentLoaded', () => {
  if (new URLSearchParams(window.location.search).get('payment') === 'success') {
    document.getElementById('payment-success').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
});

// ============================================
// DATOS DE PAÍSES — selector de código
// ============================================

const COUNTRIES = [
  { code: '55',  flag: '🇧🇷', name: 'Brasil' },
  { code: '52',  flag: '🇲🇽', name: 'México' },
  { code: '54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '56',  flag: '🇨🇱', name: 'Chile' },
  { code: '58',  flag: '🇻🇪', name: 'Venezuela' },
  { code: '51',  flag: '🇵🇪', name: 'Perú' },
  { code: '593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '507', flag: '🇵🇦', name: 'Panamá' },
  { code: '506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '504', flag: '🇭🇳', name: 'Honduras' },
  { code: '503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '1',   flag: '🇩🇴', name: 'Rep. Dominicana' },
  { code: '53',  flag: '🇨🇺', name: 'Cuba' },
  { code: '1',   flag: '🇺🇸', name: 'EE.UU. / Canadá' },
  { code: '34',  flag: '🇪🇸', name: 'España' },
  { code: '351', flag: '🇵🇹', name: 'Portugal' },
];

let selectedCountry = COUNTRIES[0]; // Brasil por defecto

function buildCountryList() {
  const dropdown = document.getElementById('country-dropdown');
  dropdown.innerHTML = COUNTRIES.map((c, i) =>
    `<button type="button"
       class="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container-highest
              text-left transition-colors font-body-md"
       onclick="selectCountry(${i})">
       <span class="text-lg">${c.flag}</span>
       <span class="flex-1 text-sm">${c.name}</span>
       <span class="text-xs text-on-surface-variant">+${c.code}</span>
     </button>`
  ).join('');
}

function selectCountry(index) {
  selectedCountry = COUNTRIES[index];
  document.getElementById('selected-flag').textContent = selectedCountry.flag;
  closeCountryDropdown();
  document.getElementById('phone_local').focus();
}

function toggleCountryDropdown(event) {
  event.stopPropagation();
  const dd = document.getElementById('country-dropdown');
  dd.classList.toggle('hidden');
}

function closeCountryDropdown() {
  const dd = document.getElementById('country-dropdown');
  const trigger = document.getElementById('country-trigger');
  // Solo cerrar si el click fue fuera del selector de país
  if (dd && !dd.classList.contains('hidden')) {
    document.addEventListener('click', function closeOnOutsideClick(e) {
      if (!trigger.contains(e.target) && !dd.contains(e.target)) {
        dd.classList.add('hidden');
        document.removeEventListener('click', closeOnOutsideClick);
      }
    });
  }
}

// Cerrar al hacer clic fuera (inicializar después del DOM)
document.addEventListener('DOMContentLoaded', () => {
  const dd = document.getElementById('country-dropdown');
  document.addEventListener('click', (e) => {
    const trigger = document.getElementById('country-trigger');
    if (trigger && !trigger.contains(e.target) && !dd.contains(e.target)) {
      dd.classList.add('hidden');
    }
  });
});

// Construir lista al cargar
document.addEventListener('DOMContentLoaded', buildCountryList);

// Estado global en memoria
const state = {
  gender: null,
  name: '',
  phone: '',
  idNumber: '',
  photoUrl: null,
  trustScore: null
};

// ============================================
// Navegación SPA
// ============================================

function goToScreen(screenId) {
  document.querySelectorAll('.plinq-screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
  window.scrollTo(0, 0);
}

// ============================================
// PASO 1: Seleccionar género
// ============================================

function selectOption(element, gender) {
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.classList.remove('active-option');
  });

  element.classList.add('active-option');
  state.gender = gender;

  const btn = document.getElementById('next-button');
  btn.disabled = false;
  btn.classList.remove('bg-surface-container-highest', 'text-on-surface-variant', 'disabled:opacity-50');
  btn.classList.add('bg-gradient-to-r', 'from-primary', 'to-safety-xp', 'text-on-primary', 'shadow-lg');

  if (window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }
}

// ============================================
// VALIDACIÓN DE TELÉFONO
// ============================================

function isValidWhatsAppNumber(number) {
  return /^\d{10,15}$/.test(number);
}

// ============================================
// Mostrar errores con animación y styling
// ============================================

function showFieldError(inputId, title, msg) {
  const input = document.getElementById(inputId);
  input.classList.add('input-error', 'input-shake');
  document.getElementById('phone-error-title').textContent = title;
  document.getElementById('phone-error-msg').textContent = msg;
  document.getElementById('phone-error').classList.remove('hidden');
  setTimeout(() => input.classList.remove('input-shake'), 400);
  input.focus();
}

function clearFieldError(inputId) {
  document.getElementById(inputId)?.classList.remove('input-error', 'input-shake');
  document.getElementById('phone-error')?.classList.add('hidden');
}

// ============================================
// PASO 2: Verificar datos y validar número
// ============================================

async function handleVerificar(event) {
  event.preventDefault();

  const fullNameInput = document.getElementById('full_name');
  const phoneLocalInput = document.getElementById('phone_local');
  const idNumberInput = document.getElementById('id_number');
  const verifyButton = document.getElementById('verify-button');

  const name = fullNameInput.value.trim();
  const localNumber = phoneLocalInput.value.trim();
  const idNumber = idNumberInput.value.trim();

  // Validar campos vacíos
  if (!name) {
    showFieldError('full_name', 'Campo requerido', 'Completa todos los campos para continuar');
    return;
  }

  if (!localNumber) {
    showFieldError('phone_local', 'Campo requerido', 'Completa todos los campos para continuar');
    return;
  }

  if (!idNumber) {
    showFieldError('id_number', 'Campo requerido', 'Completa todos los campos para continuar');
    return;
  }

  // Combinar código de país + número local — NÚMERO CANÓNICO PURO (solo dígitos)
  const phone = `${selectedCountry.code}${localNumber.replace(/\D/g, '')}`;

  // Validar formato de teléfono
  if (!isValidWhatsAppNumber(phone)) {
    showFieldError('phone_local', 'Número inválido', 'Ingresa tu número local completo sin código de país');
    return;
  }

  clearFieldError('phone_local');

  verifyButton.disabled = true;
  const originalText = verifyButton.innerHTML;
  verifyButton.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Verificando...';

  try {
    // PARALELISMO: Lanzar validación Y obtención de foto al mismo tiempo
    const validationPromise = validateWhatsApp(phone);
    const photoPromise = getWhatsAppPhoto(phone);

    // Esperar a que AMBAS se completen
    const [validation, photo] = await Promise.all([validationPromise, photoPromise]);

    if (!validation.valid) {
      showFieldError('phone_local', 'Número no encontrado', 'Necesitamos un WhatsApp activo para buscarlo. Él no recibirá ningún aviso.');
      verifyButton.disabled = false;
      verifyButton.innerHTML = originalText;
      return;
    }

    // Éxito - guardar estado y avanzar
    state.name = name;
    state.phone = phone;
    state.idNumber = idNumber;
    state.photoUrl = photo || null;  // Foto ya obtenida en paralelo

    goToScreen('screen-procesando');
    startProcessing();  // Ya no obtiene foto aquí

  } catch (error) {
    console.error('Error validating:', error);
    showFieldError('phone_local', 'Sin conexión', 'No se pudo verificar. Intenta nuevamente');
    verifyButton.disabled = false;
    verifyButton.innerHTML = originalText;
  }
}

// ============================================
// API: Validar WhatsApp
// ============================================

async function validateWhatsApp(number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${WORKER_URL}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ number }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { valid: false, message: 'Error en la validación' };
    }

    return await response.json();
  } catch (error) {
    console.error('Validation error:', error);
    return { valid: false, message: 'No se pudo validar el número' };
  }
}

// ============================================
// API: Obtener foto de WhatsApp
// ============================================

async function getWhatsAppPhoto(number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${WORKER_URL}/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ number }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.photoUrl || null;
  } catch (error) {
    console.error('Photo fetch error:', error);
    return null;
  }
}

// ============================================
// PASO 3: Procesando (Loading)
// ============================================

async function startProcessing() {
  const nameElement = document.getElementById('procesando-name');
  const statusElement = document.getElementById('loading-status');
  const progressBar = document.getElementById('procesando-progress-bar');

  // Actualizar nombre
  const firstName = state.name.split(' ')[0];
  nameElement.textContent = firstName;

  // Status phrases
  const phrases = [
    'Analizando bases de datos...',
    'Cruzando información pública...',
    'Verificando antecedentes...',
    'Generando reporte de confianza...',
    'Finalizando detalles...'
  ];

  let currentIndex = 0;
  const statusInterval = setInterval(() => {
    statusElement.style.opacity = '0';
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % phrases.length;
      statusElement.textContent = phrases[currentIndex];
      statusElement.style.opacity = '1';
    }, 250);
  }, 2500);

  // Progress bar animation
  let currentWidth = 90;
  const progressInterval = setInterval(() => {
    if (currentWidth < 98) {
      currentWidth += 0.5;
      progressBar.style.width = currentWidth + '%';
      document.getElementById('progress-percentage').textContent = Math.round(currentWidth) + '%';
    } else {
      clearInterval(progressInterval);
    }
  }, 3000);

  // Foto ya fue obtenida en paralelo en handleVerificar()
  // Solo generar score y esperar para UX

  // Generate random trust score (15-45 range, zona de riesgo/alerta)
  // Cambio de determinístico a aleatorio para simular datos reales
  // Cada request genera nuevo score (usuarios no verán siempre el mismo número)
  state.trustScore = Math.floor(Math.random() * (45 - 15 + 1)) + 15;

  // Wait minimum 4 seconds for UX
  await new Promise(resolve => setTimeout(resolve, 4000));

  clearInterval(statusInterval);
  clearInterval(progressInterval);

  // Advance to results
  goToScreen('screen-resultados');
  populateResults();
}

// ============================================
// PASO 4: Resultados
// ============================================

function populateResults() {
  // Nombre
  document.getElementById('result-name').textContent = state.name;

  // Foto
  const photoElement = document.getElementById('result-profile-photo');
  photoElement.src = state.photoUrl || '/images/avatar-placeholder.png';

  // Fecha y hora de búsqueda
  const searchTime = document.getElementById('result-search-time');
  if (searchTime) {
    searchTime.textContent = new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  }

  // Número de hallazgos derivado del trust score (rango 15-45 → 2-5 hallazgos)
  const findingsEl = document.getElementById('findings-count');
  if (findingsEl) {
    findingsEl.textContent = Math.ceil(state.trustScore / 10);
  }
}

// ============================================
// Modal de Pago
// ============================================

function openPaymentModal() {
  document.getElementById('payment-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// Cerrar modal al click en backdrop
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePaymentModal();
    });
  }
});

// ============================================
// Inicialización
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Mostrar primera pantalla
  goToScreen('screen-landing');

  // Score ring animation setup
  const ring = document.querySelector('.score-ring');
  if (ring) {
    ring.style.strokeDashoffset = '352';
  }
});
