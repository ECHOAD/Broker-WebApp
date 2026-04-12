---
stepsCompleted:
  - step-01-init
inputDocuments:
  - docs/prd.md
  - docs/architecture.md
workflowType: 'ux-design'
project_name: 'Plataforma Web para Broker Inmobiliario'
user_name: 'Usuario'
date: '2026-04-04'
---

# UX Design Specification - Plataforma Web para Broker Inmobiliario

**Author:** Usuario
**Date:** 2026-04-04

---

# Homepage Design — "Tu broker, tus propiedades, sin vueltas"

## Design Intent: El Gateway

El homepage no es una landing page. Es **la puerta de entrada a toda la experiencia**. Como entrar a una oficina inmobiliaria bien diseñada: no te tiran un catálogo en la cara ni te obligan a escuchar un pitch. Te reciben, te orientan y te muestran las puertas correctas según lo que necesitás.

### Principios de Gateway

1. **Claridad inmediata** — "estás en el lugar correcto" en menos de 3 segundos
2. **Múltiples puertas de entrada** — no un solo CTA, sino caminos claros para distintos intents
3. **Sin callejones sin salida** — cada sección debe llevar a algo
4. **Sensación de bienvenida** — no de landing genérica

### La Tensión Dual

- **Usuario que ya conoce al broker:** llega con prisa, quiere ver propiedades, filtrar, contactar. No necesita que le cuenten quién es.
- **Usuario que descubre al broker:** llega con cautela, necesita saber rápido quién está detrás antes de confiarle su interés o su dinero.

Ambos deben sentir que están en el lugar correcto. La marca personal es fuerte, el tono es cercano y accesible, y la audiencia es mixta. La solución no es "sección del broker arriba" o "propiedades arriba". Es **entrelazar presencia humana con inmediatez del catálogo**.

---

## Sección 1: Hero — La Recepción

### Rol como Gateway

Esta sección no vende. **Recibe.** Es como el broker que te abre la puerta y te dice "pasá, mirá lo que hay, si necesitás algo estoy acá". El usuario debe poder hacer algo útil sin scrollear.

### Composición

Layout asimétrico en desktop (60/40), apilado en mobile. El broker mira hacia el contenido (hacia las herramientas de búsqueda), no hacia afuera.

**Lado izquierdo (contenido principal):**
- Nombre del broker como headline principal (H1)
- Subheadline con promesa de valor: *"Lotes, villas y edificios seleccionados para vos"*
- **No hay CTA primario aquí** — los CTAs están en los filtros y las secciones siguientes. El hero orienta, no empuja.

**Lado derecho (visual):**
- Foto real del broker (no stock), mirando hacia los filtros/contenido
- Fondo cálido, no corporativo. Transmite cercanía, no distancia.

**Filtros rápidos integrados — la primera puerta:**
- Debajo del headline, visibles sin scrollear
- Tipo de propiedad (selector): Lotes, Villas, Buildings
- Presupuesto (range o selector): min-max
- Ubicación (opcional, texto libre o selector)
- Botón "Buscar" integrado

El usuario que sabe lo que busca puede empezar *antes* de scrollear. El que no sabe, puede scrollear para explorar.

### Comportamiento

- En mobile, los filtros se colapsan en un drawer horizontal scrolleable o un botón "Filtrar" que abre un panel
- Los filtros reflejan su estado en la URL para compartir y bookmark
- El botón "Buscar" lleva al catálogo con los filtros aplicados
- Si el usuario no interactúa con los filtros, el scroll natural lo lleva a propiedades destacadas

### Puertas que abre

- Filtros + Buscar → Catálogo filtrado
- Scroll natural → Propiedades destacadas (sección 2)
- Foto/nombre del broker → Sección de confianza (sección 3)

---

## Sección 2: Propiedades Destacadas — El Escaparate

### Rol como Gateway

Sin sección intermedia de "sobre mí". Directo al grano. Esto le dice al usuario que llega por SEO: *"sí, esto es lo que buscabas"* y al que te conoce: *"mirá qué hay de nuevo"*.

Cada propiedad es una puerta. Cada card debe invitar a entrar, no solo mostrar.

### Contenido

- 3-6 propiedades destacadas en cards limpias
- Cada card muestra:
  - Foto principal (optimizada, WebP/AVIF)
  - Tipo de propiedad (badge: Lote, Villa, Building)
  - Precio visible o "Consultar precio"
  - Ubicación aproximada
  - Estado comercial (disponible, reservada, etc.)
  - CTA: **"Ver detalle"** — puerta al detalle de propiedad

### Layout

- Grid responsive: 1 columna en mobile, 2 en tablet, 3 en desktop
- Scroll horizontal en mobile como alternativa al grid
- Header de sección: *"Propiedades destacadas"* con link **"Ver todas"** → puerta al catálogo completo

### Puertas que abre

- Cada card → Detalle de propiedad
- "Ver todas" → Catálogo completo
- Scroll natural → El broker (sección 3)

---

## Sección 3: El Broker — La Confianza

### Rol como Gateway

Acá es donde el que no te conoce te descubre. Pero no es un "About Me" largo. Es un bloque compacto y cálido que dice: *"hay una persona real detrás de esto, y podés hablar con ella"*.

### Contenido

- Foto real del broker
- Nombre + frase corta: *"Hola, soy [Nombre]. Hace [X] años ayudo a personas a encontrar el lugar correcto. Si querés hablar, escribime."*
- Métricas de confianza opcionales:
  - Propiedades vendidas
  - Años en el mercado
  - Clientes satisfechos
- CTA directo: **"Hablemos por WhatsApp"** → puerta al contacto directo

### Comportamiento

