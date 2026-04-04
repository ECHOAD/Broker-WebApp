---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
inputDocuments:
  - docs/prd.md
  - docs/ux-design-specification.md
workflowType: 'architecture'
project_name: 'Plataforma Web para Broker Inmobiliario'
user_name: 'Usuario'
date: '2026-04-04'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
El producto requiere una arquitectura full-stack web con dos superficies claras:
- una superficie publica SEO-first para landing, listados, proyectos y propiedades
- una superficie privada para cliente autenticado y panel administrativo del broker

Desde el punto de vista arquitectonico, las capacidades que mas pesan son:
- catalogo publico indexable
- detalle de propiedad con galeria e imagenes
- autenticacion opcional para clientes
- panel admin con CRUD de proyectos, propiedades, leads y cierres
- persistencia de leads antes de redireccionar a WhatsApp
- favoritos, historial de intereses y trazabilidad comercial
- soporte bilingue `es` / `en`
- auditoria sobre cambios relevantes

**Non-Functional Requirements:**
Los NFRs que realmente condicionan la arquitectura son:
- SEO fuerte en superficie publica
- tiempos de carga bajos en landing, listados y detalle
- operacion barata en free tier al inicio
- experiencia movil prioritaria
- persistencia confiable de leads
- seguridad de datos personales y consentimiento
- escalabilidad moderada sin redisenar el sistema

**Scale & Complexity:**
La complejidad actual se mantiene en `medium`.

- Primary domain: `full-stack web app para broker inmobiliario`
- Complexity level: `medium`
- Estimated architectural components: `8-10` piezas principales entre frontend publico, auth, admin, catalogo, leads, storage, auditoria y analitica basica

### Technical Constraints & Dependencies

- El MVP debe operar con costos minimos usando free tiers donde sea razonable.
- La web publica necesita SSR o rendering equivalente para indexacion.
- El sistema debe guardar el lead antes de abrir WhatsApp.
- El panel admin no requiere tiempo real en el MVP.
- Las imagenes son una dependencia critica del negocio y tambien el mayor riesgo de cuota.
- La integracion externa obligatoria del MVP es WhatsApp.

### Cross-Cutting Concerns Identified

- autenticacion y autorizacion por rol
- auditoria y trazabilidad comercial
- estrategia de imagenes y optimizacion de assets
- internacionalizacion `es/en`
- seguridad de datos y consentimiento
- observabilidad basica

## Starter Template Evaluation

### Primary Technology Domain

`Next.js full-stack web application` basada en App Router.

### Starter Options Considered

**Option A: Next.js oficial + Vercel + Supabase**
- Mejor alineacion con SSR, App Router y despliegue simple.
- Menor friccion operativa para MVP.
- Encaja bien con free tier, mientras se controle el peso de imagenes y egress.

**Option B: Next.js oficial + Railway + Supabase**
- Valida si mas adelante se quiere correr Next como servidor Node puro.
- Menos opinionada que Vercel.
- Pierde simplicidad inicial para un MVP small-ops.

**Option C: Cloudflare Workers/Pages + D1/R2**
- Puede ser muy barato.
- No es la mejor opcion para este dominio en primera version.
- Aumenta complejidad tecnica sin beneficio claro para el volumen inicial esperado.

### Selected Starter: Next.js Official Starter

**Rationale for Selection:**
La mejor base para este proyecto es el starter oficial de Next.js con defaults modernos. Reduce decisiones innecesarias, deja SSR listo, y encaja de forma natural con Vercel y un backend ligero sobre Supabase.

**Initialization Command:**

