# Diagnóstico UX/UI — Landing de Althara

> Análisis previo a cualquier cambio. No se ha modificado código de la landing.
> Objetivo: validar criterio visual, jerarquía y dirección de UX antes de tocar nada.
> Fecha: 14/07/2026 · Repo: `althara` (landing althara.es)

**Orden actual de secciones:** `Nav → Hero → Marquee (palabras) → Thesis (La tesis) → Layers (Qué hacemos) → Method (Método) → Segments (Dónde operamos) → Portal (data room) → FinalCta → Footer`

---

## Diagnóstico general

Lo que **funciona**:

- El sistema editorial "Swiss brut" es coherente y premium: Montserrat + Playfair, mucho aire, tipografía enorme, punto en bronce como firma. Es una identidad clara y adecuada para inversión off-market.
- El relato tiene lógica: tesis → qué hacemos → método → a quién → portal → contacto.
- La paleta base (teal `#1c3742` / crema `#e6e2d7` / bronce `#c08552`) es sobria y distintiva.
- Los CTAs son consistentes ("Solicitar acceso" + "Portal de inversores") y se repiten en los momentos correctos.

Lo que **no funciona** (resumen; se detalla abajo):

1. **Demasiado peso antes del primer scroll.** El Hero mete wordmark gigante + subtítulo + tagline + párrafo + 2 botones + 3 stats en una sola pantalla. Compite consigo mismo y tarda en "leerse".
2. **Movimiento acumulado al inicio.** Hero con parallax + máscaras + vídeo, e inmediatamente debajo el **Marquee** con dos filas moviéndose en direcciones opuestas. Son dos animaciones fuertes seguidas: fatiga visual y competencia con el mensaje principal.
3. **Redundancia estructural: `Qué hacemos` (Layers) y `Método` (Method) cuentan casi lo mismo.** Layers = Señales/Análisis/Acceso/Cierre (4 pasos). Method = Originación/Verificación/Valoración/Matching/Ejecución (5 pasos). El usuario ve "el proceso" dos veces seguidas.
4. **"Dónde operamos" no genera impacto y además está mal nombrada.** Son 6 tarjetas en fila (hasta 6 columnas en desktop) → quedan pequeñas y bajas. Y el título dice "Dónde operamos" (geografía) pero el contenido son **perfiles de inversor** (Family offices, Hospitality…). Hay un desajuste título/contenido.
5. **El "amarillo".** No existe ningún token amarillo en el código. Lo que se percibe como amarillo es (a) el **bronce `#c08552` al 15 % de opacidad** sobre fondo claro, que vira a mostaza pálido, y/o (b) el **autofill de Chrome** en los inputs transparentes. Además hay **verde `emerald` fuera de paleta** en los badges del data room.
6. **Colores sin centralizar.** Todo son hex a pelo repartidos por el JSX (`#1c3742` aparece 291 veces, `#e6e2d7` 348, `#c08552` 45). No se usan tokens. Y conviven **dos sistemas de color** (Tailwind v4 `@theme` en `globals.css` vs. el `tailwind.config.ts` con variables `hsl(var(--…))` que nunca se declaran).

---

## Hero

### Problemas detectados

- **Sobrecarga de contenido en la primera pantalla.** Coexisten: wordmark `ALTHARA` gigante, subtítulo "Inversión inmobiliaria off-market", tagline "El mejor inmueble no está en los portales.", párrafo descriptivo, 2 botones y 3 stats. Son 6 bloques de texto compitiendo por la atención.
- **La tagline "El mejor inmueble no está en los portales." resta velocidad.** Es una frase de *tesis*, no de *hero*. Requiere procesar una negación ("no está en…") para entender la propuesta. En el hero se quiere afirmación directa, no argumento.
- **Jerarquía difusa.** El wordmark gigante domina, pero justo debajo hay dos frases (`wordmarkSub` a la derecha + `tagline` a la izquierda) del mismo peso semántico → el ojo no sabe cuál es la promesa.
- **Redundancia de mensaje.** "off-market" aparece en el subtítulo, y la tagline y el párrafo repiten la misma idea (lo bueno no está en los portales / acceso privado). Tres formas de decir lo mismo.
- **Duplicidad conceptual con "La tesis".** La tagline del hero ("El mejor inmueble no está en los portales") es prácticamente la tesis de la sección siguiente ("Lo bueno no se anuncia, se comparte en privado") y el mantra del footer ("El mercado visible es la punta del iceberg"). Se está gastando la misma bala tres veces.
- **CTA:** los dos botones sí se entienden ("Solicitar acceso" primario, "Portal de inversores" secundario). Correcto. El único matiz es que quedan en la mitad inferior, después de mucho texto.

