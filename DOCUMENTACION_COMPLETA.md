# Productiva — Documentación Integral del Proyecto

---

## 1. Origen, Inquietud y Propuesta

### La Inquietud
La mayoría de las aplicaciones de productividad del mercado sufren de uno de dos extremos:
1. **Herramientas hipercomplejas (tipo Notion u Obsidian):** Requieren horas de configuración, armado de bases de datos y diseño de plantillas. Generan una falsa sensación de productividad: pasás más tiempo organizando el sistema que ejecutando el trabajo real.
2. **Listas de tareas planas (tipo To-Do básicos):** Son simples acumuladores de pendientes pasivos. No ayudan a priorizar, se vuelven listas infinitas que generan ansiedad y no distinguen entre un pago urgente de monotributo, una idea a futuro y una reunión de trabajo.

### La Propuesta
Construir una herramienta personal, intuitiva, moderna y visual que funcione como un **centro de operaciones cotidiano**, atacando frontalmente el mayor enemigo de la ejecución: **la procrastinación**.
* Debe responder a una sola pregunta al abrirla: **«¿Qué es lo más importante que debería hacer ahora?»**.
* Debe integrar en un solo lugar: **Tareas**, **Compromisos futuros**, **Vencimientos de pagos/deudas** y un **Historial de lo completado**.
* Nace para resolver las necesidades personales del creador, pero con una base arquitectónica lista para evolucionar hacia un **SaaS multiusuario comercializable**.

---

## 2. Principios Fundamentales de Diseño

1. **Costo \$0 (Arranque Sostenible):** Todo el stack y hosting aprovecha capas gratuitas de alta calidad, sin cobros automáticos ni sorpresas financieras.
2. **Antiprocrastinación en el centro:** La aplicación no solo te pregunta qué querés hacer; te ayuda a elegir entre tus pendientes existentes destacando una **Próxima Acción Concreta** con tiempo estimado (ej. 15-25 min) y te permite dividir tareas grandes en micro-pasos de fácil inicio.
3. **Simplicidad Radical:** Interfaz que cualquier persona sin conocimientos técnicos puede usar de inmediato en computadora o celular.
4. **Persistencia Garantizada:** Cada tarea, pago o categoría queda guardado de inmediato al crearlo o editarlo.
5. **Navegación en 4 Espacios Claros:**
   * ☀️ **Mi Día:** El foco operativo diario y la tarjeta de próxima acción recomendada.
   * 📅 **Próximos:** Compromisos cronológicos futuros y banco de ideas sin fecha (backlog sin presiones).
   * 💳 **Pagos y Deudas:** Control financiero de vencimientos, monotributo, servicios y cuotas con alertas previas.
   * ✅ **Completados:** Registro del progreso logrado con opción de reabrir tareas en cualquier momento.
6. **Campanita Always-On:** Indicador de avisos y vencimientos siempre visible en la cabecera.

---

## 3. Estado Actual del Desarrollo (Iteraciones Completadas)

### Etapa 1 — Arquitectura y Modelo de Datos
* Comparativa técnica entre Firebase y Supabase. Se seleccionó arquitectura con PostgreSQL y Row Level Security (RLS) para evitar cobros por lectura/escritura y garantizar portabilidad sin vendor lock-in.
* Definición de entidades relacionales: `User`, `Category`, `Task`, `SubTask`, `FinancialCommitment`, `Notification`.
* Diseño del algoritmo determinístico de puntuación de acción (`actionScore`) para priorizar sin requerir llamadas costosas a IA en el día a día.

### Etapa 2 — Primera Versión Funcional (MVP Operativo)
* **Entorno técnico moderno:** Vite + React 18+ (TypeScript) + Tailwind CSS v4 + Lucide Icons.
* **Layout y Navegación:** Pestañas *Mi Día*, *Próximos*, *Pagos* y *Completados*, con diseño responsive adaptado a móviles.
* **Caja Antiprocrastinación Hero:** Evalúa urgencia, importancia, fricción (duración) y tareas postergadas para sugerir la acción a realizar con una razón clara.
* **Modo Enfoque con Temporizador:** Cronómetro visual de 15/25/45 min con pantalla limpia para trabajar sin distracciones y botón para marcar completada con confeti.
* **Descomposición en Micro-pasos:** Modal para dividir tareas abrumadoras en pasos de 10-15 minutos.
* **Gestión Completa de Tareas:** Alta rápida con `Enter` en 1 clic, formulario con categorías predeterminadas editables, niveles de prioridad, duraciones estimadas y fechas límite.
* **Gestión Financiera de Pagos y Deudas:** Registro de compromisos con moneda (ARS, USD), organismo/comercio, fecha de vencimiento, recurrencias (única, mensual, anual), anticipación de aviso (0, 1, 2, 7 días), **botón de edición con lápiz (✏️)**, botón de pagar y registro histórico.
* **Historial y Deshacer:** Sección de completados con opción de reabrir tareas al instante y notificación flotante con botón *Deshacer* al marcar una tarea.

