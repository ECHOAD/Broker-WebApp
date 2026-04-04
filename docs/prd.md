---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments: []
workflowType: 'prd'
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: web_app
  domain: real_estate_broker
  bmadDomain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - Plataforma Web para Broker Inmobiliario

**Author:** Usuario
**Date:** 2026-04-04

## Executive Summary

La solucion sera una plataforma web para la marca personal de un broker inmobiliario, disenada para presentar propiedades con claridad, reducir friccion en el contacto y convertir el interes digital en seguimiento comercial medible. Aunque el catalogo quedara preparado para venta y alquiler, la operacion inicial estara mas enfocada en venta. La primera version combinara una experiencia publica orientada a SEO y captacion con autenticacion opcional para clientes y un panel administrativo para el broker.

La plataforma resolvera dos frentes. Para el cliente interesado, ofrecera una experiencia intuitiva para explorar proyectos y propiedades, entender caracteristicas clave, visualizar ubicacion aproximada, guardar favoritos, revisar intereses previos, editar su perfil y contactar al broker con menos pasos. Para el broker, centralizara la gestion de proyectos, propiedades y leads, incluyendo seguimiento comercial, auditoria de cambios y registro manual de cierres, permitiendo medir leads generados, conversaciones iniciadas por WhatsApp, interes en agendar citas y ventas cerradas.

El catalogo soportara una estructura flexible compuesta por proyectos, propiedades sin proyecto y tipos de inmueble extensibles. En el alcance inicial, la operacion se concentrara en `Lotes`, `Villas` y `Buildings`, con posibilidad de crecimiento hacia `Condos`, `Commercial`, `New Developments` y otras categorias. El sistema tambien contemplara integracion con WhatsApp como canal principal de contacto, login opcional con Google o email, contenido bilingue en espanol e ingles mediante selector manual y persistencia estructurada de interesados para seguimiento posterior.

### What Makes This Special

El producto no busca convertirse en un marketplace masivo ni en una plataforma inmobiliaria multiagente. Su valor esta en ofrecer una experiencia enfocada, ordenada y profesional para un solo broker, alineada con su marca personal y con su necesidad real de formalidad comercial, claridad en la presentacion de propiedades y continuidad en el seguimiento.

La propuesta central es presentar inmuebles con claridad y convertir interes en seguimiento comercial real, sin friccion para el cliente. Esa propuesta se traduce en tres prioridades de producto: claridad para entender propiedades, velocidad para contactar y continuidad comercial despues del primer interes. Si el cliente ya esta registrado, la experiencia debe sentirse inmediata; si no lo esta, el flujo debe seguir siendo simple, con captura de datos, consentimiento explicito de contacto y redireccion a WhatsApp.

La plataforma tambien equilibrara exposicion comercial y proteccion del inventario. Mostrara ubicacion aproximada de forma publica, y reservara mayor precision despues del contacto. Ademas, quedara preparada para evolucionar sin rehacer la base del producto: mas tipos de propiedades, propiedades fuera de proyectos, distintos numeros de WhatsApp por proyecto o inmueble y una operacion comercial mas rica en el futuro.

## Project Classification

- `Project Type:` Web App
- `Domain:` Broker inmobiliario / real estate
- `BMAD Domain:` General
- `Complexity:` Medium
- `Project Context:` Greenfield

La clasificacion `medium` responde a una combinacion de catalogo publico con SEO fuerte, autenticacion opcional, roles diferenciados, panel administrativo, gestion de leads con auditoria, integracion con WhatsApp, soporte bilingue y seguimiento comercial desde el interes hasta el cierre manual.

## Success Criteria

### User Success

Los usuarios deben poder encontrar una propiedad relevante en pocos minutos, entender con claridad sus caracteristicas principales y contactar al broker sin friccion innecesaria. Un usuario autenticado debe percibir una experiencia mas rapida que un visitante no autenticado, evitando formularios repetitivos y pudiendo guardar favoritos, registrar intereses y expresar interes en agendar una cita.

El producto se considerara exitoso para el usuario cuando:
- pueda explorar proyectos y propiedades de forma intuitiva
- encuentre informacion suficiente para tomar una decision inicial
- entienda ubicacion aproximada sin exponer demasiado inventario
- inicie contacto con el broker de forma rapida desde el detalle de una propiedad
- tenga una experiencia movil clara, rapida y confiable