### Recomendación

- **Eliminar la tagline "El mejor inmueble no está en los portales." del hero** y reservar esa idea para "La tesis", donde ya vive y donde tiene el espacio para desarrollarse. En el hero es ruido; en la tesis es el argumento central.
- **Elevar el subtítulo a promesa principal.** "Inversión inmobiliaria off-market en Baleares" es más rápido de entender que la tagline: dice *qué es* (inversión inmobiliaria), *cómo* (off-market) y *dónde* (Baleares) en una línea, sin negaciones.
- **Reducir el hero a 4 bloques**: wordmark → una sola línea de propuesta de valor → CTAs → stats. Quitar el párrafo `sub` de aquí o dejarlo mucho más corto (una línea).
- No hace falta reescribir copys definitivos todavía; con reordenar y eliminar ya se gana claridad. La única sustitución necesaria es "promover" `wordmarkSub` a línea principal y quitar `tagline`.

### Nueva jerarquía propuesta (hero)

```
1. ALTHARA (wordmark) — identidad, tamaño máximo
2. Propuesta de valor en UNA línea (ex-"wordmarkSub", ligeramente ampliada:
   "Inversión inmobiliaria off-market en Baleares") — segundo nivel
3. CTAs: [Solicitar acceso]  [Portal de inversores]
4. 3 stats (+20M€ · 108 activos · 35% ROI) — prueba, tercer nivel
   (opcional: bajar los stats justo por encima del pliegue, no obligatorios en primera pantalla)
```

### Qué haría con cada elemento

- **Eliminar:** tagline "El mejor inmueble no está en los portales." (se recupera en La tesis).
- **Mover / degradar:** el párrafo descriptivo `sub` ("Acceso privado a oportunidades…") → o se acorta a una línea, o se mueve a la tesis / bajo los stats.
- **Mantener:** wordmark, CTAs, stats, vídeo de fondo con doble velo.
- **Promover:** `wordmarkSub` ("off-market") de subtítulo a propuesta de valor principal.

Resultado: el hero pasa de 6 bloques a 4, se lee en 2–3 segundos y comunica qué es Althara sin obligar a scrollear.

---

## Dónde operamos (Segments)

### Evaluación del diseño actual

- Son 6 tarjetas `aspect-[3/4]` en una tira que llega a **6 columnas en desktop** (`lg:grid-cols-6`). A ese ancho (~17 vw cada una), aunque la proporción sea vertical, la **altura absoluta es pequeña** → sensación de tira baja, poco impacto. La intuición de "cards demasiado bajas" es correcta.
- El contenido por tarjeta es mínimo: una imagen en B/N que recupera color al hover + el nombre del perfil + un CTA que solo aparece al hover. **No hay descripción**, así que no hay jerarquía "ubicación → descripción → contenido" que ordenar: hoy solo hay nombre.
- **Desajuste título/contenido:** el título es "Dónde operamos" (sugiere geografía) pero los ítems son **perfiles de inversor** (Grupos de hospitality, Family offices, Redes de agencias…). O se renombra la sección ("Con quién trabajamos" / "Perfiles"), o se cambia el contenido a geografía real (Mallorca, Ibiza, Menorca…). Recomiendo alinear título y contenido antes que retocar la estética.

### Comparativa: grid estático vs. carrusel autoplay

**Opción A — Grid estático con tarjetas más altas**

