# DELE B2 - App de preparación del examen oficial

Aplicación web completa para preparar el examen **DELE B2** del Instituto Cervantes.
Diseñada para **iPhone** (pero funciona igual en Android, iPad, tablet o PC).
Se instala en la pantalla de inicio como una app nativa gracias a la tecnología PWA,
y funciona **sin conexión** una vez cargada la primera vez.

## ¿Qué incluye?

**Comprensión de lectura** (las 4 tareas oficiales)
- Tarea 1: textos largos con 6 preguntas de opción múltiple cada uno
- Tarea 2: relacionar 4 testimonios con 10 afirmaciones
- Tarea 3: texto con huecos de frases (elegir entre 8)
- Tarea 4: texto con 14 huecos de gramática y léxico

**Comprensión auditiva** (las tres tareas con transcripciones)
- Tarea 1: 6 mensajes cortos
- Tarea 3: entrevista larga con 6 preguntas
- Tarea 5: conferencia expositiva

*Nota: los audios se presentan como transcripciones plegables.
En el iPhone puedes hacer que se lean en voz alta con
**Accesibilidad → Contenido hablado → Leer selección**
(o con el gesto de dos dedos desde la parte superior de la pantalla).*

**Gramática B2** (40 preguntas con explicación)
- Subjuntivo, indicativo vs subjuntivo, condicional
- Por/Para, Ser/Estar, perífrasis, voz pasiva
- Estilo indirecto, pronombres, conectores, preposiciones

**Vocabulario temático** (57 flashcards)
- Trabajo, medio ambiente, tecnología, salud, educación
- Cultura, sociedad, adjetivos útiles B2

**Expresiones idiomáticas** (30) — "dar en el clavo", "costar un ojo de la cara"...

**Conectores discursivos** (29) organizados por función
(adición, contraste, causa, consecuencia, finalidad, etc.)

**Expresión escrita**
- 2 prompts de Tarea 1 (cartas formales) con modelo y checklist
- 2 prompts de Tarea 2 (redacciones de opinión) con modelo
- Editor con contador de palabras y autoguardado

**Expresión oral** (con preparación para las 4 tareas)
- Valorar propuestas, describir fotografías
- Diálogos con el examinador, opinar sobre titulares
- Preguntas guía, estrategias y vocabulario útil

**Simulacro cronometrado** (60 min, lectura + audición)

**Quiz rápido** (20 preguntas mixtas aleatorias)

**Consejos y estrategias** por prueba y para el día del examen

Progreso persistente: total respondidas, % aciertos, racha de días.
Modo oscuro. Totalmente en español.

## Instalación en iPhone (2 minutos)

1. Primero tienes que **publicar la carpeta** en algún sitio con URL pública.
   La forma más sencilla y gratuita es **GitHub Pages** (ver sección siguiente).
2. En el iPhone, abre la URL **con Safari** (no funciona con Chrome/Firefox para instalar).
3. Pulsa el botón **Compartir** (el cuadrado con la flecha hacia arriba).
4. Desplázate hacia abajo y pulsa **"Añadir a pantalla de inicio"**.
5. Confirma el nombre ("DELE B2") y pulsa **Añadir**.
6. Ya tienes el icono en la pantalla de inicio; al abrirlo, se ejecuta a pantalla
   completa como una app. A partir de la primera visita funciona sin internet.

## Publicar en GitHub Pages (gratis)

1. En GitHub, abre el repositorio `configjson`.
2. Ve a **Settings → Pages**.
3. En "Source", elige **Deploy from a branch**.
4. En "Branch", elige **main** (o la rama que contenga estos archivos) y **/ (root)**.
5. Pulsa **Save**. En ~1-2 minutos la URL estará activa en la parte superior de
   esa misma página. Será algo como
   `https://<tu-usuario>.github.io/configjson/`.
6. Abre esa URL en el Safari del iPhone y sigue los pasos de la sección anterior.

Cualquier hosting estático sirve igual: Netlify (drag-and-drop), Vercel,
Cloudflare Pages, Firebase Hosting... No hace falta servidor ni base de datos.

## Uso offline

Tras la primera carga, el service worker cachea todo (HTML, CSS, JS, iconos,
preguntas). La próxima vez que abras la app desde la pantalla de inicio, cargará
aunque estés sin datos ni WiFi. Ideal para estudiar en el metro, en un avión o
en un pueblo con poca cobertura.

## Privacidad

Todo el progreso se guarda **solo en el propio iPhone** (localStorage del navegador).
Nada se envía a ningún servidor. Si borras el historial de Safari o desinstalas
la app de la pantalla de inicio, se pierde el progreso.

## Consejos de uso diario

- **30 minutos al día** rinden más que 3 horas un día suelto.
- Usa la pestaña **Quiz** para un repaso rápido de 20 preguntas mezcladas.
- Repite las **flashcards** varias veces a la semana.
- Haz **un simulacro cronometrado** la semana antes del examen.
- Escribe las **redacciones** como si fueran el examen de verdad,
  respetando las 150-180 palabras, y compara con el modelo solo después.
- Lee **en voz alta** las transcripciones de audición para ganar soltura oral.

## Estructura de archivos

```
index.html      · estructura y estilos de la app
app.js          · motor (quiz, flashcards, editor, progreso)
questions.js    · todo el contenido de estudio
manifest.json   · metadatos PWA para instalación
sw.js           · service worker para funcionamiento offline
icon.svg        · icono vectorial
icon.png / icon-180.png / icon-512.png · iconos para iOS/Android
```

## Créditos

Contenido original inspirado en el formato oficial de los exámenes del
Instituto Cervantes (estructura de pruebas, tipos de tareas, criterios de
evaluación), sin reproducir preguntas reales de exámenes protegidos.

Hecho con cariño para que estudies cómodamente desde el móvil. ¡Mucha suerte!