Un fallo claro de experiencia sera:
- catalogo confuso
- formularios largos o repetitivos
- informacion incompleta en propiedades
- dificultad para contactar al broker
- lentitud perceptible en movil o desktop

### Business Success

Para el broker, el exito significa que la plataforma deje de ser solo presencia digital y se convierta en un canal comercial activo y medible. En el corto plazo, el valor principal sera generar interaccion real con la pagina: visitas utiles, registros, contactos y conversaciones iniciadas. En el mediano plazo, el sistema debe sostener operacion, seguimiento y escalabilidad sin rehacer la base del producto.

Los indicadores clave de negocio seran:
- leads generados
- conversaciones iniciadas por WhatsApp
- intereses en agendar cita
- ventas cerradas manualmente en el panel
- trazabilidad del funnel comercial desde interes hasta cierre

La metrica mas importante sera `ventas cerradas`, pero en la fase inicial se observaran como senales tempranas `registros`, `contactos` y `conversaciones por WhatsApp`.

### Technical Success

La solucion tecnica sera exitosa si entrega una experiencia publica rapida, estable y priorizada para movil, y si el panel administrativo permite operar sin friccion al broker.

Criterios tecnicos base:
- landing y listados cargan en menos de `3 segundos`
- detalle de propiedad carga en menos de `2.5 segundos`
- experiencia movil prioritaria desde el MVP
- confiabilidad operativa basica, sin caidas frecuentes en uso normal
- persistencia consistente de leads, intereses, estados y cierres
- auditoria de cambios en el seguimiento comercial
- base preparada para escalar catalogo, tipos de propiedad y reglas de contacto sin rediseno total

### Measurable Outcomes

Objetivos iniciales para los primeros `3 meses` de operacion, sujetos a calibracion con trafico real:
- al menos `20-30 leads por mes`
- al menos `15-25 conversaciones por WhatsApp por mes`
- al menos `5-10 intereses de cita por mes`
- al menos `1-3 cierres por mes` atribuibles o registrados desde el canal digital
- al menos `70%` de los leads con estado actualizado dentro del panel
- al menos `80%` de las propiedades publicadas con informacion completa y contacto funcional

Objetivos a `12 meses`:
- operacion estable y funcional sin necesidad de rediseno estructural
- crecimiento sostenido del catalogo y de la base de leads
- trazabilidad clara del funnel comercial
- capacidad de seguir escalando en propiedades, tipos de inmueble y volumen operativo

## Product Scope

### MVP - Minimum Viable Product

El MVP incluira:
- sitio publico con landing page
- onboarding explicativo para visitantes y recorrido guiado dentro del sitio
- catalogo publico con proyectos y propiedades sin proyecto
- detalle de propiedad con caracteristicas, ubicacion aproximada y contacto al broker
- paginas publicas con SEO fuerte para proyectos y propiedades
- soporte bilingue `espanol / ingles` con selector manual
- contacto mediante formulario con consentimiento explicito
- guardado del lead y redireccion a WhatsApp
- login opcional con `Google` o `email`
- experiencia autenticada para clientes con favoritos, historial de intereses, perfil y expresion de interes en agendar cita
- panel admin para el broker
- CRUD de proyectos e inmuebles
- soporte inicial para `Lotes`, `Villas` y `Buildings`
- soporte de venta y alquiler, aunque con foco inicial en venta
- gestion de leads con estados
- auditoria de cambios
- registro manual de cierres y asociacion de venta a un lead

### Growth Features (Post-MVP)

Post-MVP:
- flujo mas estructurado para citas y reservas
- analytics mas profundos del funnel comercial
- mas tipos de inmueble
- multiples numeros de WhatsApp por proyecto o propiedad
- automatizaciones de seguimiento comercial
- mayor sofisticacion del panel y reportes operativos

### Vision (Future)

A futuro:
- CRM comercial mas robusto
- operacion mas avanzada de seguimiento y conversion
- expansion del modelo de catalogo y reglas comerciales
- mayor capacidad de escalamiento sin perder simplicidad para el cliente final

## User Journeys

### Journey 1: Cliente inversor o comprador encuentra una propiedad y contacta rapido