- A favor: legible, estable, sin movimiento adicional (la página ya tiene mucho), 100 % accesible, trivial en móvil, cero riesgo de "carrusel agresivo". El CTA de cada tarjeta siempre visible.
- En contra: menos "wow"; con 6 ítems ocupa bastante alto vertical si se agrandan.
- Ajuste recomendado: bajar a **3 columnas en desktop** (2 filas de 3) con proporción más vertical (`4/5` o `3/4`) y tarjetas notablemente más altas → cada imagen gana protagonismo editorial. Mostrar el nombre siempre y el CTA siempre (no solo al hover) para que se entienda que son clicables.

**Opción B — Carrusel horizontal con autoplay continuo**

- A favor: aire premium, deja "asomar" la siguiente tarjeta (invita a arrastrar), permite tarjetas más grandes sin ocupar tanto alto.
- En contra: **es la tercera animación autoplay de la página** (Hero + Marquee + este). Sumar más movimiento va justo en contra del problema principal (exceso de movimiento). Requiere hacerlo bien: pausa en hover, drag/swipe, respeta `prefers-reduced-motion`, se detiene con la pestaña inactiva, velocidad lenta. Es más superficie de bug y de mantenimiento.

### Recomendación final

**Grid estático con tarjetas más altas (Opción A)**, por coherencia con el problema de fondo: la landing ya tiene demasiado movimiento al inicio; añadir otro autoplay agrava eso. El grid da presencia editorial sin coste de motion ni de accesibilidad.

Si aun así se quiere el carrusel, que sea **la única** pieza con autoplay de la mitad inferior (implica quitar/degradar el Marquee), lento, con pausa en hover, drag en móvil, "peek" de la siguiente tarjeta, detención con pestaña oculta y respeto a `prefers-reduced-motion`. Es decir: el carrusel solo se justifica si se "gasta" el presupuesto de movimiento que hoy consume el Marquee.

### Comportamiento en desktop y móvil

- **Desktop:** grid 3 columnas, tarjetas altas (`4/5`), nombre + CTA siempre visibles, color en B/N que se activa al hover (mantener este detalle, es elegante).
- **Móvil:** 2 columnas (o 1 si se quiere máximo impacto) con la misma proporción vertical; nada de hover → color siempre activo y CTA visible. Si finalmente fuese carrusel, en móvil debe ser swipe nativo con "peek" de la siguiente, nunca autoplay que dificulte tocar.

---

## Paleta de Althara

### Colores incorrectos detectados

- **No hay ningún amarillo definido como token.** El "amarillo" percibido tiene dos orígenes probables:
  1. **Bronce `#c08552` a baja opacidad.** En el data room los badges usan `bg-[#c08552]/15 text-[#8a5a33]` (estados "invited", "pending", badge "DIR"). El bronce al 15 % sobre blanco/crema vira a **mostaza/amarillo pálido**. Es el candidato más fuerte de "elemento amarillo".
  2. **Autofill de Chrome.** Los inputs (ContactModal, sign-in) son `bg-transparent`; cuando el navegador autocompleta email/teléfono los pinta con su **amarillo de autofill**. No hay CSS que lo neutralice (`-webkit-autofill`). Muy habitual y fácil de confundir con "un amarillo de la marca".
- **Verde `emerald` fuera de paleta.** Badges de estado "active/signed" (`bg-emerald-100 text-emerald-800`) y el chip XLS del Portal (`bg-emerald-50 text-emerald-700`). El verde **no forma parte de la paleta de Althara** y rompe la coherencia con el resto de la plataforma.
- **Grises/negros sueltos fuera de paleta:** aparecen `#0a0a0a`, `#070707`, `#0f0f0f`, `#0b0b0b`, `#faf9f5`, `#faf9f5` que no son ninguno de los oficiales (`#102027`, `#1c3742`, `#e6e2d7`). Más inconsistencia acumulada.

### Posible origen

- El bronce/mostaza viene de **reutilizar `#c08552` como color de acento y de estado** a distintas opacidades sin comprobar cómo lee sobre fondo claro.
- El verde `emerald` viene de **clases utilitarias por defecto de Tailwind** copiadas para "estado ok" (patrón típico de componente reutilizado), sin pasar por la paleta de marca.
- El amarillo de inputs viene del **navegador**, no del código.

