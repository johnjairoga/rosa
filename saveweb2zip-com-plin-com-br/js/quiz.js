/**
 * Quiz Gamificado INLINE — Reemplaza Sección de Precios
 *
 * Flujo:
 * 1. Se renderiza INLINE en #pricing (no es overlay)
 * 2. Reemplaza la sección de planes de precios estáticos
 * 3. Pasos 1-4 y ATENCIÓN se muestran en la página
 * 4. Solo el paywall final es un popup modal
 */

(function() {
  'use strict';

  // ============= CONFIGURACIÓN =============
  const QUIZ_CONFIG = {
    steps: [
      {
        id: 'userWhatsapp',
        title: '¿A qué número de WhatsApp quieres que te enviemos la información?',
        subtitle: 'Ingresa tu número para recibir los resultados',
        inputType: 'tel',
        placeholder: '+52 000-000-0000',
        dataKey: 'userWhatsapp'
      },
      {
        id: 'personName',
        title: '¿Cuál es el nombre completo de la persona que buscas?',
        subtitle: 'Ingresa el nombre completo para una búsqueda más precisa',
        inputType: 'text',
        placeholder: 'Juan Silva Santos...',
        dataKey: 'personName'
      },
      {
        id: 'personWhatsapp',
        title: '¿Cuál es el número de WhatsApp de la persona?',
        subtitle: 'Esto nos ayuda a localizar el perfil correcto',
        inputType: 'tel',
        placeholder: '+52 000-000-0000',
        dataKey: 'personWhatsapp'
      },
      {
        id: 'personId',
        title: '¿Cuál es el número de identificación de la persona?',
        subtitle: 'DNI / CURP / Cédula de ciudadanía',
        inputType: 'text',
        placeholder: 'Ej: XXXX-000000-XXXXX',
        dataKey: 'personId'
      }
    ]
  };

  // ============= ESTADO =============
  let quizState = {
    currentStep: 0,
    data: {
      userWhatsapp: '',
      personName: '',
      personWhatsapp: '',
      personId: ''
    }
  };

  // ============= UTILIDADES =============
  function log(msg, data = null) {
    console.log(`[Plin Quiz] ${msg}`, data || '');
  }

  function validateInput(value, inputType) {
    if (!value.trim()) return false;
    if (inputType === 'tel') return /[\d\s\-\+\(\)]+/.test(value) && value.length >= 7;
    if (inputType === 'text') return value.trim().length >= 2;
    return true;
  }

  // ============= RENDER INLINE =============
  function createQuizHTML() {
    const step = QUIZ_CONFIG.steps[quizState.currentStep];
    const progressDots = Array(QUIZ_CONFIG.steps.length)
      .fill(0)
      .map((_, i) => `<span class="plin-dot ${i <= quizState.currentStep ? 'active' : ''}"></span>`)
      .join('');

    return `
      <div class="plin-quiz-inline-container">
        <div class="plin-quiz-card">
          <!-- Progress -->
          <div class="plin-quiz-progress">${progressDots}</div>

          <!-- Contenido -->
          <div class="plin-quiz-content">
            <h2 class="plin-quiz-title">${step.title}</h2>
            <p class="plin-quiz-subtitle">${step.subtitle}</p>

            <input
              type="${step.inputType}"
              class="plin-quiz-input"
              id="plin-quiz-input"
              placeholder="${step.placeholder}"
              autocomplete="off"
              required
            />
          </div>

          <!-- Botón -->
          <button class="plin-quiz-btn-continue">
            ${quizState.currentStep === QUIZ_CONFIG.steps.length - 1 ? 'Ver Resultados →' : 'Continuar →'}
          </button>
        </div>
      </div>
    `;
  }

  function createWarningHTML() {
    return `
      <div class="plin-quiz-inline-container">
        <div class="plin-quiz-card plin-warning-card">
          <div class="plin-warning-content">
            <h2 class="plin-warning-title">⚠️ ATENCIÓN</h2>

            <div class="plin-warning-text">
              <p><strong>¡Nuestra inteligencia artificial realizará una verificación completa!</strong></p>
              <p>Existe el riesgo de encontrar información impactante.</p>
              <p>¿Estás segura de que deseas continuar?</p>
            </div>

            <div class="plin-warning-buttons">
              <button class="plin-btn-warning-yes">Sí, quiero continuar →</button>
              <button class="plin-btn-warning-no">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderQuizInline() {
    const container = document.getElementById('plin-quiz-inline');
    if (!container) return;

    // Agregar header con "Cómo Funciona" SOLO la primera vez
    if (!container.hasAttribute('data-initialized')) {
      const header = document.createElement('div');
      header.className = 'plin-quiz-header';
      header.innerHTML = `
        <h2 class="plin-quiz-section-title">Cómo Funciona</h2>
        <p class="plin-quiz-section-desc">En segundos, descubre información esencial para tu seguridad sobre quién acabas de conocer. Con tecnología avanzada y sistema dedicado, hacemos un análisis completo de los datos de la persona buscada, de forma automatizada y confidencial.</p>
      `;
      container.appendChild(header);

      // Agregar el texto "Rápido. Simple. Anónimo..."
      const tagline = document.createElement('div');
      tagline.className = 'plin-quiz-tagline';
      tagline.innerHTML = `
        <p class="plin-quiz-tagline-text">Rápido. Simple. Anónimo.</p>
        <p class="plin-quiz-tagline-cta">Ahora es tu turno 👇</p>
      `;
      container.appendChild(tagline);

      container.setAttribute('data-initialized', 'true');
    }

    // Buscar o crear el contenedor de steps
    let stepsContainer = container.querySelector('.plin-quiz-steps');
    if (!stepsContainer) {
      stepsContainer = document.createElement('div');
      stepsContainer.className = 'plin-quiz-steps';
      container.appendChild(stepsContainer);
    }

    stepsContainer.innerHTML = createQuizHTML();

    // Inyectar estilos (una sola vez)
    if (!document.getElementById('plin-quiz-styles')) {
      const style = document.createElement('style');
      style.id = 'plin-quiz-styles';
      style.textContent = getStyles();
      document.head.appendChild(style);
    }

    // Adjuntar eventos
    attachInlineEvents(stepsContainer);

    // NO hacer focus automático (causa scroll automático)
  }

  function attachInlineEvents(container) {
    const continueBtn = container.querySelector('.plin-quiz-btn-continue');
    const input = container.querySelector('.plin-quiz-input');

    // Continuar con Enter
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') continueBtn.click();
    });

    // Botón continuar
    continueBtn.addEventListener('click', () => {
      const value = input.value.trim();
      const step = QUIZ_CONFIG.steps[quizState.currentStep];

      if (!validateInput(value, step.inputType)) {
        input.style.borderColor = '#ec4899';
        input.style.borderWidth = '2px';
        setTimeout(() => {
          input.style.borderColor = '';
          input.style.borderWidth = '';
        }, 2000);
        return;
      }

      // Guardar dato
      quizState.data[step.dataKey] = value;
      log(`Paso ${quizState.currentStep + 1} completado`, { [step.dataKey]: value });

      // Siguiente paso o pantalla ATENCIÓN
      if (quizState.currentStep === QUIZ_CONFIG.steps.length - 1) {
        showWarningInline();
      } else {
        quizState.currentStep++;
        renderQuizInline();
      }
    });
  }

  // ============= PANTALLA ATENCIÓN (INLINE) =============
  function showWarningInline() {
    const container = document.getElementById('plin-quiz-inline');
    if (!container) return;

    container.innerHTML = createWarningHTML();

    // Eventos
    const yesBtn = container.querySelector('.plin-btn-warning-yes');
    const noBtn = container.querySelector('.plin-btn-warning-no');

    yesBtn.addEventListener('click', showResultsPaywall);
    noBtn.addEventListener('click', () => {
      // Volver a Paso 1
      quizState.currentStep = 0;
      renderQuizInline();
    });
  }

  // ============= POPUP PAYWALL (MODAL) =============
  function showResultsPaywall() {
    const { personName, personWhatsapp, personId } = quizState.data;

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'plin-paywall-overlay';
    overlay.id = 'plin-paywall-overlay';

    overlay.innerHTML = `
      <div class="plin-paywall-modal">
        <button class="plin-paywall-close" aria-label="Cerrar">×</button>

        <!-- Perfil -->
        <div class="plin-paywall-profile">
          <div class="plin-paywall-avatar">
            <div class="plin-paywall-avatar-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
              </svg>
            </div>
            <p class="plin-paywall-avatar-text">Foto WA<br>(próxima etapa)</p>
          </div>

          <div class="plin-paywall-profile-info">
            <div class="plin-paywall-info-row">
              <span class="plin-paywall-label">Nombre:</span>
              <span class="plin-paywall-value">${personName}</span>
            </div>
            <div class="plin-paywall-info-row">
              <span class="plin-paywall-label">Tel:</span>
              <span class="plin-paywall-value">${personWhatsapp}</span>
            </div>
            <div class="plin-paywall-info-row">
              <span class="plin-paywall-label">ID:</span>
              <span class="plin-paywall-value">${personId}</span>
            </div>
          </div>
        </div>

        <!-- Resultados bloqueados -->
        <div class="plin-paywall-results">
          <h3 class="plin-paywall-results-title">RESULTADOS DE ANTECEDENTES</h3>

          <div class="plin-paywall-results-blocked">
            <div class="plin-paywall-result-line">
              <span>████████ proceso judicial ████ 2021 ███████</span>
            </div>
            <div class="plin-paywall-result-line">
              <span>████ antecedentes ██████████████████ ████</span>
            </div>
            <div class="plin-paywall-result-line">
              <span>████████████████ registro ████ BLOQUEADO</span>
            </div>
            <div class="plin-paywall-gradient-overlay"></div>
          </div>
        </div>

        <!-- CTA de pago -->
        <div class="plin-paywall-section">
          <p class="plin-paywall-lock-icon">🔒</p>
          <p class="plin-paywall-text">
            Esta información está disponible<br>
            <strong>Desbloquea con un único pago de USD $4.99</strong>
          </p>

          <a href="#" class="plin-paywall-btn-unlock">
            🔓 DESBLOQUEAR INFORMACIÓN →
          </a>

          <p class="plin-paywall-footer">
            Pago único · Sin suscripción · Resultado inmediato
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Eventos
    const closeBtn = overlay.querySelector('.plin-paywall-close');
    const unlockBtn = overlay.querySelector('.plin-paywall-btn-unlock');

    closeBtn.addEventListener('click', () => {
      overlay.remove();
      quizState.currentStep = 0;
      renderQuizInline();
    });

    unlockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      log('Procesando pago', quizState.data);
      alert('Pago USD $4.99 — Próximamente integrar Stripe/PayPal');
    });
  }

  // ============= INSERTAR QUIZ DESPUÉS DEL HERO =============
  function insertQuizSection() {
    const root = document.getElementById('root');
    if (!root) {
      log('ERROR: No se encontró #root');
      return false;
    }

    // Estrategia CONFIABLE: Buscar TODAS las sections dentro de #root
    // El Hero es SIEMPRE la primera section (sections[0])
    // Insertar quiz DESPUÉS del Hero usando insertAdjacentElement
    const sections = root.querySelectorAll('section');

    if (sections.length === 0) {
      log('ERROR: No se encontraron sections en #root');
      return false;
    }

    // Crear contenedor del quiz
    const quizContainer = document.createElement('section');
    quizContainer.id = 'plin-quiz-inline';
    quizContainer.className = 'plin-quiz-section';

    // insertAdjacentElement NO hace scroll automático — es seguro
    const heroSection = sections[0];
    heroSection.insertAdjacentElement('afterend', quizContainer);

    // NO hacer scroll automático al quiz
    log('✓ Quiz insertado DESPUÉS del Hero');
    return true;
  }

  // ============= ESTILOS =============
  function getStyles() {
    return `
      /* CONTENEDOR INLINE */
      #plin-quiz-inline {
        width: 100%;
        padding: 40px 20px;
        display: block;
        position: relative;
        z-index: 1;
        box-sizing: border-box;
        background-color: #f9fafb;
      }

      .plin-quiz-inline-container {
        max-width: 500px;
        margin: 0 auto;
      }

      /* CARD QUIZ */
      .plin-quiz-card {
        background: white;
        border-radius: 24px;
        padding: 48px 32px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        animation: plin-fade-in 0.3s ease-out;
      }

      @keyframes plin-fade-in {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* PROGRESO */
      .plin-quiz-progress {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-bottom: 32px;
      }

      .plin-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #e5e7eb;
        transition: all 0.3s ease;
      }

      .plin-dot.active {
        background: #ec4899;
        transform: scale(1.2);
      }

      /* CONTENIDO */
      .plin-quiz-content {
        margin-bottom: 32px;
        text-align: center;
      }

      .plin-quiz-title {
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 12px 0;
        line-height: 1.3;
      }

      .plin-quiz-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
        line-height: 1.4;
      }

      /* INPUT */
      .plin-quiz-input {
        width: 100%;
        padding: 14px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 16px;
        font-family: inherit;
        margin-top: 20px;
        transition: all 0.3s ease;
        box-sizing: border-box;
      }

      .plin-quiz-input:focus {
        outline: none;
        border-color: #ec4899;
        box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
      }

      /* BOTONES */
      .plin-quiz-btn-continue {
        width: 100%;
        padding: 14px 24px;
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .plin-quiz-btn-continue:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
      }

      /* PANTALLA ATENCIÓN */
      .plin-warning-card {
        padding: 48px 32px;
      }

      .plin-warning-content {
        text-align: center;
      }

      .plin-warning-title {
        font-size: 36px;
        font-weight: 700;
        color: #dc2626;
        margin: 0 0 24px 0;
      }

      .plin-warning-text {
        margin-bottom: 32px;
      }

      .plin-warning-text p {
        font-size: 16px;
        color: #374151;
        margin: 0 0 12px 0;
        line-height: 1.6;
      }

      .plin-warning-text strong {
        color: #1f2937;
        font-weight: 700;
      }

      .plin-warning-buttons {
        display: flex;
        gap: 12px;
        flex-direction: column;
      }

      .plin-btn-warning-yes {
        padding: 14px 24px;
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .plin-btn-warning-yes:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
      }

      .plin-btn-warning-no {
        padding: 14px 24px;
        background: #f3f4f6;
        color: #6b7280;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .plin-btn-warning-no:hover {
        background: #e5e7eb;
        color: #374151;
      }

      /* PAYWALL OVERLAY */
      .plin-paywall-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        padding: 20px;
        animation: plin-fade-in 0.3s ease-out;
      }

      .plin-paywall-modal {
        background: white;
        border-radius: 24px;
        padding: 32px;
        max-width: 480px;
        width: 100%;
        position: relative;
        box-shadow: 0 20px 60px rgba(236, 72, 153, 0.3);
      }

      .plin-paywall-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 32px;
        color: #9ca3af;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .plin-paywall-close:hover {
        color: #ec4899;
        transform: rotate(90deg);
      }

      /* PERFIL */
      .plin-paywall-profile {
        display: flex;
        gap: 20px;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid #e5e7eb;
        align-items: flex-start;
      }

      .plin-paywall-avatar {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .plin-paywall-avatar-placeholder {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        flex-shrink: 0;
      }

      .plin-paywall-avatar-placeholder svg {
        width: 40px;
        height: 40px;
        stroke-width: 1.5;
      }

      .plin-paywall-avatar-text {
        font-size: 11px;
        color: #9ca3af;
        text-align: center;
        margin: 0;
        font-weight: 500;
        line-height: 1.3;
      }

      .plin-paywall-profile-info {
        flex: 1;
      }

      .plin-paywall-info-row {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        align-items: flex-start;
      }

      .plin-paywall-info-row:last-child {
        margin-bottom: 0;
      }

      .plin-paywall-label {
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        min-width: 60px;
      }

      .plin-paywall-value {
        font-size: 14px;
        color: #1f2937;
        font-weight: 500;
        word-break: break-word;
      }

      /* RESULTADOS BLOQUEADOS */
      .plin-paywall-results {
        margin-bottom: 32px;
      }

      .plin-paywall-results-title {
        font-size: 13px;
        font-weight: 700;
        color: #1f2937;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0 0 16px 0;
      }

      .plin-paywall-results-blocked {
        position: relative;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
      }

      .plin-paywall-result-line {
        font-size: 14px;
        color: #9ca3af;
        margin-bottom: 12px;
        line-height: 1.4;
        user-select: none;
        filter: blur(2px);
        opacity: 0.6;
      }

      .plin-paywall-result-line:last-child {
        margin-bottom: 0;
      }

      .plin-paywall-gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, transparent 0%, rgba(236, 72, 153, 0.15) 100%);
        border-radius: 12px;
        pointer-events: none;
      }

      /* PAYWALL SECTION */
      .plin-paywall-section {
        background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
        border-radius: 16px;
        padding: 24px;
        text-align: center;
      }

      .plin-paywall-lock-icon {
        font-size: 32px;
        margin: 0 0 12px 0;
      }

      .plin-paywall-text {
        font-size: 14px;
        color: #374151;
        margin: 0 0 16px 0;
        line-height: 1.5;
      }

      .plin-paywall-text strong {
        color: #dc2626;
        font-size: 16px;
      }

      .plin-paywall-btn-unlock {
        display: block;
        width: 100%;
        padding: 14px 24px;
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
        color: white;
        text-decoration: none;
        border: none;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 12px;
      }

      .plin-paywall-btn-unlock:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
      }

      .plin-paywall-footer {
        font-size: 12px;
        color: #9ca3af;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
      }

      /* RESPONSIVE */
      @media (max-width: 640px) {
        .plin-quiz-card {
          padding: 32px 24px;
        }

        .plin-quiz-title {
          font-size: 22px;
        }

        .plin-paywall-modal {
          padding: 24px;
        }

        .plin-paywall-profile {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .plin-warning-title {
          font-size: 28px;
        }
      }

      /* HEADER "CÓMO FUNCIONA" */
      .plin-quiz-header {
        padding: 40px 32px;
        text-align: center;
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(219, 39, 119, 0.05) 100%);
        border-radius: 24px;
        margin-bottom: 32px;
      }

      .plin-quiz-section-title {
        font-size: 32px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 16px 0;
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .plin-quiz-section-desc {
        font-size: 16px;
        color: #6b7280;
        margin: 0;
        line-height: 1.6;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      /* TAGLINE "RÁPIDO. SIMPLE. ANÓNIMO." */
      .plin-quiz-tagline {
        text-align: center;
        margin: 24px 0 32px 0;
        padding: 0;
      }

      .plin-quiz-tagline-text {
        font-size: 20px;
        font-weight: 600;
        color: #374151;
        margin: 0 0 8px 0;
        letter-spacing: 0.5px;
      }

      .plin-quiz-tagline-cta {
        font-size: 16px;
        color: #6b7280;
        margin: 0;
        font-weight: 500;
      }

      @media (max-width: 640px) {
        .plin-quiz-header {
          padding: 24px 16px;
          margin-bottom: 24px;
        }

        .plin-quiz-section-title {
          font-size: 24px;
        }

        .plin-quiz-section-desc {
          font-size: 14px;
        }
      }
    `;
  }

  // ============= REDIRIGIR BOTONES AL QUIZ =============
  function redirectArticlesToQuiz() {
    // Buscar todos los enlaces y botones
    const allLinks = document.querySelectorAll('a, button, [role="button"]');

    allLinks.forEach(link => {
      const text = link.textContent || '';

      // Redirigir "Leer artículo completo"
      if (text.includes('Leer artículo completo') || text.includes('Ler artigo completo')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Scroll al quiz
          const quizSection = document.getElementById('plin-quiz-inline');
          if (quizSection) {
            quizSection.scrollIntoView({ behavior: 'smooth' });
            log('✓ Redirigiendo a quiz desde artículo');
          }
        });
      }

      // Redirigir "Quiero Ser Parte" / "Cuídate Ahora" / "Quiero Assinar"
      if (text.includes('Quiero Ser Parte') || text.includes('Cuídate Ahora') ||
          text.includes('Quiero Assinar') || text.includes('Quiero Suscribirme') ||
          text.includes('Assinar agora')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Scroll al quiz
          const quizSection = document.getElementById('plin-quiz-inline');
          if (quizSection) {
            quizSection.scrollIntoView({ behavior: 'smooth' });
            log('✓ Redirigiendo a quiz desde CTA');
          }
        });
      }

      // Redirigir "Protégete Ahora" al quiz
      if (text.includes('Protégete Ahora') || text.includes('Protegete Ahora')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Scroll al quiz
          const quizSection = document.getElementById('plin-quiz-inline');
          if (quizSection) {
            quizSection.scrollIntoView({ behavior: 'smooth' });
            log('✓ Redirigiendo a quiz desde Protégete Ahora');
          }
        });
      }

      // DESACTIVAR links del footer (no deben redirigir)
      const footerLinks = ['Consejos de Seguridad', 'Centro de Ayuda', 'LGPD', 'Contáctanos',
                           'Política de Privacidad', 'Gobernanza de Datos', 'Términos de Servicio',
                           'ForwardRef', 'Recursos', 'Empresa'];
      if (footerLinks.some(linkText => text.includes(linkText))) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          log('✓ Link del footer desactivado: ' + text);
        });
        // Remover atributo href para que no sea un link funcional
        if (link.hasAttribute('href')) {
          link.removeAttribute('href');
          link.style.cursor = 'default';
        }
      }

      // Eliminar botón "Ve Cómo Funciona"
      if (text.includes('Ve Cómo Funciona') || text.includes('Ve Como Funciona') ||
          text.includes('Vea Cómo Funciona') || text.includes('Vea Como Funciona')) {
        link.style.display = 'none';
        log('✓ Botón "Ve Cómo Funciona" ocultado');
      }
    });
  }

  // ============= INICIALIZACIÓN =============
  function init() {
    // Esperar un poco para que React termine de renderizar
    setTimeout(() => {
      const root = document.getElementById('root');
      if (!root) {
        log('ERROR: #root no encontrado');
        return;
      }

      // ELIMINAR sección #pricing completamente
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.remove();
        log('✓ Sección #pricing eliminada');
      }

      // ELIMINAR sección #how-it-works (original "Cómo Funciona")
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        howItWorksSection.remove();
        log('✓ Sección #how-it-works eliminada');
      }

      // Fallback: buscar por clase o atributos si no tiene ID
      const allSections = root.querySelectorAll('section');
      allSections.forEach(section => {
        const text = section.textContent || '';
        if ((text.includes('Rápido') && text.includes('Simple') && text.includes('Anónimo')) ||
            (text.includes('Rápido.') && text.includes('Simple.') && text.includes('Anónimo.'))) {
          // Verificar que NO sea la sección del quiz (tiene id='plin-quiz-inline')
          if (section.id !== 'plin-quiz-inline' && !section.closest('#plin-quiz-inline')) {
            section.remove();
            log('✓ Sección "Cómo Funciona" original eliminada');
          }
        }
      });

      // ELIMINAR div.mt-10.text-center
      const divToRemove = root.querySelector('div.mt-10.text-center');
      if (divToRemove) {
        divToRemove.remove();
        log('✓ div.mt-10.text-center eliminado');
      }

      // ELIMINAR TODOS los div.flex.items-center.gap-4
      const flexDivs = root.querySelectorAll('div.flex.items-center.gap-4');
      flexDivs.forEach(div => {
        div.remove();
        log('✓ div.flex.items-center.gap-4 eliminado');
      });

      // Buscar la sección que contiene "Cómo" o "Como" (la sección de How It Works)
      const allText = root.innerText || '';
      if (!allText.includes('Como') && !allText.includes('Cómo')) {
        log('WARN: No se encontró "Cómo Funciona"');
      }

      // Insertar quiz (SIN scroll automático)
      if (insertQuizSection()) {
        renderQuizInline();
        log('✓ Quiz inicializado en su posición');
      }

      // Redirigir artículos al quiz (SOLO al hacer clic)
      setTimeout(() => {
        redirectArticlesToQuiz();
        log('✓ Enlaces de artículos redirigidos al quiz');
      }, 500);
    }, 1000);  // Aumentado a 1 segundo para dar tiempo a React
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exponer globalmente para debugging
  window.plinQuiz = {
    state: () => quizState,
    log: (msg) => log(msg)
  };

})();