Conocemos a un usuario que quiere invertir o comprar. Esta comparando varias opciones, no quiere perder tiempo y necesita entender rapido si una propiedad vale la pena. Llega a la landing del broker, percibe una presencia profesional y clara, y puede ver una explicacion breve de como usar la plataforma, aunque tiene la opcion de omitirla para ir directo a explorar.

Al entrar al flujo principal, encuentra filtros rapidos que le permiten orientar la busqueda por presupuesto y otros criterios relevantes. En pocos pasos navega proyectos o propiedades individuales, compara opciones y abre el detalle de una propiedad que le interesa. Alli encuentra caracteristicas relevantes, contexto suficiente para evaluar el inmueble y una ubicacion aproximada que le da confianza sin exponer demasiado inventario.

El momento de mayor valor ocurre cuando decide contactar al broker sin friccion. Completa el formulario, entrega consentimiento explicito para ser contactado, el sistema guarda su lead con la propiedad de interes y luego lo redirige a WhatsApp con el contexto del inmueble. Pasa de curiosidad a claridad, luego a confianza y finalmente a accion.

Si algo sale mal en este journey, el MVP debe recuperarse asi:
- si WhatsApp no abre, mostrar numero y mensaje prellenado para copiar manualmente
- si faltan datos en el formulario, resaltar campos faltantes sin perder lo ya escrito
- si la propiedad ya no esta disponible, sugerir propiedades similares o invitar a contactar igual
- si falta informacion suficiente en el detalle, mantener una via clara para consultar al broker

### Journey 2: Usuario autenticado vuelve, retoma favoritos y expresa interes en un clic

Conocemos al mismo tipo de cliente, pero esta vez ya regreso despues de explorar antes. Tiene cuenta o decide iniciar sesion con Google o email porque entiende que asi ahorrara pasos futuros. Entra autenticado y encuentra sus favoritos, su historial de intereses y su perfil ya listo.

Vuelve a revisar varias propiedades que habia marcado, compara opciones con mas contexto y decide expresar interes en una de ellas. El punto de mayor valor aqui es que no necesita volver a completar formularios: desde el detalle puede marcar interes, guardar el evento en el sistema y abrir WhatsApp directamente con mucha menos friccion.

La resolucion del journey no es solo el contacto. Tambien queda una continuidad real: sus intereses persisten, puede volver luego, revisar lo que ya vio y expresar interes en agendar una cita, sabiendo que el broker podra dar seguimiento con contexto.

Si algo sale mal:
- si el login falla, ofrecer recuperacion simple o continuar como visitante
- si una propiedad guardada cambio de estado, indicarlo claramente y ofrecer alternativas
- si el usuario quiere contactar varias propiedades, permitir registrar multiples intereses sin perder historial

### Journey 3: Visitante decide registrarse para ahorrar pasos futuros

Conocemos a un visitante que todavia no quiere comprometerse con una propiedad, pero si percibe que va a seguir explorando varias opciones. Despues de navegar el catalogo y entender el valor de la plataforma, decide registrarse para guardar favoritos, evitar formularios repetidos y retomar su busqueda mas adelante.

El sistema le ofrece una razon clara para registrarse: comodidad. Puede hacerlo con Google o email, sin complejidad innecesaria. Una vez autenticado, el sitio conserva su contexto y le muestra una experiencia mas eficiente, alineada con alguien que esta comparando propiedades durante varios dias o semanas.

El valor del journey esta en transformar un visitante anonimo en un usuario reconocible sin imponer barreras tempranas. El registro no bloquea la exploracion, pero si mejora notablemente la continuidad de uso y la calidad del seguimiento comercial.

Si algo sale mal:
- si abandona el registro, debe poder seguir navegando como visitante
- si ya habia mostrado interes antes de registrarse, el sistema debe intentar asociar su actividad posterior cuando sea posible
- si el usuario no entiende para que registrarse, la propuesta de valor debe explicarlo con claridad

### Journey 4: Broker admin publica inventario y opera el seguimiento comercial

Conocemos al broker, que necesita una herramienta ordenada para presentar su inventario y dar seguimiento real a cada oportunidad. Inicia sesion en el panel administrativo y encuentra una vista clara de sus proyectos, propiedades, leads y estados comerciales.