- Posicionado *después* de las propiedades, no antes
- El usuario que busca inmuebles primero ve inmuebles. Si scrollea, te encuentra.
- En mobile, las métricas se apilan verticalmente

### Puertas que abre

- WhatsApp → Contacto directo con contexto
- Scroll natural → Tipos de propiedad (sección 4)

---

## Sección 4: Tipos de Propiedad — Las Puertas por Categoría

### Rol como Gateway

Acceso rápido visual al catálogo por categoría. Reduce fricción para usuarios que saben qué tipo de inmueble buscan pero no quieren usar los filtros del hero.

### Contenido

- 3 cards visuales (expandibles post-MVP):
  - **Lotes** — imagen representativa, descripción corta, link al listado
  - **Villas** — imagen representativa, descripción corta, link al listado
  - **Buildings** — imagen representativa, descripción corta, link al listado

### Layout

- Grid horizontal en desktop, vertical en mobile
- Cada card es cliqueable y lleva al catálogo filtrado por ese tipo

### Puertas que abre

- Cada card → Catálogo filtrado por tipo de propiedad
- Scroll natural → Proyectos destacados (sección 5)

---

## Sección 5: Proyectos Destacados — Las Puertas Agrupadas

### Rol como Gateway

Dar visibilidad a proyectos como agrupadores de propiedades. No todos los usuarios entienden qué es un "proyecto" inmobiliario; esta sección lo hace tangible.

### Contenido

- 2-3 proyectos destacados
- Cada card muestra:
  - Imagen hero del proyecto
  - Nombre del proyecto
  - Ubicación aproximada
  - Cantidad de propiedades disponibles
  - CTA: **"Ver proyecto"** → puerta al detalle del proyecto

### Puertas que abre

- Cada card → Detalle del proyecto con sus propiedades
- Scroll natural → CTA final (sección 6)

---

## Sección 6: CTA Final — La Última Puerta

### Rol como Gateway

Última oportunidad de conversión antes del footer. No es un formulario frío. Es una invitación directa. Si el usuario llegó hasta acá y no encontró lo que buscaba, esta sección le dice: *"no pasa nada, hablemos igual"*.

### Contenido

- Frase: *"¿No encontrás lo que buscás? Hablemos."*
- CTA principal: **"Escribime por WhatsApp"** → puerta al contacto directo
- CTA secundario: **"Ver todas las propiedades"** → puerta al catálogo completo (loop de retorno)

### Puertas que abre

- WhatsApp → Contacto directo
- "Ver todas las propiedades" → Catálogo completo (el usuario vuelve a explorar)

---

## Mapa de Puertas del Gateway

| Sección | Puerta | Destino | Intent del usuario |
|---------|--------|---------|-------------------|
| Hero | Filtros + Buscar | Catálogo filtrado | "Sé lo que quiero" |
| Hero | Scroll | Propiedades destacadas | "Quiero ver qué hay" |
| Propiedades | Card individual | Detalle de propiedad | "Esta me interesa" |
| Propiedades | "Ver todas" | Catálogo completo | "Quiero explorar más" |
| Broker | WhatsApp | Contacto directo | "Quiero hablar con una persona" |
| Tipos | Card de tipo | Catálogo por tipo | "Busco un tipo específico" |
| Proyectos | Card de proyecto | Detalle del proyecto | "Me interesa un desarrollo" |
| CTA Final | WhatsApp | Contacto directo | "No encontré pero quiero consultar" |
| CTA Final | "Ver todas" | Catálogo completo | "Vuelvo a explorar" |

**Ningún callejón sin salida.** Cada interacción lleva a algún lugar.

---

## Mobile-First Considerations

### Prioridades en Mobile

1. Filtros accesibles sin scrollear (colapsados o inline)
2. Cards de propiedades legibles y con CTA claro
3. Sección del broker compacta, sin exceso de texto
4. CTAs de WhatsApp siempre visibles y accesibles con el pulgar
5. Cada sección debe sentirse como una "parada" natural, no como un bloque interminable

### Navegación

- Navbar sticky con: logo, link a catálogo, link a contacto, toggle de idioma, login
- En mobile: hamburger menu con las mismas opciones
- No hay navegación a admin desde el sitio público (separación clara)
- El usuario siempre puede volver arriba con un tap en el logo

---

## Accessibility Notes

- Todos los CTAs tienen labels descriptivos (no solo "click aquí")
- Contraste suficiente en texto sobre fondos con imagen
- Filtros navegables por teclado
- Fotos del broker con alt text descriptivo
- Cards de propiedad con estructura semántica (article, heading, etc.)
- Cada "puerta" es un link o botón real, no un div clickeable

---

## SEO Considerations

- H1 único con nombre del broker + propuesta de valor
- Contenido textual relevante para indexación (hero + sección del broker)
- Links internos a listados filtrados (bueno para crawl depth)
- Estructura semántica clara: header, main, section, footer
- No hay contenido bloqueante para renderizado
- Cada sección con heading jerárquico para estructura de documento

---

## Edge Cases

| Escenario | Solución |
|-----------|----------|
| Sin propiedades destacadas aún | Mostrar placeholder con CTA a contacto o mensaje "Próximamente" — sigue siendo una puerta |
| Un solo tipo de propiedad | Ocultar sección de tipos o mostrar solo el disponible |
| Sin proyectos | Ocultar sección 5 completamente |
| WhatsApp no disponible en desktop | Mostrar número copiable + mensaje prellenado — puerta alternativa |
| Filtros sin resultados | Mostrar estado vacío con sugerencia de ampliar criterios — puerta de retorno |
| Usuario que no scrollea | Hero debe ser suficiente para orientar — filtros visibles inmediatamente |

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->
