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

        // AUTOSCROLL a la 4ta etapa (última etapa del quiz)
        if (quizState.currentStep === QUIZ_CONFIG.steps.length - 1) {
          setTimeout(() => {
            const quizContainer = document.getElementById('plin-quiz-inline');
            if (quizContainer) {
              quizContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
              log('✓ Autoscroll a etapa 4');
            }
          }, 300);
        }
      }
    });
  }

  // ============= PANTALLA ATENCIÓN (INLINE) =============
  function showWarningInline() {
    const container = document.getElementById('plin-quiz-inline');
    if (!container) return;

    container.innerHTML = createWarningHTML();

    // AUTOSCROLL a la pantalla ATENCIÓN
    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'center' });
      log('✓ Autoscroll a ATENCIÓN');
    }, 300);

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
        padding: 32px 24px;
      }

      .plin-warning-content {
        text-align: center;
      }

      .plin-warning-title {
        font-size: 28px;
        font-weight: 700;
        color: #dc2626;
        margin: 0 0 16px 0;
      }

      .plin-warning-text {
        margin-bottom: 20px;
      }

      .plin-warning-text p {
        font-size: 14px;
        color: #374151;
        margin: 0 0 8px 0;
        line-height: 1.5;
      }

      .plin-warning-text strong {
        color: #1f2937;
        font-weight: 700;
      }

      .plin-warning-buttons {
        display: flex;
        gap: 10px;
        flex-direction: column;
      }

      .plin-btn-warning-yes {
        padding: 12px 20px;
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .plin-btn-warning-yes:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
      }

      .plin-btn-warning-no {
        padding: 12px 20px;
        background: #f3f4f6;
        color: #6b7280;
        border: none;
        border-radius: 10px;
        font-size: 14px;
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
        padding: 24px;
        max-width: 440px;
        width: 100%;
        position: relative;
        box-shadow: 0 20px 60px rgba(236, 72, 153, 0.3);
        max-height: calc(100vh - 40px);
        overflow-y: auto;
        box-sizing: border-box;
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
        gap: 16px;
        margin-bottom: 20px;
        padding-bottom: 16px;
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
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        flex-shrink: 0;
      }

      .plin-paywall-avatar-placeholder svg {
        width: 32px;
        height: 32px;
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
        margin-bottom: 20px;
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
        font-size: 13px;
        color: #9ca3af;
        margin-bottom: 8px;
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
        padding: 18px 20px;
        text-align: center;
      }

      .plin-paywall-lock-icon {
        font-size: 26px;
        margin: 0 0 8px 0;
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

        /* PAYWALL MODAL - MÓVIL */
        .plin-paywall-overlay {
          padding: 16px;
          display: flex;
          align-items: flex-end;
        }

        .plin-paywall-modal {
          padding: 18px;
          max-width: 100%;
          width: 100%;
          border-radius: 20px 20px 0 0;
          max-height: 92vh;
          overflow-y: auto;
        }

        .plin-paywall-close {
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          font-size: 28px;
        }

        /* Perfil en móvil */
        .plin-paywall-profile {
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 20px;
        }

        .plin-paywall-avatar-placeholder {
          width: 60px;
          height: 60px;
        }

        .plin-paywall-avatar-placeholder svg {
          width: 30px;
          height: 30px;
        }

        .plin-paywall-avatar-text {
          font-size: 10px;
        }

        /* Info en móvil */
        .plin-paywall-profile-info {
          width: 100%;
        }

        .plin-paywall-info-row {
          margin-bottom: 12px;
        }

        .plin-paywall-label {
          font-size: 12px;
          display: block;
          margin-bottom: 4px;
        }

        .plin-paywall-value {
          font-size: 14px;
          word-break: break-word;
        }

        /* Paywall section en móvil */
        .plin-paywall-section {
          padding: 16px;
          margin-bottom: 16px;
          border-radius: 12px;
        }

        .plin-paywall-lock-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .plin-paywall-text {
          font-size: 13px;
          margin-bottom: 12px;
        }

        /* Botón en móvil */
        .plin-paywall-btn-unlock {
          padding: 12px 16px;
          font-size: 14px;
          border-radius: 10px;
        }

        .plin-paywall-footer {
          font-size: 11px;
          margin-top: 8px;
        }

        .plin-warning-title {
          font-size: 28px;
        }
      }

      /* TABLET */
      @media (max-width: 1024px) and (min-width: 641px) {
        .plin-paywall-modal {
          max-width: 420px;
          padding: 28px;
        }

        .plin-paywall-profile {
          gap: 18px;
        }

        .plin-paywall-avatar-placeholder {
          width: 75px;
          height: 75px;
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

      // ELIMINAR solo div.flex.items-center.gap-4 que NO sean de testimonios
      const flexDivs = root.querySelectorAll('div.flex.items-center.gap-4');
      flexDivs.forEach(div => {
        // Verificar que NO sea parte de testimonios (que contiene imágenes de perfil)
        const parent = div.closest('section');
        const text = parent ? parent.textContent : '';

        // NO eliminar si está en sección de testimonios
        if (!text.includes('Sarah M.') && !text.includes('Jessica T.') &&
            !text.includes('Michelle K.') && !text.includes('Amanda S.') &&
            !text.includes('Carla R.') && !text.includes('Beatriz L.')) {
          div.remove();
          log('✓ div.flex.items-center.gap-4 eliminado');
        }
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

      // Eliminar imágenes específicas
      setTimeout(() => {
        const todasLasImagenes = root.querySelectorAll('img');
        todasLasImagenes.forEach(img => {
          const src = img.src || '';

          // Eliminar si apunta a lovable-uploads
          if (src.includes('lovable-uploads')) {
            img.remove();
            log('✓ Imagen lovable-uploads eliminada');
          }

          // Eliminar woman-phone-g1
          if (src.includes('woman-phone-g1')) {
            img.remove();
            log('✓ Imagen woman-phone eliminada');
          }

          // Eliminar sabrine-exame
          if (src.includes('sabrine-exame')) {
            img.remove();
            log('✓ Imagen sabrine-exame eliminada');
          }

          // Corregir logo Plin (header y footer)
          if (img.alt === 'Plin Logo' && (src.includes('Comunidade') || src.includes('Amanda'))) {
            img.src = '/images/Logo.png';
            log('✓ Logo Plin corregido');
          }

          // Corregir avatar Sarah M. (apunta erróneamente a +30.000 mulheres)
          if (img.alt === 'Sarah M.' && src.includes('30.000')) {
            img.src = '/images/sarah-m.png';
            log('✓ Avatar Sarah M. corregido');
          }

          // Corregir avatar Jessica T. (apunta erróneamente a plinq_pink_black)
          if (img.alt === 'Jessica T.' && src.includes('plinq_pink_black')) {
            img.src = '/images/jessica-t.png';
            log('✓ Avatar Jessica T. corregido');
          }

          // Corregir avatar Beatriz L. (apunta erróneamente a jessica-t)
          if (img.alt === 'Beatriz L.' && src.includes('jessica-t')) {
            img.src = '/images/Amanda S.png';
            log('✓ Avatar Beatriz L. corregido');
          }

        });

        // Eliminar párrafo "Feito com / Venditi" del footer
        root.querySelectorAll('p').forEach(p => {
          if (p.textContent.includes('Venditi') || p.textContent.includes('30.391.731')) {
            p.remove();
            log('✓ Párrafo Venditi eliminado del footer');
          }
        });

      }, 500);

      // Eliminar imagen duplicada de "Aos 28 anos" dentro del card
      setTimeout(() => {
        // Buscar DIRECTAMENTE todas las imágenes con "Aos 28 anos" en su src
        const allImages = root.querySelectorAll('img');
        const aos28Images = [];

        allImages.forEach(img => {
          const src = img.src || '';
          // Buscar de varias formas por si está codificado diferente
          if (src.includes('Aos') || src.includes('Aos%20') || src.includes('anos') || src.includes('%20anos')) {
            if (src.includes('criou') || src.includes('site') || src.includes('boy')) {
              aos28Images.push(img);
            }
          }
        });

        log('📍 Encontradas ' + aos28Images.length + ' imágenes de "Aos 28 anos"');

        // Mantener solo la PRIMERA, eliminar el resto
        aos28Images.forEach((img, index) => {
          if (index > 0) {
            img.remove();
            log('✓ Imagen duplicada #' + (index + 1) + ' eliminada');
          }
        });

        if (aos28Images.length > 1) {
          log('✅ Deduplicación completada - solo 1 imagen restante');
        }
      }, 1000);

      // Agregar foto a "Curitibana crea plataforma que"
      setTimeout(() => {
        log('🔍 Buscando card Curitibana...');

        // Target specifically <article> elements to avoid matching outer containers
        const articles = root.querySelectorAll('article');
        let found = false;

        for (let article of articles) {
          const text = article.textContent || '';

          if (text.includes('Curitibana') && text.includes('crea plataforma')) {
            log('📍 Encontrado article Curitibana');

            // Find the image container div (div.relative inside the article)
            const imgContainer = article.querySelector('div[class*="relative"]') || article.querySelector('div');

            if (imgContainer) {
              // Remove any remaining placeholder/broken image inside the container
              const oldImg = imgContainer.querySelector('img');
              if (oldImg) oldImg.remove();

              // Create the new image matching the style of the other cards
              const img = document.createElement('img');
              img.src = '/images/Curitibana cria plataforma que permite mulheres verificarem.png';
              img.alt = 'Curitibana cria plataforma que permite mulheres verificarem';
              img.style.width = '100%';
              img.style.height = '192px';
              img.style.objectFit = 'cover';
              img.style.display = 'block';
              img.style.transition = 'transform 0.3s';

              // Insert before badge overlay so badge stays on top
              imgContainer.insertBefore(img, imgContainer.firstChild);
              log('✓ Foto Curitibana insertada correctamente en contenedor de imagen');
              found = true;
            } else {
              log('⚠️ No se encontró contenedor de imagen en el article');
            }
            break;
          }
        }

        if (!found) {
          log('❌ No se encontró card Curitibana');
        }
      }, 2500);

      // Agregar foto a "Aos 28 anos" (card Exame)
      setTimeout(() => {
        log('🔍 Buscando card Aos 28 anos...');

        const articles = root.querySelectorAll('article');
        let found = false;

        for (let article of articles) {
          const text = article.textContent || '';

          if (text.includes('28 a') && (text.includes('sitio web') || text.includes('decepci') || text.includes('Exame') || text.includes('criou'))) {
            log('📍 Encontrado article Aos 28 anos');

            const imgContainer = article.querySelector('div[class*="relative"]') || article.querySelector('div');

            if (imgContainer) {
              const oldImg = imgContainer.querySelector('img');
              if (oldImg) oldImg.remove();

              const img = document.createElement('img');
              img.src = '/images/Aos 28 anos, ela criou um site para alertar mulheres quando o boy.png';
              img.alt = 'A los 28 años, ella creó un sitio web para alertar a las mujeres';
              img.style.width = '100%';
              img.style.height = '192px';
              img.style.objectFit = 'cover';
              img.style.display = 'block';
              img.style.transition = 'transform 0.3s';

              imgContainer.insertBefore(img, imgContainer.firstChild);
              log('✓ Foto Aos 28 anos insertada correctamente en contenedor de imagen');
              found = true;
            } else {
              log('⚠️ No se encontró contenedor de imagen en el article Aos 28 anos');
            }
            break;
          }
        }

        if (!found) {
          log('❌ No se encontró card Aos 28 anos');
        }
      }, 2500);

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