Su flujo principal comienza al crear o editar un proyecto, o cargar una propiedad con o sin proyecto. Completa la informacion necesaria, define el tipo de inmueble, publica el inventario y lo deja visible en el catalogo publico. Mas tarde empiezan a llegar leads e intereses desde formularios o desde usuarios autenticados. El broker puede ver quien mostro interes, en que propiedad, en que idioma, con que presupuesto y en que etapa del funnel se encuentra.

El momento de mayor valor ocurre cuando deja de depender de WhatsApp suelto, memoria o chats dispersos. Puede actualizar estados, registrar observaciones, dar seguimiento, identificar intencion de cita y finalmente registrar manualmente un cierre. Pasa de orden basico a visibilidad, luego a control y finalmente a seguimiento comercial trazable.

Si algo sale mal:
- si cargo mal una propiedad, debe poder editarla sin romper su publicacion
- si una propiedad no pertenece a un proyecto, igual debe poder publicarla
- si recibe leads duplicados, debe poder detectarlos y seguir trabajando sin perder historial
- si registro mal un cierre, debe quedar rastro en auditoria y posibilidad de corregir

### Journey 5: Broker registra una oportunidad fuera del canal digital y la asocia a una venta

En un caso alternativo, el broker conoce a un cliente por fuera de la web: una llamada, recomendacion o contacto presencial. Aun asi necesita que la plataforma refleje ese proceso comercial. Entra al panel, crea manualmente el lead, lo asocia a una propiedad y comienza el seguimiento desde el mismo sistema.

Con el tiempo, ese lead avanza a negociacion y termina en cierre. El broker registra manualmente la venta y deja constancia de a quien fue, que propiedad estuvo involucrada y como evoluciono la oportunidad. Asi, la plataforma no solo mide lo que entra por formulario, sino tambien parte de la operacion comercial real.

Este journey revela que el panel no debe depender exclusivamente del canal digital para ser util. Debe funcionar tambien como sistema operativo basico del broker.

### Journey Requirements Summary

Estos journeys revelan capacidades obligatorias para el producto:
- landing clara con opcion de onboarding y opcion de omitirlo
- filtros rapidos de busqueda, incluyendo presupuesto
- catalogo navegable por proyectos y propiedades sin proyecto
- detalle de propiedad con caracteristicas, ubicacion aproximada y contacto visible
- formulario de contacto con consentimiento explicito
- guardado de lead antes de redirigir a WhatsApp
- autenticacion opcional con Google o email
- favoritos, historial de intereses y perfil de usuario
- multiples intereses por usuario
- expresion de interes en agendar cita, sujeta a aceptacion del broker
- panel admin para CRUD de proyectos y propiedades
- soporte para propiedades con y sin proyecto
- gestion de leads con estados y notas de seguimiento
- auditoria para cambios relevantes
- registro manual de leads y cierres
- recuperacion ante errores de contacto, login, disponibilidad o datos incompletos

## Domain-Specific Requirements

### Compliance & Regulatory

Aunque el producto no opera en un dominio altamente regulado, si debe manejar obligaciones basicas de privacidad y tratamiento responsable de datos comerciales. Todo formulario de contacto y registro debe incluir aviso de privacidad y aceptacion explicita de tratamiento de datos. El sistema debe guardar evidencia de consentimiento para contacto por WhatsApp y email, incluyendo fecha, hora y fuente del consentimiento.

La plataforma no requerira restricciones regulatorias geograficas especificas en esta primera version, pero debe quedar preparada para incorporar politicas legales adicionales si el mercado operativo del broker lo exige mas adelante.

### Technical Constraints

El sistema debe proteger datos personales de clientes e interesados, especialmente la trazabilidad de consentimiento, el historial comercial y la informacion sensible asociada a cierres. Los datos de identidad fuerte como cedula o documento de identidad no seran parte del flujo temprano de captacion; se capturaran solo en etapas avanzadas del funnel, desde negociacion o cierre.

Debe existir auditoria sobre cambios en propiedades, leads y cierres. Esto permitira trazabilidad, correccion operativa y proteccion ante errores de registro o atribucion. La plataforma tambien debe soportar propiedades con precio visible o con modalidad `consultar precio`, ademas de contemplar una moneda base por propiedad y conversion visual a otras monedas desde el MVP.