### Sustituciones recomendadas (solo con tokens existentes)

- **Estados de éxito / "activo" / "firmado":** sustituir `emerald` por el **teal de marca `#1c3742`** (o su versión suave) como color positivo, o reservar el **bronce `#c08552` a plena opacidad** como único acento. Nada de verde.
- **Badges "invited/pending":** en vez de `#c08552/15` (que amarillea), usar bronce **sólido sobre fondo neutro** (texto `#c08552` sobre `#e6e2d7`/blanco con borde), evitando la mezcla translúcida que vira a mostaza.
- **Inputs:** añadir regla `-webkit-autofill` que fuerce fondo e color de marca, para eliminar el amarillo del autofill.
- **Negros sueltos:** unificar a `#102027` / `#1c3742`.

### Recomendaciones para centralizar los estilos

Hoy hay **dos sistemas de color coexistiendo** y ninguno se usa de forma disciplinada:

- `globals.css` usa **Tailwind v4** (`@import 'tailwindcss'` + bloque `@theme` con tokens `--color-althara-*`, `--color-althara-bronze`, etc.). Este es el sistema real.
- `tailwind.config.ts` (heredado) define colores tipo shadcn con `hsl(var(--border))`, `hsl(var(--primary))`… **pero esas variables `--border`, `--primary` nunca se declaran**, y no hay `@config` que cargue ese archivo en v4. Es, en la práctica, un sistema muerto que puede resolver a valores raros en los componentes `ui/` (input, dialog, button) que dependen de `border-input`, `bg-background`, etc.

Propuesta:

1. **Una sola fuente de verdad**: consolidar todos los tokens en el `@theme` de `globals.css` (semánticos: `--color-bg`, `--color-surface`, `--color-ingk`, `--color-accent`, `--color-success`, `--color-muted`…).
2. **Eliminar o reconciliar `tailwind.config.ts`** para que no haya dos paletas. Si se conservan los componentes shadcn, mapear sus variables (`--background`, `--primary`, `--border`…) a los colores de Althara.
3. **Sustituir los hex a pelo por clases de token.** Hoy `#1c3742`/`#e6e2d7`/`#c08552` están escritos a mano cientos de veces; migrarlos a `bg-ink`, `text-cream`, `text-accent` (o los nombres que se elijan) evita futuras inconsistencias y hace trivial un ajuste global.
4. **Prohibir utilitarios de color crudos de Tailwind** (emerald, amber, etc.) fuera de la paleta.

---

## Carrusel de palabras (Marquee)

### Evaluación de la posición actual (justo debajo del hero)

- Es **decorativo** (`aria-hidden`, sin valor semántico): dos filas de OFF-MARKET / CONFIDENCIAL / SEÑALES / DATA ROOM / INVERSIÓN moviéndose en direcciones opuestas.
- Colocado **inmediatamente tras el hero**, es lo primero que se mueve después de las animaciones del hero. **Compite con el mensaje principal** y aporta la segunda dosis de movimiento en los primeros dos scrolls → refuerza justo el problema de "demasiado al inicio". La intuición del usuario es correcta.
- Además, las palabras que muestra ("DATA ROOM", "SEÑALES") aún no tienen contexto en ese punto: el usuario todavía no sabe qué es un data room ni qué son las señales. Llegan antes de tiempo.

### Evaluación de la nueva ubicación (entre "La tesis" y "Qué hacemos")

- **Mejor sitio.** En esa posición las palabras ya tienen contexto (la tesis acaba de explicar el "por qué del silencio" y "Qué hacemos" va a desarrollar Señales/Análisis/Acceso/Cierre). El marquee actúa de **puente conceptual** y de **pausa visual** entre bloque oscuro y bloque claro, reforzando vocabulario clave justo cuando el usuario puede anclarlo.
- Riesgos a controlar: que no tenga demasiado protagonismo (hoy es enorme, `text-8xl` en dos filas). Como transición debe ser **más contenido**: una sola franja, tipografía menor, quizá una sola fila y velocidad más lenta, para que sea "respiro" y no "espectáculo".

### Recomendación

