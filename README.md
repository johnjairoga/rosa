# Plin — Plataforma de Verificación de Seguridad Personal

Plataforma latinoamericana para que mujeres verifiquen antecedentes criminales y seguridad personal de sus contactos de manera rápida, anónima y confiable.

---

## 📋 Etapas Completadas

### ✅ Etapa 1: Landing Page (Español Latino)
- Traducción completa del sitio de portugués (Brasil) a español latinoamericano
- Contenido adaptado a audiencia LATAM (no solo Brasil)
- Logo consistente en toda la página (Plin, no Plinq)
- Eliminación de scripts de tracking (Google Ads, Facebook Pixel, TikTok, Clarity, Lemonfy, Chatwoot)

### ✅ Etapa 2: Quiz Gamificado
- 4 pasos de recolección de datos:
  1. **Paso 1**: Número de WhatsApp del usuario (para recibir resultados)
  2. **Paso 2**: Nombre completo de la persona a buscar
  3. **Paso 3**: Número de WhatsApp de la persona
  4. **Paso 4**: Número de identificación (DNI/CURP/Cédula)
- Autoscroll automático a cada etapa (especialmente a la 4ta y a ATENCIÓN)
- Interfaz responsiva (móvil, tablet, desktop)
- Pantalla ATENCIÓN antes de resultados
- Validación de datos en cada paso

### ✅ Etapa 3: Modal de Resultados (Paywall)
- Modal no cerrable (no hay botón ×)
- Muestra datos de la persona buscada (nombre, teléfono, ID)
- Bloquea información de antecedentes (estado: "BLOQUEADO — USD $4.99")
- Precio: USD $4.99
- Botón "DESBLOQUEAR INFORMACIÓN"
- Responsive para móviles (estilo "sheet" desde abajo)

### ✅ Etapa 4: API WhatsApp Photo (EN DESARROLLO)
- Integración con API RapidAPI: WhatsApp Data v1
- Obtiene foto de perfil del contacto buscado
- Muestra foto en avatar del modal
- Fallback a placeholder SVG si no hay foto pública
- API Key seguro en variables de entorno (Vercel)

---

## 🚀 Etapas Pendientes

### ⏳ Etapa 5: Método de Pago
- Análisis entre **MercadoPago** y **Stripe** (pendiente decisión)
- Integración serverless en Vercel
- Webhook para procesar pagos
- Página de éxito/error post-pago

---

## 📁 Estructura del Proyecto

```
saveweb2zip-com-plin-com-br/
├── index.html                    # Landing page
├── css/
│   └── index--KQdJHxx.css       # Estilos compilados
├── js/
│   ├── index-BlpHuf2v.js        # React bundle (traducido)
│   └── quiz.js                   # Quiz gamificado (vanilla JS)
├── api/
│   └── whatsapp-photo.js        # Serverless function — RapidAPI
├── images/                       # Fotos de testimonios y artículos
│   ├── sarah-m.png
│   ├── jessica-t.png
│   ├── Michelle K.png
│   ├── ... (más fotos)
├── vercel.json                  # Configuración Vercel
└── .env.local                   # Variables de entorno (local)

imagenes/                        # Carpeta fuente (puede eliminarse)

.gitignore                       # Excluye .env.local, .vercel, *.py
```

---

## 🔧 Setup Local

### Requisitos
- Node.js 16+ (para Vercel CLI)
- npm o yarn
- API Key de RapidAPI (WhatsApp Data v1)

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/johnjairoga/rosa.git
cd rosa

# 2. Instalar Vercel CLI globalmente
npm install -g vercel

# 3. Crear archivo de variables de entorno
cat > saveweb2zip-com-plin-com-br/.env.local <<EOF
RAPIDAPI_KEY=tu_api_key_aqui
EOF

# 4. Levantar servidor local (reemplaza http-server)
cd saveweb2zip-com-plin-com-br
vercel dev --listen 8000
```

La página está disponible en **`http://localhost:8000`** con soporte para las funciones serverless en `/api/*`.