Cada propiedad debe manejar un estado comercial controlado. Estados iniciales aprobados:
- `disponible`
- `reservada`
- `vendida`
- `alquilada`
- `oculta`

### Integration Requirements

La unica integracion externa obligatoria para el MVP sera WhatsApp, utilizado como canal principal de contacto comercial despues de guardar el lead o interes. El sistema debe registrar el evento de contacto antes de redirigir al usuario a WhatsApp, para no perder trazabilidad comercial.

No se definen otras integraciones obligatorias para esta primera version.

### Risk Mitigations

Los riesgos de negocio prioritarios son:
- perder leads
- datos mal cargados
- propiedades desactualizadas
- cierres mal atribuidos
- mal uso de datos de clientes

Mitigaciones esperadas en el producto:
- persistencia obligatoria del lead antes de cualquier redireccion a WhatsApp
- validacion de formularios y campos criticos en panel admin
- auditoria en propiedades, leads y cierres
- control de estados comerciales por propiedad
- historial de seguimiento por lead
- captura explicita de consentimiento y evidencia asociada
- posibilidad de correccion operativa sin perder trazabilidad

## Web App Specific Requirements

### Project-Type Overview

El producto se implementara como una plataforma web con arquitectura hibrida `MPA/SSR` para la superficie publica y una experiencia autenticada separada para el panel administrativo. Esta decision responde a dos necesidades distintas: maximizar indexacion y rendimiento percibido en paginas publicas, y mantener una experiencia operativa clara para usuarios autenticados y broker admin.

La superficie publica estara optimizada para descubrimiento, navegacion y captacion. La superficie autenticada estara enfocada en continuidad de usuario y operacion comercial. No se requiere comportamiento real-time en el MVP; los estados podran reflejarse mediante recarga o navegacion normal.

### Technical Architecture Considerations

La arquitectura debe priorizar:
- renderizado indexable para landing, listados, proyectos y propiedades
- separacion clara entre experiencia publica y panel admin
- soporte responsive completo para movil y desktop
- experiencia rapida en navegacion publica
- persistencia confiable de autenticacion, intereses, favoritos, leads y estados comerciales

Navegadores y plataformas minimas:
- Chrome actual
- Safari actual
- Edge actual
- Firefox actual
- iOS movil
- Android movil
- desktop responsive

### Browser Matrix

La plataforma debera funcionar correctamente en navegadores modernos actuales y mantener consistencia de experiencia en movil y desktop. La prioridad sera asegurar una experiencia solida en navegacion publica, formularios, autenticacion, panel admin y redireccion a WhatsApp.

### Responsive Design

La experiencia movil sera prioritaria desde el MVP. Landing, filtros, catalogo, detalles de propiedad, formularios y flujos de contacto deben disenarse primero para pantallas moviles sin degradar la experiencia en desktop.

Los filtros rapidos deberan estar disponibles tanto en la landing como en la pagina de catalogo. El diseno responsive debera contemplar:
- filtros compactos y usables en movil
- galeria visual clara en detalle de propiedad
- CTAs visibles y persistentes para contacto
- lectura rapida de informacion clave
- navegacion clara entre proyectos, propiedades y perfil

### Performance Targets

Los objetivos tecnicos ya definidos se mantienen como requisitos del tipo de proyecto:
- landing y listados en menos de `3s`
- detalle de propiedad en menos de `2.5s`
- carga estable en redes moviles razonables
- sin dependencia de tiempo real para funcionamiento principal

La estrategia tecnica debe evitar exceso de peso en imagenes, scripts innecesarios y renderizado bloqueante en paginas SEO criticas.

### SEO Strategy

SEO fuerte aplicara a:
- landing page
- listados
- paginas de proyecto
- paginas de propiedad

El panel administrativo no requiere indexacion. Las paginas publicas deberan contar con URLs amigables y estables para proyectos y propiedades, estructura apta para indexacion, contenido visible renderizado para buscadores y metadatos apropiados para compartir y posicionamiento.

La estrategia SEO debe considerar:
- slugs amigables por proyecto y propiedad
- paginas publicas indexables
- estructura semantica clara
- contenido relevante para cada propiedad/proyecto
- separacion entre contenido publico indexable y areas privadas no indexables

### Accessibility Level