- **Sí mover el Marquee** fuera de debajo del hero. Valida la intuición del usuario.
- Ubicarlo como **franja editorial de transición entre Thesis y Layers**, integrado en la composición (mismo fondo/aire que las secciones vecinas), **no** como sección autónoma a pantalla completa.
- **Reducir su presencia:** una sola fila (o dos muy sutiles), tamaño menor, velocidad más lenta, opacidad fantasma como ahora. Mantener `prefers-reduced-motion` (ya lo respeta).
- Alternativa si se quiere quitar movimiento del todo: convertirlo en una **línea estática de keywords** separadas por el punto-bronce (OFF-MARKET · CONFIDENCIAL · SEÑALES · DATA ROOM). Igual de editorial, cero motion.

### Forma de integrarlo visualmente

- Franja fina, ancho completo, mismo fondo que la sección (o `#1c3742` como corte de color deliberado), padding vertical reducido respecto al actual.
- Tipografía "ghost" (la que ya tiene) pero un par de tallas menor.
- Debe sentirse como el **separador** entre el "por qué" (tesis) y el "cómo" (qué hacemos), no como una parada.

---

## Nueva estructura propuesta

```
1. Nav
2. Hero            → Qué es Althara + propuesta de valor (aligerado a 4 bloques)
3. Thesis          → La tesis (aquí vive la idea "lo bueno no está en los portales")
   └─ Marquee      → franja de transición, contenida y lenta (movido aquí)
4. Layers          → Qué hacemos (proceso, 4 pasos)  ← FUSIONAR con Method
5. Method          → (fusionar con Layers o convertir en el "cómo" detallado, sin repetir)
6. Segments        → renombrar según contenido: "Con quién trabajamos" / o cambiar a geografía real
7. Portal          → El data room (el producto / la prueba)
8. FinalCta        → Acción: Solicitar acceso / Ya soy inversor
9. Footer
```

Cambios estructurales clave:

- **Marquee** baja del puesto 3 (bajo hero) a franja de transición dentro del bloque tesis→qué hacemos.
- **Layers + Method**: hoy son dos explicaciones seguidas del proceso. **Fusionar en una** (o dejar Layers como "qué hacemos" a alto nivel y Method como "el método paso a paso" claramente diferenciado, evitando el solapamiento Señales≈Originación, Análisis≈Verificación/Valoración, Acceso≈Matching, Cierre≈Ejecución). Recomiendo **una sola sección de proceso**.
- **Segments**: alinear título y contenido (perfiles ≠ "dónde operamos").
- Con esto, la secuencia responde exactamente a: qué es (2) → propuesta (2) → tesis (3) → qué hace (4) → dónde/con quién (6) → oportunidades/producto (7, Portal) → acción (8).

---

## Prioridad de cambios

**Alta**

- Aligerar el Hero: eliminar la tagline, promover el subtítulo a propuesta principal, reducir a 4 bloques.
- Resolver el "amarillo": neutralizar autofill de inputs y cambiar los badges `#c08552/15` que amarillean; quitar el verde `emerald` fuera de paleta.
- Mover el Marquee fuera de debajo del hero (a transición tesis→qué hacemos) y reducir su presencia.
- Fusionar / diferenciar "Qué hacemos" y "Método" (eliminar la redundancia del proceso duplicado).

**Media**

- "Dónde operamos": tarjetas más altas y a 3 columnas (grid estático); mostrar nombre + CTA siempre.
- Corregir el desajuste título/contenido de Segments (nombre vs. perfiles de inversor).
- Centralizar la paleta: una sola fuente de verdad de tokens; reconciliar/eliminar `tailwind.config.ts`.

**Baja**

- Migrar los hex a pelo (`#1c3742`, `#e6e2d7`, `#c08552`…) a clases de token en todo el JSX.
- Unificar negros sueltos (`#0a0a0a`, `#070707`…) a `#102027`/`#1c3742`.
- (Opcional) Evaluar mover los stats del hero justo por encima del pliegue.
- (Opcional) Convertir el Marquee en línea estática de keywords si se decide eliminar todo el motion de esa zona.

---

*Sin implementar. A la espera de validar criterio visual, jerarquía y dirección antes de tocar código.*