```bash
pnpm create next-app@latest broker-webapp --yes
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript habilitado por defecto
- App Router habilitado por defecto
- Node.js `20.9+` como baseline segun documentacion oficial de Next.js

**Styling Solution:**
- Tailwind CSS incluido por defecto en la instalacion recomendada

**Build Tooling:**
- Turbopack como bundler por defecto en desarrollo
- `next build` para produccion

**Testing Framework:**
- no viene opinionado con tests; se agregara despues sin bloquear el inicio

**Code Organization:**
- estructura basada en `app/`
- alias `@/*`
- separacion natural entre rutas publicas, autenticadas y admin

**Development Experience:**
- ESLint incluido
- setup rapido y consistente
- minimo trabajo de bootstrap

**Note:** La inicializacion del proyecto con este starter debe ser la primera historia tecnica de implementacion.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- stack principal: `Next.js + Vercel + Supabase`
- modelo de despliegue: una sola codebase full-stack
- base de datos: `Postgres` en Supabase
- auth: `Supabase Auth`
- storage: `Supabase Storage`
- estrategia publica SEO: SSR/ISR en rutas publicas

**Important Decisions (Shape Architecture):**
- panel admin en la misma app, no como producto separado
- seguridad con `RLS` y server-side enforcement
- leads persistidos antes de abrir WhatsApp
- evitar realtime en MVP salvo caso puntual
- estrategia de imagenes optimizada desde el primer dia

**Deferred Decisions (Post-MVP):**
- busqueda avanzada full-text o semantica
- colas y procesamiento asincrono dedicado
- CDN de imagenes alternativo
- CRM mas sofisticado
- multi-tenant o multi-broker

### Data Architecture

**Primary Database:**
- `Supabase Postgres`

**Why:**
- modelo relacional adecuado para propiedades, proyectos, leads, cierres y auditoria
- evita introducir infraestructura extra para auth, storage y DB
- suficiente para el volumen esperado del MVP

**Schema Management:**
- migrations nativas de Supabase
- SQL-first para esquema y politicas
- tipos TypeScript generados desde Supabase
- no introducir ORM en el MVP salvo necesidad real posterior

**Core Tables:**
- `profiles`
- `projects`
- `properties`
- `property_media`
- `favorites`
- `leads`
- `lead_property_interests`
- `lead_status_history`
- `closures`
- `audit_logs`

**Caching Strategy:**
- caching HTTP y de plataforma en contenido publico
- ISR/revalidation para listados y fichas publicas
- sin Redis en MVP

### Authentication & Security

**Authentication Method:**
- `Supabase Auth`
- email OTP o magic link desde el inicio
- Google OAuth como opcion habilitable cuando se configure el proveedor

**Authorization Pattern:**
- roles minimos: `broker_admin`, `client_user`
- validacion por rol en servidor
- `RLS` en tablas sensibles

**Security Rules:**
- cliente nunca escribe cierres, auditoria sensible ni datos administrativos directamente
- operaciones admin pasan por server-side handlers con service role controlado
- consentimiento almacenado con timestamp, source y contexto de propiedad

### API & Communication Patterns

**Backend Pattern:**
- no separar backend independiente en el MVP
- usar `Next.js Route Handlers` y `Server Actions` para operaciones de negocio

**API Style:**
- endpoints REST-like internos para operaciones explicitas
- acciones de servidor para formularios controlados del frontend

**External Integrations:**
- WhatsApp via deep link o URL generada luego de persistir el lead
- sin integraciones adicionales obligatorias en MVP

**Error Handling Standard:**
- errores de usuario claros
- fallback explicito cuando WhatsApp no abre
- logs server-side para operaciones criticas

### Frontend Architecture

**Rendering Strategy:**
- publico: `SSR/ISR`
- autenticado y admin: renderizado hibrido segun pantalla

**State Management:**
- server components por defecto
- estado de UI con React local
- filtros y busqueda reflejados en URL
- evitar store global en MVP salvo que surja necesidad real

**Routing Strategy:**
- rutas publicas indexables para landing, listados, proyectos y propiedades
- rutas privadas bajo segmentos separados para perfil y admin

**Internationalization:**
- soporte manual `es` / `en`
- estrategia simple basada en routing o diccionarios locales, sin sobreingenieria

### Infrastructure & Deployment

**Recommended MVP Stack:**
- frontend/full-stack runtime: `Next.js` en `Vercel Hobby`
- database/auth/storage: `Supabase Free`
- DNS: `Cloudflare DNS` opcional

**Why this stack wins for MVP:**
- menor friccion operacional
- mejor encaje con SEO y App Router
- menor costo inicial
- menos moving parts

**Validated Free-Tier Constraints as of 2026-04-04:**
- Vercel Hobby incluye `1 million invocations`, `100 GB Fast Data Transfer` y `1000 Image Optimization source images` segun su pagina de limits: https://vercel.com/docs/limits
- Supabase Free incluye `2` proyectos gratis, `500 MB` de base de datos por proyecto, `1 GB` de storage, `5 GB` de egress y `50,000 MAU`: https://supabase.com/docs/guides/platform/billing-on-supabase
- Netlify Free usa `300 credit limit / month` compartidos entre compute, bandwidth, web requests y deploys: https://www.netlify.com/pricing/

**Primary Operational Risk:**
- el primer cuello de botella no sera CPU ni Postgres; sera imagenes y transferencia

**Mitigations from Day 1:**
- comprimir imagenes antes de subir
- preferir WebP o AVIF
- limitar resolucion maxima
- no almacenar variantes innecesarias
- galeria moderada por propiedad

### Decision Impact Analysis

**Implementation Sequence:**
1. Inicializar app con `Next.js`
2. Configurar `Supabase` proyecto, auth y schema inicial
3. Construir superficie publica SEO
4. Implementar captura de leads y WhatsApp flow
5. Implementar auth cliente
6. Implementar panel admin y auditoria

**Cross-Component Dependencies:**
- la estrategia de SEO depende del modelo de rutas y fetch server-side
- la seguridad depende de combinar RLS con handlers server-side
- el costo operativo depende directamente de la estrategia de imagenes
- favoritos, intereses y cierres dependen de un modelo relacional limpio desde el inicio

## Recommended Alternative Notes

### Railway + Supabase

Alternativa razonable si en una fase posterior se desea:
- correr Next como servidor Node puro
- reducir dependencia de Vercel
- tener mayor flexibilidad de runtime

No es la opcion preferida para el MVP porque agrega friccion operativa sin resolver un problema actual del proyecto.

### Cloudflare Workers Stack

No recomendada para esta primera version. La descartamos por ahora porque:
- aumenta complejidad tecnica
- no mejora de forma decisiva el resultado del negocio en MVP
- el dominio necesita mas claridad operativa que optimizacion infra extrema