El MVP debe alcanzar un buen nivel practico de accesibilidad, incluyendo:
- navegacion usable por teclado
- contraste suficiente
- formularios claros y etiquetados
- estructura semantica adecuada
- jerarquia visual comprensible
- mensajes de error entendibles

No se promete certificacion formal en esta primera version, pero si una base solida de accesibilidad real.

### Implementation Considerations

El onboarding guiado debera existir en dos modos:
- visible en el flujo inicial para primera visita
- siempre disponible de forma opcional desde una ayuda o CTA reutilizable

La experiencia publica debera combinar filtros estructurados y busqueda libre por texto. El detalle de propiedad debera incluir galeria completa desde el MVP, dado que el contenido visual es parte central del valor inmobiliario.

Requisitos funcionales derivados del tipo de proyecto:
- paginas publicas SSR/indexables
- autenticacion opcional con persistencia de sesion
- panel admin separado del sitio publico
- busqueda por texto y filtros
- galeria completa de propiedades
- URLs amigables obligatorias
- sin dependencia de websockets o tiempo real en MVP
- recarga suficiente para reflejar estados actualizados

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** `problem-solving MVP`

El MVP debe resolver una necesidad real e inmediata del broker con un flujo util, operable y medible. No busca construir la version definitiva del producto ni maximizar sofisticacion desde el primer release. La prioridad es validar que el canal digital puede presentar propiedades con claridad, capturar interes, generar conversaciones por WhatsApp y sostener seguimiento comercial real.

**Resource Requirements:**
Como minimo, este alcance exige capacidad de producto, diseno UX/UI, desarrollo full-stack y despliegue operativo. Si el equipo es pequeno, la recomendacion es mantener una primera entrega enfocada y evitar expansion prematura del alcance.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- visitante explora catalogo y contacta al broker desde una propiedad
- cliente autenticado reduce friccion al expresar interes
- broker publica inventario y gestiona leads
- broker registra seguimiento y cierre manual
- usuario puede navegar proyectos y propiedades sin proyecto

**Must-Have Capabilities:**
- catalogo claro de propiedades y proyectos
- paginas publicas SEO-friendly para landing, listados, proyectos y propiedades
- filtros rapidos para orientar busqueda
- detalle de propiedad con informacion relevante, galeria y ubicacion aproximada
- contacto desde propiedad con formulario, consentimiento, guardado de lead y redireccion a WhatsApp
- panel broker con CRUD de proyectos y propiedades
- gestion de leads con estados, notas y seguimiento comercial
- registro manual de cierres
- autenticacion base para broker y usuario final
- soporte para propiedades con y sin proyecto
- soporte inicial para `Lotes`, `Villas` y `Buildings`
- venta y alquiler habilitados desde la base
- auditoria sobre propiedades, leads y cierres

**Recortables si hubiera presion de tiempo o presupuesto:**
- multi-moneda visual
- favoritos e historial de intereses mas completos
- login social si login por email resuelve
- onboarding guiado avanzado
- busqueda libre por texto

### Post-MVP Features

**Phase 2 (Post-MVP):**
- onboarding guiado mas completo
- favoritos e historial mas ricos
- busqueda libre mejorada
- login con Google si no entra en primera entrega
- multi-moneda visual si se posterga del MVP
- flujo mas estructurado para interes de cita
- analytics mas profundos del funnel

**Phase 3 (Expansion):**
- CRM comercial mas robusto
- automatizaciones de seguimiento
- multiples numeros de WhatsApp por proyecto o propiedad
- mas tipos de inmueble
- capacidades operativas y comerciales mas avanzadas
- expansion del modelo de catalogo y reporting

### Risk Mitigation Strategy

**Technical Risks:**
El mayor riesgo tecnico es combinar SEO fuerte, catalogo rico, autenticacion, panel admin, tracking comercial y flujo con WhatsApp dentro de una sola primera entrega. La mitigacion es usar arquitectura hibrida publica/indexable con panel separado, priorizar rutas y flujos core, y dejar explicitamente recortables varios elementos no esenciales.

**Market Risks:**
El mayor riesgo de mercado es que exista trafico pero no se convierta en conversaciones ni ventas reales. La mitigacion es centrar el MVP en catalogo claro, contacto rapido, guardado de lead, trazabilidad del funnel y medicion temprana de conversaciones, citas e ingresos cerrados.

