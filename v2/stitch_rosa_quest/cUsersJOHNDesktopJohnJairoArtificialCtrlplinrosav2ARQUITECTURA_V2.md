# Arquitectura Plinq V2 - Gamified Trust Verification Platform

## Resumen

La segunda versión de Plin es una plataforma completamente gamificada de verificación de confianza llamada **Plinq**. 
Transforma el flujo de búsqueda de seguridad en una experiencia de juego con puntos XP, niveles, badges y misiones.

---

## Flujo de Pantallas (Verification Funnel)

### 1. **Landing Page** - `plinq_inicio_de_verificacion`
- Entrada minimalista al sistema
- CTA claro para comenzar verificación
- Muestra propuesta de valor
- Señales de confianza (LGPD, confidencialidad)

### 2. **Quiz Multi-paso** - `plinq_quiz_paso_1`, `plinq_quiz_paso_2`
- Recolecta datos del contacto a verificar:
  - Paso 1: Género (quién buscas)
  - Paso 2: Nombre, Teléfono, Ciudad
- Barras de progreso con XP rewards
- Elementos de gamificación en cada paso
- Validación en tiempo real

### 3. **Processing Screen** - `plinq_procesando_verificacion`
- Pantalla de espera con alto perceived value
- Muestra búsqueda activa en múltiples fuentes
- Cross-referencing de datos
- Background checks en progreso

### 4. **Trust Report Results** - `plinq_resultados_de_verificacion`
- Trust Score profesional (0-100)
- Desglose detallado:
  - Identidad verificada
  - Historial criminal
  - Huella social (redes sociales, antecedentes)
- Capacidad de compartir resultados

---

## Sistema de Diseño: "Empower & Protect"

### Colores Principales
- **Primary:** Deep Magenta `#b10e6b` → acciones y energía
- **Secondary:** Purple `#674bb5` → acciones secundarias
- **Safety XP:** Deep Pink `#DB2777` → tracking de progreso
- **Mission Gold:** `#FBBF24` → rewards y logros
- **Verified Teal:** `#2DD4BF` → verificación completada

### Tipografía
- **Headlines:** Plus Jakarta Sans (bold, moderna)
- **Body Text:** Inter (legible, neutral)
- **XP Display:** Plus Jakarta Sans Bold (métricas de gamificación)

### Estilo Visual
- **Soft Glassmorphism:** Superficies translúcidas con blur
- **Rounded Corners:** 16px en cards, pill-shaped en botones
- **Spacing Base:** 8px system (stack-sm: 12px, stack-md: 24px, stack-lg: 40px)

---

## Elementos de Gamificación

### 1. Experience Points (XP)
- Se ganan completando pasos del quiz
- Se ganan por verificaciones
- Se muestran en barras de progreso gruesas (12px)
- Gradiente pink-to-purple

### 2. Niveles/Ranks
- Progresión: Protectora → Elite Verified
- Cada nivel requiere XP acumulativo
- Mostrado como badge circular con avatar

### 3. Badges/Medals
- "Night Watchman" - búsquedas nocturnas
- "Community Leader" - contribuciones verificadas
- "Safety Champion" - misiones completadas

### 4. Misiones de Seguridad
- Cards grandes con glassmorphism
- Icon en la izquierda
- Etiqueta "Reward" en oro en esquina superior derecha
- Botón "Start" en la base

---

## APIs y Integraciones

### RapidAPI Endpoints (Ya verificados)
1. **WhatsApp Photo Lookup**
   - GET `https://whatsapp-data1.p.rapidapi.com/picture/{number}`
   - Obtiene foto de perfil de WhatsApp

2. **WhatsApp Number Validation**
   - POST `https://whatsapp-number-validator3.p.rapidapi.com/WhatsappNumberHasItWithToken`
   - Valida si número tiene WhatsApp activo

### Cloudflare Worker
- Proxy seguro en `src/index.js`
- Maneja CORS
- Protege API keys
- Endpoints: `/` (foto) y `/validate` (validación)

---

## Estructura de Carpetas (Objetivo V2)

```
rosa/
├── src/
│   └── index.js                    # Worker actualizado para v2
├── saveweb2zip-com-plin-com-br/
│   ├── index.html                  # Landing page gamificada
│   ├── quiz.js                     # Quiz actualizado (multi-paso gamificado)
│   ├── css/
│   │   └── index.css               # Estilos Empower & Protect
│   ├── js/
│   │   ├── quiz.js                 # Lógica del quiz
│   │   ├── gamification.js         # XP, badges, niveles
│   │   ├── api-client.js           # Llamadas a Worker
│   │   └── results.js              # Reporte de confianza
│   ├── api/
│   │   └── whatsapp-photo.js       # Vercel serverless (deprecated, usar Worker)
│   └── images/
└── v2/                             # Documentación y diseños de referencia
    ├── plinq_project_prd.md
    ├── ARQUITECTURA_V2.md          # Este archivo
    └── stitch_rosa_quest/          # Exports de Stitch (referencia visual)
```

---

## Próximos Pasos (Orden de Implementación)

### Fase 1: Setup Base
- [ ] Crear `saveweb2zip-com-plin-com-br/css/design-system.css` con Empower & Protect
- [ ] Crear `saveweb2zip-com-plin-com-br/js/gamification.js` (XP system)

### Fase 2: Frontend Gamificado
- [ ] Actualizar `index.html` con landing gamificada
- [ ] Reescribir `quiz.js` para multi-paso (Paso 1: Género, Paso 2: Datos)
- [ ] Agregar animaciones de XP rewards

### Fase 3: Resultados y Trust Score
- [ ] Crear pantalla de procesamiento (loading animado)
- [ ] Crear reporte de Trust Score (0-100)
- [ ] Agregar capacidad de compartir

### Fase 4: Deploy y Preview
- [ ] Commit todos los cambios a rama `v2`
- [ ] Configurar Cloudflare Pages para monitorear `v2`
- [ ] Generar preview link para equipo

---

## Datos que Colecta el Quiz

El flujo de verificación requiere:

1. **Género del contacto** (Paso 1)
   - Radio buttons: Hombre / Mujer / Otro
   - XP reward: +50 XP

2. **Datos del contacto** (Paso 2)
   - Nombre (input text)
   - Número WhatsApp (input tel, validación en tiempo real)
   - Ciudad (dropdown o input)
   - XP reward: +100 XP por completar

---

## Notas Técnicas Importantes

- **Mobile-first:** Diseñado para dispositivos móviles (4-col grid, 20px margins)
- **Glassmorphism:** Usar `backdrop-filter: blur(12px)` + `rgba(255,255,255,0.7)`
- **LGPD/GDPR Compliance:** Búsquedas anónimas, sin rastreo del sujeto
- **Responsiveness:** Escalar a 8/12-col en tablet/desktop, max-width 1200px

---

## Referencia Visual

Ver en `v2/stitch_rosa_quest/`:
- `plinq_inicio_de_verificacion/screen.png` → Landing
- `plinq_quiz_paso_1/screen.png` → Paso 1
- `plinq_quiz_paso_2/screen.png` → Paso 2
- `plinq_procesando_verificacion/screen.png` → Loading
- `plinq_resultados_de_verificacion/screen.png` → Trust Report