### Testing del Quiz
1. Abre `http://localhost:8000`
2. Completa los 4 pasos del quiz
3. Llegará a pantalla ATENCIÓN
4. Haz clic "Sí, quiero continuar"
5. Modal de resultados mostrará foto de WhatsApp (si está disponible)
6. Abre **DevTools (F12) → Network** para verificar que la llamada va a `/api/whatsapp-photo`

---

## 🌐 Deploy en Vercel

### Primeros pasos
1. Ve a https://vercel.com
2. Conecta tu cuenta GitHub
3. Importa el repositorio `rosa`
4. Selecciona el framework: **Other** (Static)
5. Output Directory: `saveweb2zip-com-plin-com-br`

### Variables de Entorno (En Vercel Dashboard)
Navega a: **Settings → Environment Variables**

```
Name: RAPIDAPI_KEY
Value: [tu API key de RapidAPI]
```

### Deploy
```bash
vercel deploy --prod
```

Tu sitio estará disponible en: `https://rosa.vercel.app` (o tu dominio personalizado).

---

## 🔐 Variables de Entorno Necesarias

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `RAPIDAPI_KEY` | API Key de RapidAPI WhatsApp Data v1 | https://rapidapi.com/airaudoeduardo/api/whatsapp-data1 |
| `MP_ACCESS_TOKEN` | (Futuro) Token de MercadoPago | MercadoPago Developer Dashboard |
| `STRIPE_SECRET_KEY` | (Futuro) Secret key de Stripe | Stripe Dashboard |

---

## 📊 Flujo de Usuario

```
1. Usuario entra a la página
   ↓
2. Ve hero, características, testimonios
   ↓
3. Hace clic "Protégete Ahora" o "Cuídate Ahora"
   ↓
4. Scroll a quiz (inline en la página)
   ↓
5. Completa 4 pasos del quiz (nombre, números, ID)
   ↓
6. Pantalla ATENCIÓN (confirmación)
   ↓
7. Modal de resultados con foto de WhatsApp
   ↓
8. Elige pagar $4.99 para desbloquear
   ↓
9. Redirige a pasarela de pago (MercadoPago/Stripe)
   ↓
10. Recibe resultados por WhatsApp
```

---

## 🛠️ Tecnologías Usadas

- **Frontend**: React (compilado a bundle minificado) + Vanilla JS (Quiz)
- **Backend**: Vercel Serverless Functions (Node.js)
- **APIs**: RapidAPI (WhatsApp Data)
- **Hosting**: Vercel
- **Estilos**: Tailwind CSS (compilado)
- **Traducción**: Manual (portugués → español latino)

---

## 📝 Notas de Desarrollo

### Cambios Principales Realizados

1. **Traducción completa**: Todos los textos visibles están en español latino
2. **Quiz integrado**: Se renderiza inline en la página (no como overlay)
3. **Paywall modal**: Aparece después de confirmar en ATENCIÓN, sin botón cerrar
4. **API de fotos**: Serverless function que obtiene foto de WhatsApp de manera segura
5. **Logo consistente**: Usa logo final desde el inicio (no cambia al cargar)

### Cambios en el Bundle React
- `plinq` → `plin` (todas las referencias)
- Sección de precios eliminada
- Botones redirigen al quiz

### Scripts Auxiliares Eliminados
Se usaron scripts Python durante desarrollo pero fueron eliminados antes del commit final (no están en el repo).

---

## 🤝 Soporte y Contacto

Para preguntas o issues sobre el desarrollo:
- GitHub Issues: https://github.com/johnjairoga/rosa/issues
- Email: [contacto]

---

## 📄 Licencia

Proyecto privado. © 2025

---

## 🎯 Roadmap

- [ ] **Etapa 5**: Integración de pago (MercadoPago o Stripe)
- [ ] Agregar fotos en artículos de prensa (lateral layout)
- [ ] Webhook de confirmación de pago
- [ ] Página de éxito post-pago
- [ ] Integración con WhatsApp API para enviar resultados automáticos
- [ ] Dashboard para usuarios verificados
- [ ] Soporte multiidioma (portugués, inglés)

---

**Última actualización**: Junio 2025
**Estado**: En desarrollo (Etapa 4/5)