**Resource Risks:**
Si hay menos tiempo o presupuesto del esperado, el plan de contingencia es recortar primero funcionalidades no criticas para la validacion comercial. El orden de recorte acordado es:
- multi-moneda visual
- favoritos e historial mas completos
- login social si email login ya resuelve

## Functional Requirements

### Public Discovery & Navigation

- `FR1:` Public visitors can access a public landing page for the broker brand.
- `FR2:` Public visitors can view an optional onboarding explanation of how to use the platform.
- `FR3:` Public visitors can skip the onboarding explanation and continue directly to exploration.
- `FR4:` Public visitors can access a searchable public catalog of projects and properties.
- `FR5:` Public visitors can filter the catalog using structured criteria, including budget.
- `FR6:` Public visitors can search the catalog using free-text queries.
- `FR7:` Public visitors can browse properties grouped under projects.
- `FR8:` Public visitors can browse properties that are not assigned to a project.
- `FR9:` Public visitors can access a dedicated public page for each project.
- `FR10:` Public visitors can access a dedicated public page for each property.

### Property Information & Evaluation

- `FR11:` Public visitors can view key commercial and descriptive information for a property.
- `FR12:` Public visitors can view the property type for each listing.
- `FR13:` Public visitors can view whether a property is offered for sale, rent, or both where applicable.
- `FR14:` Public visitors can view a gallery of images for each property.
- `FR15:` Public visitors can view an approximate location for each property.
- `FR16:` Public visitors can view the commercial availability status of a property when that status is meant to be public.
- `FR17:` Public visitors can view a property price when the broker chooses to publish it.
- `FR18:` Public visitors can view a property as price-on-request when the broker chooses not to publish the exact price.
- `FR19:` Public visitors can view pricing in the property's base currency and see visually converted values in other supported currencies.

### Contact & Lead Capture

- `FR20:` Public visitors can initiate contact with the broker from a property detail page.
- `FR21:` Public visitors can submit a contact form for a property without creating an account.
- `FR22:` Public visitors can provide consent for data processing and commercial contact during registration and lead submission.
- `FR23:` The system can record evidence of consent, including source and timestamp.
- `FR24:` The system can create a lead record before redirecting a user to WhatsApp.
- `FR25:` The system can associate a lead with one or more properties of interest.
- `FR26:` The system can redirect a user to WhatsApp after contact intent is captured.
- `FR27:` Users can express interest in scheduling a meeting or appointment with the broker.
- `FR28:` The system can preserve contact recovery paths when direct WhatsApp redirection is not completed.

### User Accounts & Returning User Experience

- `FR29:` Visitors can register as client users using email.
- `FR30:` Visitors can register as client users using Google.
- `FR31:` Registered client users can sign in and remain authenticated across sessions.
- `FR32:` Registered client users can manage their profile information.
- `FR33:` Registered client users can save properties to favorites.
- `FR34:` Registered client users can review their previously saved favorites.
- `FR35:` Registered client users can review their history of expressed interests.
- `FR36:` Registered client users can express interest in a property without re-entering previously known contact information.
- `FR37:` Registered client users can express interest in multiple properties over time.
- `FR38:` The system can treat a registered user and that user's commercial lead identity as the same customer record when applicable.

### Broker Inventory Management

- `FR39:` Broker admins can sign in to an administrative panel.
- `FR40:` Broker admins can create, edit, publish, hide, and manage projects.
- `FR41:` Broker admins can create, edit, publish, hide, and manage properties.
- `FR42:` Broker admins can assign a property to a project.
- `FR43:` Broker admins can manage properties that do not belong to any project.
- `FR44:` Broker admins can classify properties using an extensible set of property types.
- `FR45:` Broker admins can manage the initial supported property types of `Lotes`, `Villas`, and `Buildings`.
- `FR46:` Broker admins can define whether a property is for sale, rent, or both where applicable.
- `FR47:` Broker admins can define whether a property displays an exact price or a price-on-request mode.
- `FR48:` Broker admins can define a base currency for each property.
- `FR49:` Broker admins can manage a property's commercial status, including available, reserved, sold, rented, and hidden.
- `FR50:` Broker admins can manage media and descriptive content for each property.
- `FR51:` Broker admins can expose only approximate location information in public property views.