---

## 4. Stack Tecnológico

| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18+ con TypeScript | Tipado estricto, componentes modulares, mantenibilidad a largo plazo. |
| **Herramienta de Construcción** | Vite 8+ | Compilación ultrarrápida (<500ms), recarga instantánea en desarrollo (HMR). |
| **Estilos y Diseño UI** | Tailwind CSS v4 | Estilos basados en utilidades, rendimiento máximo sin CSS no utilizado, estética profesional contemporánea. |
| **Iconografía** | Lucide React | Iconos SVG limpios, accesibles y livianos. |
| **Feedback y Animaciones** | Canvas Confetti | Refuerzo conductual positivo al completar objetivos. |
| **Persistencia Actual** | Local-First (`localStorage`) | Cero latencia, funciona 100% offline, total privacidad sin necesidad de configurar servidores de entrada. |
| **Infraestructura SaaS (Etapa 6)** | Supabase (PostgreSQL 15+) | Capa gratuita de 500 MB (cientos de miles de registros), autenticación segura y políticas RLS por usuario. |
| **Hosting y Despliegue** | Vercel / Cloudflare Pages | Despliegue automático con cada `git push`, HTTPS gratuito, CDN global y costo \$0. |

---

## 5. Privacidad, Datos Sensibles y Compartir para Validación

### ¿Cómo funciona si comparto el link hoy para pedir feedback?
Una de las mayores ventajas de la arquitectura **Local-First** actual es la **privacidad por diseño**:
* **Tus datos NO se guardan en un servidor compartido central:** Se almacenan exclusivamente en el almacenamiento local del navegador (`localStorage`) de cada persona.
* **Si le enviás el link de Vercel a un colega, cliente o amigo:**
  * Esa persona abrirá su propia instancia limpia (con los ejemplos iniciales de bienvenida).
  * **No puede ver tus pagos (tu monotributo, la compra de Materasso, tus notas personales, etc.).**
  * Todo lo que esa persona cargue, cree o borre se guarda únicamente en su teléfono o computadora.
  * No hay riesgo de cruce de datos sensibles ni exposición de información privada durante las pruebas de validación.

### ¿Cómo funcionará cuando evolucione a SaaS multiusuario?
Cuando se integre la autenticación de Supabase (Etapa 6):
* Cada usuario tendrá su propia cuenta (email/contraseña o Google Auth).
* Se aplica **Row Level Security (RLS)** en PostgreSQL: la propia base de datos rechaza cualquier consulta de lectura o escritura donde el `user_id` no coincida con el usuario logueado. Ni siquiera un error en el frontend podría exponer datos de un usuario a otro.

---

## 6. Escalabilidad y Modelo de Negocio (Camino a SaaS / Venta)

La aplicación tiene un potencial comercial claro para profesionales independientes, consultores, freelancers y dueños de pequeños comercios que se abruman con Notion o Jira.

### Propuesta de Monetización (Freemium):
1. **Plan Gratuito (Starter / Validación):**
   * Hasta 50 tareas activas simultáneas.
   * Modo Enfoque y Antiprocrastinación básico.
   * Gestión de hasta 10 pagos mensuales.
   * Persistencia en 1 dispositivo.
2. **Plan Pro (Suscripción Mensual / Anual, ej. \$4 a \$7 USD/mes):**
   * Tareas y pagos ilimitados.
   * Sincronización en la nube multi-dispositivo en tiempo real (PC, laptop y móvil).
   * Alertas por correo / Web Push / Telegram o WhatsApp para no olvidar pagos.
   * Reporte de flujo de caja (cuánto se pagó en el mes vs. compromisos pendientes).
   * Asistente inteligente de priorización diaria por IA (vía API segura en backend).

---

## 7. Plan para Próximas Etapas

* **Etapa 3 — Agenda, Calendario y Recordatorios:**
  * Vista de calendario mensual y semanal interactivo.
  * Registro de reuniones y citas con horarios específicos.
* **Etapa 4 — Reportes Financieros y Alertas Push:**
  * Métricas avanzadas de gastos por categoría.
  * Web Push API mediante Service Worker (PWA) para avisos reales del navegador.
* **Etapa 5 — Asistencia Inteligente y Reglas de Optimización:**
  * Análisis de saturación de agenda y sugerencia de redistribución de tareas.
* **Etapa 6 — Multi-tenant con Supabase:**
  * Registro y login de usuarios, sincronización en la nube con RLS activado.