### Lead Management & Sales Tracking

- `FR52:` Broker admins can view all leads generated through the platform.
- `FR53:` Broker admins can view the source context of each lead, including related property, language, and captured commercial details.
- `FR54:` Broker admins can track leads through defined commercial stages.
- `FR55:` Broker admins can add notes and follow-up information to a lead.
- `FR56:` Broker admins can view users or leads who expressed interest in scheduling a meeting.
- `FR57:` Broker admins can manually create leads that originated outside the digital channel.
- `FR58:` Broker admins can associate an offline lead with a property and continue tracking it in the same funnel.
- `FR59:` Broker admins can register a commercial closure or sale manually.
- `FR60:` Broker admins can associate a closure with a lead and a property.
- `FR61:` Broker admins can correct operational records while preserving commercial traceability.
- `FR62:` Broker admins can distinguish between lead activity, follow-up progression, and final closure status.

### Governance, Localization & Audit

- `FR63:` Users can view public content in Spanish or English through manual language selection.
- `FR64:` The system can store the language context associated with lead or user interactions where relevant.
- `FR65:` The system can maintain an audit trail for relevant changes to properties, leads, and closures.
- `FR66:` The system can restrict sensitive identity data collection to advanced commercial stages such as negotiation or closure.
- `FR67:` The system can support the broker's single-brand operating model without requiring multi-agent or multi-broker workflows in the MVP.

## Non-Functional Requirements

### Performance

- El sistema debe cargar la landing y los listados publicos en menos de `3 segundos` bajo carga normal del MVP.
- El sistema debe cargar el detalle de propiedad en menos de `2.5 segundos` bajo carga normal del MVP.
- El sistema debe soportar trafico publico bajo a medio y decenas de usuarios concurrentes sin degradacion perceptible en los flujos principales.
- El panel administrativo debe mantener operacion estable para un broker y un grupo interno muy reducido.
- La experiencia movil no debe degradarse de forma significativa por carga de imagenes, catalogo o formularios.

### Security

- El sistema debe proteger el trafico entre cliente y servidor mediante cifrado en transito.
- El sistema debe aplicar control de acceso por rol para separar capacidades de broker admin y cliente autenticado.
- El sistema debe manejar sesiones autenticadas de forma segura.
- El sistema debe proteger datos personales, datos de consentimiento y datos comerciales sensibles.
- El sistema debe auditar operaciones sensibles sobre propiedades, leads y cierres.
- El sistema debe restringir la captura de cedula o documento de identidad a etapas avanzadas del funnel comercial.

### Scalability

- El sistema debe soportar crecimiento aproximado de `10x` en catalogo y volumen de leads sin requerir rediseno completo.
- El sistema debe permitir expansion de tipos de inmueble, propiedades, contenido y seguimiento comercial sin romper las capacidades existentes.
- El sistema debe mantener la separacion entre superficie publica indexable y panel administrativo a medida que crece el producto.

### Accessibility

- El sistema debe permitir navegacion usable por teclado en las superficies publicas y formularios clave.
- El sistema debe mantener contraste suficiente para lectura y accion.
- El sistema debe presentar formularios con etiquetas claras y mensajes de error comprensibles.
- El sistema debe usar estructura semantica adecuada en contenido publico y flujos criticos.
- El sistema debe mantener una accesibilidad practica real, aunque sin compromiso de certificacion formal en el MVP.

### Reliability

- El sistema debe aspirar a una disponibilidad mensual objetivo de `99%` en el MVP.
- El sistema debe capturar y persistir leads aunque WhatsApp falle o no pueda abrirse.
- El sistema debe ofrecer una alternativa visible de contacto cuando falle la redireccion a WhatsApp.
- El sistema debe permitir correccion de datos operativos sin perder historial.
- El sistema debe contar con respaldos operativos regulares para reducir riesgo de perdida de datos.

### Integration

- El sistema debe tratar la integracion con WhatsApp como critica para el flujo comercial, pero no para la persistencia del lead.
- El sistema debe registrar el lead o interes antes de depender de cualquier redireccion externa.
- El sistema debe tratar las conversiones visuales de moneda como referencia informativa y no como calculo financiero contractual.
- El sistema debe mantener el contenido publico indexable para buscadores y excluir de indexacion las areas privadas no publicas.
