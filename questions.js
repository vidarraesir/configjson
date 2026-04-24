// Contenido DELE B2 - Base de datos de preguntas y materiales de estudio.
// Se va rellenando por sub-tandas.

window.DELE_DATA = {
  reading: { t1: [], t2: [], t3: [], t4: [] },
  listening: { t1: [], t3: [], t5: [] },
  grammar: [],
  vocab: [],
  idioms: [],
  connectors: [],
  writing: { tarea1: [], tarea2: [] },
  speaking: { tarea1: [], tarea2: [], tarea3: [], tarea4: [] },
  tips: {}
};

// =============================================================
// LECTURA - TAREA 1
// Formato oficial: un texto largo (opinión/informativo/entrevista)
// seguido de 6 preguntas con tres opciones (a/b/c).
// =============================================================

window.DELE_DATA.reading.t1 = [
  {
    id: 'r1-teletrabajo',
    titulo: 'El teletrabajo transforma las ciudades',
    instrucciones: 'Lea el siguiente texto y conteste a las preguntas. Seleccione la opción correcta (a, b o c).',
    texto: `Hace apenas unos años, imaginar una ciudad vacía de oficinistas entre semana habría resultado impensable. Sin embargo, la progresiva implantación del teletrabajo ha empezado a redibujar el mapa de muchas metrópolis españolas. Los centros urbanos, antes abarrotados de trabajadores que engullían sus almuerzos en cafeterías de menú del día, ven ahora cómo esos mismos locales cierran sus puertas o se reconvierten, mientras los barrios residenciales de las afueras viven una inesperada efervescencia.

La socióloga Marta Arévalo, investigadora en la Universidad de Valencia, sostiene que este cambio no se debe atribuir únicamente a la pandemia de 2020. "El confinamiento actuó como catalizador, pero la tendencia llevaba años gestándose. Lo que ocurrió fue que, de la noche a la mañana, miles de empresas descubrieron que sus plantillas rendían igual o incluso más desde casa, y ya no hubo marcha atrás", explica. Según sus datos, un 28 % de los asalariados españoles combina actualmente jornadas presenciales con días en remoto, una cifra que hace una década no llegaba al 5 %.

Las consecuencias se notan en lugares insospechados. Las panaderías, farmacias y peluquerías de los barrios dormitorio han visto crecer su facturación entre semana; a cambio, los hoteles urbanos orientados al viajero de negocios atraviesan un momento delicado. El sector inmobiliario también se ha visto sacudido: los alquileres en pueblos a menos de cien kilómetros de las grandes capitales se han encarecido notablemente, pues muchas familias, liberadas de la obligación de acudir a diario a la oficina, han optado por trasladarse a zonas más verdes y económicas.

No obstante, no todo son ventajas. Diversos estudios apuntan a que trabajar desde casa puede acentuar la sensación de aislamiento, especialmente entre los jóvenes recién incorporados al mercado laboral, que pierden así la oportunidad de aprender de manera informal de sus compañeros más experimentados. Además, los sindicatos alertan de que la difuminación de la frontera entre la vida personal y la profesional está provocando un aumento de las horas extraordinarias no remuneradas. "Cuando tu salón es también tu oficina, resulta muy difícil desconectar a las seis de la tarde", recalca la representante sindical Lourdes Benítez.

Los ayuntamientos, por su parte, empiezan a reaccionar. Varias ciudades han anunciado planes para reconvertir edificios de oficinas vacíos en vivienda asequible, mientras que otras apuestan por instalar espacios de trabajo compartidos en bibliotecas y centros cívicos de barrio, para que los vecinos puedan salir de casa sin verse obligados a desplazarse al centro. "La gran pregunta", concluye Arévalo, "es si sabremos aprovechar esta transformación para construir ciudades más habitables o si, por el contrario, se ahondarán las desigualdades entre quienes pueden teletrabajar y quienes no".`,
    preguntas: [
      {
        q: '1. Según el texto, el teletrabajo en España:',
        opciones: [
          'a) empezó con la pandemia de 2020.',
          'b) ya se estaba desarrollando antes de la pandemia.',
          'c) afecta a casi un 5 % de los trabajadores.'
        ],
        correcta: 1,
        explicacion: 'Marta Arévalo afirma que "el confinamiento actuó como catalizador, pero la tendencia llevaba años gestándose". La opción a) es incorrecta porque la pandemia solo aceleró un proceso previo; la c) confunde el dato actual (28%) con el de hace una década.'
      },
      {
        q: '2. En el texto se dice que las cafeterías de menú del día:',
        opciones: [
          'a) han aumentado su clientela entre semana.',
          'b) están cerrando o cambiando de negocio.',
          'c) se han trasladado a los barrios residenciales.'
        ],
        correcta: 1,
        explicacion: 'El texto indica que esos locales "cierran sus puertas o se reconvierten". No han aumentado clientela ni se han mudado; son otros comercios (panaderías, farmacias) los que florecen en los barrios.'
      },
      {
        q: '3. De acuerdo con el texto, los pueblos cercanos a grandes ciudades:',
        opciones: [
          'a) están sufriendo una bajada de los alquileres.',
          'b) han perdido población por el teletrabajo.',
          'c) se han vuelto más caros para alquilar.'
        ],
        correcta: 2,
        explicacion: 'Se afirma explícitamente que "los alquileres en pueblos a menos de cien kilómetros de las grandes capitales se han encarecido notablemente". Ocurre justo lo contrario de a) y b): estos pueblos ganan habitantes.'
      },
      {
        q: '4. Según Lourdes Benítez, uno de los problemas del teletrabajo es que:',
        opciones: [
          'a) provoca aislamiento en trabajadores con mucha experiencia.',
          'b) dificulta separar el tiempo de trabajo del tiempo personal.',
          'c) reduce el número de horas trabajadas al día.'
        ],
        correcta: 1,
        explicacion: 'La sindicalista habla de "la difuminación de la frontera entre la vida personal y la profesional" y de que es difícil desconectar. El aislamiento al que se refiere el texto afecta a jóvenes, no a veteranos (a), y las horas no se reducen, más bien aumentan las no remuneradas (c).'
      },
      {
        q: '5. De los edificios de oficinas vacíos, algunos ayuntamientos planean:',
        opciones: [
          'a) demolerlos para construir parques.',
          'b) convertirlos en espacios de trabajo compartidos.',
          'c) transformarlos en viviendas a precios asequibles.'
        ],
        correcta: 2,
        explicacion: 'El texto dice literalmente "reconvertir edificios de oficinas vacíos en vivienda asequible". Los espacios de trabajo compartidos (b) se instalan en bibliotecas y centros cívicos, no en las antiguas oficinas.'
      },
      {
        q: '6. La autora del artículo, en su conjunto, presenta el teletrabajo como:',
        opciones: [
          'a) un fenómeno exclusivamente positivo para la sociedad.',
          'b) un cambio con consecuencias tanto favorables como negativas.',
          'c) una moda pasajera que pronto desaparecerá.'
        ],
        correcta: 1,
        explicacion: 'El texto presenta beneficios (barrios revitalizados, menos desplazamientos) pero también problemas (aislamiento, jornadas eternas, desigualdad). La cita final sobre las "desigualdades" confirma ese equilibrio. Ni a) ni c) encajan con el tono matizado del artículo.'
      }
    ]
  },
  {
    id: 'r1-gastronomia',
    titulo: 'La nueva ola de la gastronomía sostenible',
    instrucciones: 'Lea el siguiente texto y conteste a las preguntas. Seleccione la opción correcta (a, b o c).',
    texto: `Durante décadas, la alta cocina española se asoció con ingredientes importados de lugares remotos: trufas italianas, wagyu japonés, caviar ruso. Hoy, sin embargo, un número creciente de chefs camina en sentido contrario y reivindica el kilómetro cero, es decir, el uso casi exclusivo de productos cultivados o criados a pocos kilómetros del restaurante. No se trata solo de una cuestión estética ni de una moda efímera: detrás de este giro hay razones económicas, ecológicas y, sobre todo, una reflexión profunda sobre lo que significa cocinar en el siglo XXI.

Uno de los referentes de esta corriente es el cocinero asturiano Iván Palacio, al frente de un pequeño local en un valle perdido de la cordillera Cantábrica. Su carta cambia cada semana, según lo que el huerto y los pastores vecinos puedan proporcionarle. "Al principio me costó renunciar a ingredientes a los que estaba acostumbrado en mi etapa en París, pero enseguida descubrí una despensa que no conocía, justo al otro lado de mi puerta", comenta. Palacio reconoce que trabajar así limita la creatividad de ciertos platos, pero sostiene que obliga al cocinero a estar mucho más atento a las estaciones y a los ciclos de la naturaleza.

El movimiento, no obstante, encuentra también sus detractores. Algunos críticos gastronómicos consideran que la obsesión por lo local puede empobrecer la cocina, al cerrar las puertas a influencias externas que, históricamente, han enriquecido la tradición culinaria española. La paella, recuerdan, incorporó el arroz traído por los árabes; los guisos castellanos no serían lo que son sin el pimentón americano; el aceite de oliva procede, en última instancia, de Oriente Próximo. "La cocina nunca ha sido pura, y pretender encerrarla en un radio de cincuenta kilómetros es, a mi juicio, una ingenuidad", declaraba recientemente un conocido periodista gastronómico.

A estas críticas, los partidarios del kilómetro cero responden que nadie pretende renunciar al patrimonio culinario heredado, sino únicamente abastecerse hoy de los productores cercanos. Además, destacan que la huella de carbono de un tomate cultivado en el pueblo de al lado es infinitamente menor que la de uno transportado en avión desde el hemisferio sur en pleno invierno. También subrayan el impacto social: este modelo permite que pequeñas explotaciones familiares, a menudo al borde de la desaparición, sigan siendo rentables, fijando población en zonas rurales amenazadas por la despoblación.

Para los comensales, adaptarse a esta nueva filosofía exige cierto cambio de mentalidad. Ya no se puede esperar encontrar fresas en diciembre ni espárragos en octubre. A cambio, se gana intensidad de sabor y, según dicen muchos clientes, una experiencia gastronómica más conectada con el lugar. Si esta tendencia se consolidará o quedará reducida a un pequeño círculo de restaurantes selectos es algo que solo los próximos años podrán responder.`,
    preguntas: [
      {
        q: '1. Según el texto, el kilómetro cero en la gastronomía:',
        opciones: [
          'a) es una moda reciente sin fundamento real.',
          'b) responde a motivos económicos, ecológicos y filosóficos.',
          'c) se limita a una cuestión puramente estética.'
        ],
        correcta: 1,
        explicacion: 'El primer párrafo señala "razones económicas, ecológicas y, sobre todo, una reflexión profunda". Los adverbios "no se trata solo de... ni de una moda efímera" descartan las opciones a) y c).'
      },
      {
        q: '2. Iván Palacio afirma que trabajar con productos locales:',
        opciones: [
          'a) le resulta menos creativo y por eso lo hace a disgusto.',
          'b) le obliga a prestar más atención a las estaciones del año.',
          'c) es algo que aprendió durante su etapa en París.'
        ],
        correcta: 1,
        explicacion: 'El texto dice que "obliga al cocinero a estar mucho más atento a las estaciones y a los ciclos de la naturaleza". Palacio reconoce limitaciones pero no manifiesta disgusto (a), y en París trabajaba justamente con ingredientes importados (c).'
      },
      {
        q: '3. Los críticos del kilómetro cero sostienen principalmente que:',
        opciones: [
          'a) la comida local es más cara que la importada.',
          'b) cerrarse a lo externo empobrece la tradición culinaria.',
          'c) el sabor de los productos cercanos es inferior.'
        ],
        correcta: 1,
        explicacion: 'El periodista citado afirma que "la cocina nunca ha sido pura" y pone ejemplos de influencias externas (arroz, pimentón, aceite). La crítica no es ni económica (a) ni sobre sabor (c), sino cultural.'
      },
      {
        q: '4. Los defensores del kilómetro cero argumentan que su modelo:',
        opciones: [
          'a) pretende renunciar a todas las influencias extranjeras del pasado.',
          'b) es indiferente al problema medioambiental.',
          'c) ayuda a mantener vivas las pequeñas explotaciones rurales.'
        ],
        correcta: 2,
        explicacion: 'Se señala el "impacto social" y que el modelo permite "fijar población en zonas rurales amenazadas por la despoblación". Los defensores no renuncian al patrimonio heredado (a) y sí valoran la reducción de huella de carbono (b).'
      },
      {
        q: '5. El texto indica que, para el cliente, este enfoque supone:',
        opciones: [
          'a) renunciar a encontrar ciertos alimentos fuera de temporada.',
          'b) pagar siempre precios más elevados que en restaurantes tradicionales.',
          'c) aceptar que la calidad del sabor disminuye notablemente.'
        ],
        correcta: 0,
        explicacion: 'El autor es explícito: "Ya no se puede esperar encontrar fresas en diciembre ni espárragos en octubre". Al contrario de b) y c), se dice que se gana en intensidad de sabor; el precio no se menciona.'
      },
      {
        q: '6. El tono general del artículo respecto al kilómetro cero podría describirse como:',
        opciones: [
          'a) claramente entusiasta y apologético.',
          'b) abiertamente escéptico y desaprobatorio.',
          'c) equilibrado, con luces y sombras.'
        ],
        correcta: 2,
        explicacion: 'El autor presenta argumentos de ambos lados, cita a partidarios y a detractores y termina sin pronunciarse definitivamente ("si se consolidará o quedará reducida... solo los próximos años podrán responder"). Ese carácter abierto descarta tanto a) como b).'
      }
    ]
  }
];

// =============================================================
// LECTURA - TAREA 2
// Formato oficial: 4 textos cortos (A, B, C, D) con experiencias
// de personas, y 10 afirmaciones para relacionar con los textos.
// =============================================================

window.DELE_DATA.reading.t2 = [
  {
    id: 'r2-voluntariado',
    titulo: 'Cuatro voluntarios cuentan su experiencia',
    instrucciones: 'Lea los testimonios de cuatro personas que han participado en programas de voluntariado. Relacione cada afirmación (1–10) con la persona correspondiente (A, B, C o D). Cada persona puede ser elegida más de una vez.',
    textos: [
      {
        letra: 'A',
        nombre: 'Lorena (32 años, Madrid)',
        contenido: 'Llevaba años dándole vueltas a la idea de ayudar en un comedor social, pero siempre encontraba alguna excusa para no dar el paso. Cuando por fin me lancé, descubrí que lo que yo aportaba era mucho menos de lo que recibía. No me refiero tanto a las horas, sino a las conversaciones con personas que habían tenido vidas completamente distintas a la mía. Lo único que echo de menos es más formación antes de empezar: el primer día no sabía ni cómo dirigirme a algunos usuarios sin meter la pata.'
      },
      {
        letra: 'B',
        nombre: 'Andrés (58 años, Sevilla)',
        contenido: 'Me jubilé antes de tiempo y no sabía qué hacer con tanto tiempo libre. Mi mujer me sugirió apuntarme a una asociación que acompaña a mayores que viven solos, y aquí estoy, dos años después. Al principio pensé que iba a ser yo quien les diera conversación, pero rápidamente me di cuenta de que son ellos los que me enseñan a mí, con sus historias de otras épocas. Lo que más me sorprendió es la cantidad de gente mayor que pasa días enteros sin hablar con nadie. Es un problema del que se habla poco, y creo que debería estar mucho más presente en los medios.'
      },
      {
        letra: 'C',
        nombre: 'Nuria (24 años, Valencia)',
        contenido: 'Como estudiante de biología, decidí pasar un verano en un centro de recuperación de fauna marina. No voy a mentir: las primeras semanas fueron duras, porque los horarios eran muy exigentes y no siempre podíamos salvar a los animales que llegaban. Ahora bien, la recompensa de ver a una tortuga volver al mar después de semanas de cuidados compensa con creces cualquier cansancio. Una cosa que mejoraría es la coordinación entre los centros y los pescadores: muchos animales llegan demasiado tarde porque nadie sabe a quién avisar.'
      },
      {
        letra: 'D',
        nombre: 'Carlos (45 años, Bilbao)',
        contenido: 'Llevo casi diez años colaborando con una ONG que da clases de refuerzo a niños de barrios con pocos recursos. Siempre me ha gustado enseñar y, como informático, tenía las tardes relativamente libres. Lo que nunca imaginé es que acabaría aprendiendo tanto de los propios chavales: su capacidad para salir adelante, a pesar de las dificultades, me parece admirable. No todo es bonito, claro: a veces te topas con familias que no valoran lo que haces, y eso duele. Pero son casos puntuales. Si tuviera que dar un consejo a quien esté pensando en empezar, sería simplemente este: no esperes más, porque el momento ideal no existe.'
      }
    ],
    afirmaciones: [
      { n: 1, texto: 'Esta persona se quedó impresionada por la soledad que sufre un determinado colectivo.', correcta: 'B', explicacion: 'Andrés se sorprende de "la cantidad de gente mayor que pasa días enteros sin hablar con nadie".' },
      { n: 2, texto: 'Esta persona considera que la organización con la que colabora necesita más formación inicial.', correcta: 'A', explicacion: 'Lorena dice que "echo de menos es más formación antes de empezar".' },
      { n: 3, texto: 'Esta persona dedica al voluntariado una parte considerable de su tiempo desde hace más de cinco años.', correcta: 'D', explicacion: 'Carlos "lleva casi diez años colaborando".' },
      { n: 4, texto: 'Esta persona destaca que, cuando comenzó, el ritmo de trabajo le resultó exigente.', correcta: 'C', explicacion: 'Nuria reconoce que "las primeras semanas fueron duras, porque los horarios eran muy exigentes".' },
      { n: 5, texto: 'Esta persona invita abiertamente a otras personas a no posponer más su decisión.', correcta: 'D', explicacion: 'Carlos da el consejo: "no esperes más, porque el momento ideal no existe".' },
      { n: 6, texto: 'Esta persona empezó a hacer voluntariado tras un cambio importante en su vida laboral.', correcta: 'B', explicacion: 'Andrés se inició tras jubilarse anticipadamente.' },
      { n: 7, texto: 'Esta persona reconoce que su voluntariado está relacionado con su formación profesional.', correcta: 'C', explicacion: 'Nuria es estudiante de biología y colabora con un centro de fauna.' },
      { n: 8, texto: 'Esta persona menciona que tardó bastante en decidirse a ser voluntaria.', correcta: 'A', explicacion: 'Lorena llevaba "años dándole vueltas a la idea" y ponía excusas.' },
      { n: 9, texto: 'Esta persona propone una mejora concreta en la comunicación entre distintos agentes.', correcta: 'C', explicacion: 'Nuria sugiere mejorar "la coordinación entre los centros y los pescadores".' },
      { n: 10, texto: 'Esta persona reconoce que, a veces, se encuentra con actitudes poco agradecidas.', correcta: 'D', explicacion: 'Carlos menciona "familias que no valoran lo que haces, y eso duele".' }
    ]
  }
];

// =============================================================
// LECTURA - TAREA 3
// Formato oficial: texto con 6 huecos; hay 8 fragmentos (A-H) y
// el candidato debe encajar cada hueco con una frase, dos sobran.
// =============================================================

window.DELE_DATA.reading.t3 = [
  {
    id: 'r3-bibliotecas',
    titulo: 'Las bibliotecas públicas se reinventan',
    instrucciones: 'Lea el texto. Faltan seis fragmentos, marcados con [1]–[6]. Elija de entre las ocho opciones (A–H) el fragmento que corresponde a cada hueco. Hay DOS fragmentos que no encajan en ninguna parte.',
    texto: `Durante mucho tiempo se dio por hecho que las bibliotecas públicas estaban condenadas a desaparecer. La llegada de internet, el abaratamiento de los libros digitales y el uso generalizado de los móviles hacían pensar que pocas personas seguirían acudiendo a un edificio para consultar información que podían obtener desde su sofá. [1] Lo que está ocurriendo en muchas ciudades españolas desmiente por completo esa profecía.

Lejos de quedarse vacías, numerosas bibliotecas municipales han experimentado en los últimos años un incremento notable de visitantes. [2] Así, han pasado de ser lugares silenciosos orientados casi en exclusiva al préstamo de libros, a convertirse en auténticos centros culturales que ofrecen desde talleres de escritura creativa hasta sesiones de cuentacuentos o clubes de lectura.

Uno de los aspectos más llamativos de esta transformación es el papel social que cumplen. En barrios donde apenas existen otros espacios gratuitos, la biblioteca funciona como punto de encuentro intergeneracional. [3] De hecho, no es raro ver a un jubilado leyendo el periódico al lado de un estudiante que prepara un examen.

El acceso a internet gratuito también ha resultado ser un factor decisivo. Muchas personas utilizan los ordenadores de la biblioteca para realizar trámites administrativos que, hoy en día, prácticamente solo pueden hacerse en línea. [4] Sin estos recursos públicos, un amplio sector de la población quedaría excluido de servicios básicos.

Por supuesto, no todo son luces. Los presupuestos municipales destinados a cultura siguen siendo, en la mayoría de casos, insuficientes. [5] El resultado es que muchos bibliotecarios trabajan con plantillas reducidas y con instalaciones que necesitan una urgente modernización.

Con todo, los profesionales del sector se muestran optimistas. [6] Si reciben el apoyo necesario, aseguran que estas instituciones pueden convertirse en pilares fundamentales para afrontar los retos culturales y sociales de las próximas décadas.`,
    fragmentos: [
      { letra: 'A', texto: 'Sin embargo, la realidad ha desmentido de forma clamorosa esas predicciones.' },
      { letra: 'B', texto: 'La explicación se encuentra, en buena medida, en la diversificación de los servicios que ofrecen.' },
      { letra: 'C', texto: 'Allí pueden coincidir, sin necesidad de consumir nada, personas de edades y procedencias muy distintas.' },
      { letra: 'D', texto: 'Solicitar una ayuda, pedir cita con el médico o renovar el paro exige hoy una competencia digital que no toda la ciudadanía posee.' },
      { letra: 'E', texto: 'Las bibliotecas privadas, en cambio, atraen cada vez a menos público.' },
      { letra: 'F', texto: 'La reducción de recursos afecta tanto al personal como al mantenimiento de los edificios.' },
      { letra: 'G', texto: 'Confían en que su labor siga siendo reconocida y ampliada.' },
      { letra: 'H', texto: 'Esta es, sin duda, una de las razones que explica la escasez de lectores jóvenes.' }
    ],
    huecos: [
      { n: 1, correcta: 'A', explicacion: 'Tras enumerar motivos para pensar que las bibliotecas morirían, el texto introduce un contraste fuerte: "Lo que está ocurriendo... desmiente por completo esa profecía". La opción A es la única que recoge ese contraste con la misma idea ("ha desmentido de forma clamorosa esas predicciones").' },
      { n: 2, correcta: 'B', explicacion: 'El párrafo empieza hablando del aumento de visitantes y, justo después del hueco, explica el cambio de función de las bibliotecas. B introduce exactamente esa causa: "la diversificación de los servicios que ofrecen".' },
      { n: 3, correcta: 'C', explicacion: 'Se está hablando de la biblioteca como punto de encuentro intergeneracional y el hueco debe introducir esa idea de convivencia. La frase sobre el jubilado y el estudiante confirma que C ("Allí pueden coincidir... personas de edades muy distintas") es la correcta.' },
      { n: 4, correcta: 'D', explicacion: 'Antes se habla de trámites administrativos que solo pueden hacerse en línea. D concreta ejemplos de esos trámites ("solicitar una ayuda, pedir cita con el médico...") y enlaza con la frase siguiente sobre exclusión digital.' },
      { n: 5, correcta: 'F', explicacion: 'Tras mencionar que los presupuestos son insuficientes, el texto continúa con "muchos bibliotecarios trabajan con plantillas reducidas y con instalaciones que necesitan modernización". F resume justamente esas dos consecuencias (personal y edificios).' },
      { n: 6, correcta: 'G', explicacion: 'El párrafo cierra con el optimismo de los profesionales. G ("Confían en que su labor siga siendo reconocida y ampliada") introduce esa esperanza, y encaja con la frase siguiente sobre "si reciben el apoyo necesario".' }
    ],
    sobrantes: ['E', 'H']
  }
];

// =============================================================
// LECTURA - TAREA 4
// Formato oficial: texto con 14 huecos de gramática/léxico.
// Cada hueco tiene tres opciones a/b/c.
// =============================================================

window.DELE_DATA.reading.t4 = [
  {
    id: 'r4-aprender-idiomas',
    titulo: 'Mitos sobre aprender idiomas de adulto',
    instrucciones: 'Lea el texto y, para cada hueco, elija la opción correcta entre las tres propuestas (a, b o c). Los huecos evalúan gramática y léxico.',
    textoHtml: `Durante mucho tiempo se ha __[1]__ de que los adultos son incapaces de aprender un idioma con la misma naturalidad que un niño. __[2]__, los estudios más recientes en neurociencia apuntan en una dirección bastante distinta. El cerebro adulto conserva una plasticidad notable y, __[3]__ no adquiera las lenguas del mismo modo que en la infancia, sí cuenta con recursos cognitivos que los más pequeños todavía no han desarrollado.

Uno de los mitos más extendidos es que, __[4]__ de los veinte años, resulta prácticamente imposible hablar sin acento. Lo cierto es que el acento perfecto depende de muchos factores, pero __[5]__ al nivel comunicativo, la edad no es un obstáculo insalvable. Basta con que el aprendiz __[6]__ a una exposición constante a la lengua para que vaya incorporando estructuras y vocabulario con solvencia.

Otro error habitual consiste en pensar que, para dominar un idioma, __[7]__ vivir en un país donde se hable. Esto era cierto hace unas décadas, pero hoy internet y los recursos audiovisuales __[8]__ acceder a contenidos auténticos desde cualquier lugar. Con constancia, una persona puede __[9]__ avances significativos sin salir de su ciudad.

La motivación, __[10]__, juega un papel determinante. Aprender un idioma porque __[11]__ obligados suele dar peores resultados que hacerlo por un interés genuino. De hecho, a los profesores les sorprende comprobar cómo adultos que __[12]__ abandonado los estudios formales hace años son capaces de alcanzar niveles avanzados cuando la materia les apasiona.

En definitiva, conviene desterrar la idea de que aprender una lengua es asunto de niños. __[13]__ la voluntad y las herramientas adecuadas, cualquier persona __[14]__ lograr avances sorprendentes a lo largo de su vida.`,
    huecos: [
      { n: 1, opciones: ['a) afirmado', 'b) afirmando', 'c) afirmar'], correcta: 0, explicacion: 'Tras "se ha" hace falta el participio para formar el pretérito perfecto pasivo: "se ha afirmado". "Afirmando" sería gerundio (incorrecto con "haber") e "afirmar" sería infinitivo.' },
      { n: 2, opciones: ['a) Además', 'b) Sin embargo', 'c) Por tanto'], correcta: 1, explicacion: 'El texto contrasta la creencia popular con los estudios recientes. Se necesita un conector de contraste: "Sin embargo". "Además" suma y "por tanto" indica consecuencia.' },
      { n: 3, opciones: ['a) aunque', 'b) a pesar de', 'c) como'], correcta: 0, explicacion: 'Con verbo conjugado en subjuntivo ("no adquiera") se utiliza "aunque". "A pesar de" requiere infinitivo o sustantivo ("a pesar de no adquirir"). "Como" no expresa concesión aquí.' },
      { n: 4, opciones: ['a) desde', 'b) a partir', 'c) a los'], correcta: 1, explicacion: '"A partir de los veinte años" es la locución fija para marcar el inicio de un periodo. "Desde" también funcionaría pero exige "desde los veinte años". "A los" no encaja con "de" posterior.' },
      { n: 5, opciones: ['a) en cuanto', 'b) respecto', 'c) referente'], correcta: 1, explicacion: '"Respecto al nivel comunicativo" es la locución correcta. "En cuanto al" también valdría, pero la forma aquí es "respecto". "Referente" requiere también "a" pero es menos habitual y la colocación es distinta.' },
      { n: 6, opciones: ['a) se somete', 'b) se someta', 'c) se sometiera'], correcta: 1, explicacion: 'La estructura "Basta con que..." exige subjuntivo. Presente de subjuntivo "se someta" porque la acción es general/futura. El imperfecto "se sometiera" aludiría a hipótesis pasada.' },
      { n: 7, opciones: ['a) se debe', 'b) hay que', 'c) haya que'], correcta: 1, explicacion: 'Se necesita una perífrasis de obligación impersonal: "hay que vivir". "Se debe" exige sujeto explícito ("se debe vivir allí" suena forzado en este contexto). "Haya que" sería subjuntivo y aquí hace falta indicativo.' },
      { n: 8, opciones: ['a) permiten', 'b) permite', 'c) han permitido a'], correcta: 0, explicacion: 'El sujeto "internet y los recursos audiovisuales" es plural: "permiten acceder". "Permite" concordaría solo con un sujeto singular y "han permitido a" introduciría innecesariamente un CI.' },
      { n: 9, opciones: ['a) hacer', 'b) tener', 'c) realizar'], correcta: 1, explicacion: 'La colocación habitual en español es "tener avances significativos". "Hacer avances" y "realizar avances" son calcos del inglés/francés poco naturales.' },
      { n: 10, opciones: ['a) por cierto', 'b) por ejemplo', 'c) por su parte'], correcta: 2, explicacion: '"Por su parte" introduce un nuevo elemento dentro de una enumeración (la motivación, después de otros factores). "Por cierto" cambia de tema y "por ejemplo" introduciría un caso concreto, no un nuevo factor.' },
      { n: 11, opciones: ['a) estén', 'b) estarán', 'c) están'], correcta: 2, explicacion: 'Oración subordinada causal con valor real: "porque están obligados" (indicativo). El subjuntivo solo aparecería si la causa se negara ("no porque estén obligados...").' },
      { n: 12, opciones: ['a) han', 'b) habían', 'c) habrán'], correcta: 1, explicacion: 'Se narra un hecho del pasado anterior a otro pasado ("abandonar los estudios" es previo al momento presente de la narración): pretérito pluscuamperfecto "habían abandonado". "Han" daría pretérito perfecto; "habrán", futuro compuesto.' },
      { n: 13, opciones: ['a) A', 'b) Con', 'c) Por'], correcta: 1, explicacion: '"Con la voluntad y las herramientas adecuadas" expresa el instrumento/condición. "A" y "por" no introducen este tipo de complemento.' },
      { n: 14, opciones: ['a) puede', 'b) pudiera', 'c) podrá'], correcta: 0, explicacion: 'La oración expresa una posibilidad general, no una hipótesis lejana ni un tiempo futuro concreto: "puede lograr" en presente de indicativo. "Pudiera" suena a deseo/hipótesis; "podrá" marca un futuro que no exige el contexto.' }
    ]
  }
];

// =============================================================
// AUDICIÓN - TAREA 1
// Formato oficial: 6 mensajes cortos (anuncios, avisos, buzón de
// voz, radio) y una pregunta por mensaje con 3 opciones.
// Incluye transcripción para que la alumna la lea (o use TTS).
// =============================================================

window.DELE_DATA.listening.t1 = [
  {
    id: 'a1-m1-radio',
    tipo: 'Cuña de radio',
    transcripcion: 'Queridos oyentes, les recordamos que el programa "Voces del sur", que habitualmente se emite los sábados a las once de la mañana, esta semana se adelanta al viernes a la misma hora debido a la retransmisión del partido de fútbol. La próxima semana el programa volverá a su horario habitual. Gracias por su comprensión.',
    pregunta: '¿Qué se dice en este mensaje?',
    opciones: [
      'a) Que el programa cambia definitivamente al viernes.',
      'b) Que esta semana el programa se emitirá un día antes de lo habitual.',
      'c) Que el programa se cancela por un partido de fútbol.'
    ],
    correcta: 1,
    explicacion: '"Se adelanta al viernes" significa que se emite antes de lo habitual, solo "esta semana"; no es permanente (a) ni una cancelación (c).'
  },
  {
    id: 'a1-m2-megafonia',
    tipo: 'Megafonía en una estación',
    transcripcion: 'Atención, señores viajeros. El tren con destino Barcelona-Sants que tenía prevista su salida a las catorce treinta por la vía cinco saldrá con un retraso estimado de veinte minutos debido a incidencias técnicas. Rogamos disculpen las molestias. Se informará de cualquier cambio a través de estos altavoces.',
    pregunta: 'Según el aviso, el tren:',
    opciones: [
      'a) ha cambiado de vía por una avería.',
      'b) se retrasa por motivos técnicos.',
      'c) ha sido cancelado hasta nuevo aviso.'
    ],
    correcta: 1,
    explicacion: 'El mensaje dice "saldrá con un retraso estimado de veinte minutos debido a incidencias técnicas". No se cambia de vía (sigue siendo la cinco) ni se cancela.'
  },
  {
    id: 'a1-m3-contestador',
    tipo: 'Mensaje de contestador',
    transcripcion: 'Hola Marta, soy Pilar. Mira, te llamo para decirte que al final no voy a poder ir mañana a la cena en casa de Rosa. Me ha salido un imprevisto en el trabajo y tengo que quedarme hasta tarde. Dale recuerdos a todos y comentadle que intentaré pasarme el domingo a comer, si le va bien. Un beso.',
    pregunta: 'Pilar llama a Marta para:',
    opciones: [
      'a) cancelar una cita de trabajo.',
      'b) avisar de que no asistirá a una cena y proponer otra fecha.',
      'c) pedirle que le recoja algo por casa de Rosa.'
    ],
    correcta: 1,
    explicacion: '"No voy a poder ir mañana a la cena" + "intentaré pasarme el domingo a comer" resumen las dos intenciones: cancelar y proponer otra fecha. No cancela trabajo (es la causa) ni pide recados.'
  },
  {
    id: 'a1-m4-anuncio',
    tipo: 'Anuncio publicitario',
    transcripcion: '¿Cansada de esperar cita para las revisiones médicas? En la clínica Salud Plus te ofrecemos análisis completos y atención especializada en menos de setenta y dos horas, sin listas de espera y con tarifas adaptadas a tu presupuesto. Llama ya al novecientos setecientos setenta y dos, o consulta en nuestra web saludplus.es.',
    pregunta: '¿Qué destaca principalmente el anuncio?',
    opciones: [
      'a) Que ofrece tratamientos gratuitos.',
      'b) Que atiende con rapidez y sin lista de espera.',
      'c) Que solo trabaja con pacientes del seguro público.'
    ],
    correcta: 1,
    explicacion: 'El anuncio subraya "en menos de setenta y dos horas, sin listas de espera". Las tarifas son adaptadas, no gratuitas (a), y no se menciona que dependan del seguro público (c).'
  },
  {
    id: 'a1-m5-aerolinea',
    tipo: 'Aviso de aerolínea',
    transcripcion: 'Estimado pasajero, le informamos de que debido a las condiciones meteorológicas en el aeropuerto de destino, su vuelo con número FR5234 ha sido desviado al aeropuerto alternativo de Reus. Desde allí se organizará un servicio de autobuses gratuito hasta Barcelona. Agradecemos su paciencia.',
    pregunta: 'El vuelo del pasajero:',
    opciones: [
      'a) aterrizará en un aeropuerto distinto al previsto.',
      'b) ha sido cancelado por mal tiempo.',
      'c) ha retrasado su despegue una hora.'
    ],
    correcta: 0,
    explicacion: '"Ha sido desviado al aeropuerto alternativo de Reus": se desvía, no se cancela (b) ni se retrasa en origen (c).'
  },
  {
    id: 'a1-m6-supermercado',
    tipo: 'Aviso en supermercado',
    transcripcion: 'Atención, estimada clientela. Les recordamos que hoy, jueves, pueden beneficiarse del veinticinco por ciento de descuento en todos los productos frescos de las secciones de pescadería y carnicería. La oferta es válida únicamente en nuestro establecimiento y hasta el cierre de la jornada. Muchas gracias por su visita.',
    pregunta: 'Según el mensaje, la promoción:',
    opciones: [
      'a) se aplica también en el resto de tiendas de la cadena.',
      'b) dura toda la semana.',
      'c) es solo para hoy y en esta tienda.'
    ],
    correcta: 2,
    explicacion: '"Hoy, jueves" + "únicamente en nuestro establecimiento" + "hasta el cierre de la jornada" confirman c). Descarta a) (solo este establecimiento) y b) (solo hoy).'
  }
];

// =============================================================
// AUDICIÓN - TAREA 3
// Formato oficial: una entrevista (periodista + experto/figura
// pública) con 6 preguntas a/b/c. Se escucha DOS veces.
// =============================================================

window.DELE_DATA.listening.t3 = [
  {
    id: 'a3-entrevista-arquitecta',
    titulo: 'Entrevista a una arquitecta especializada en rehabilitación',
    instrucciones: 'Va a escuchar una entrevista. Después, conteste a las preguntas. Seleccione la opción correcta (a, b o c). La audición se escuchará dos veces.',
    transcripcion: `PERIODISTA: Nuestra invitada de hoy, Cristina Roldán, es arquitecta y lleva quince años dedicándose a un campo que antes se consideraba menor: la rehabilitación de edificios antiguos. Cristina, bienvenida al programa.

CRISTINA: Muchas gracias por la invitación, Javier.

PERIODISTA: Empecemos por el principio. ¿Cómo acaba una recién titulada dedicándose a rehabilitar edificios en lugar de construir obra nueva, que es lo que, supongo, hacen la mayoría de arquitectos al salir de la universidad?

CRISTINA: Fue bastante casual, la verdad. Yo, cuando terminé la carrera, tenía la idea clásica de abrir mi propio estudio y proyectar viviendas desde cero. Pero la crisis de dos mil ocho lo complicó todo. Entré a trabajar en un estudio pequeño que, por casualidad, había recibido un encargo de rehabilitación de un edificio modernista en el centro. Yo iba a ayudar "de paso", pero acabé implicándome tanto que no quise volver atrás.

PERIODISTA: Se dice a menudo que rehabilitar es más difícil que construir nuevo. ¿Es así?

CRISTINA: Totalmente. Cuando proyectas obra nueva, tú pones las reglas; en una rehabilitación, el edificio ya tiene sus propias reglas y tú tienes que aprenderlas antes de poder cambiar nada. Te encuentras con estructuras que no figuran en los planos, con materiales que hoy ya no se fabrican, con vecinos que llevan décadas viviendo allí y tienen opiniones muy claras. Hay que escuchar mucho antes de proyectar.

PERIODISTA: Imagino que también es más caro.

CRISTINA: Sí y no. Es cierto que, metro cuadrado a metro cuadrado, puede parecer más costoso. Pero si sumamos la huella ambiental, el coste de la materia prima y, sobre todo, el valor patrimonial que se conserva, la ecuación cambia bastante. A mi juicio, derribar un edificio sano para levantar uno nuevo es, hoy en día, casi siempre una mala idea.

PERIODISTA: Muchos jóvenes se quejan de que rehabilitar edificios encarece los barrios y expulsa a los vecinos de siempre. ¿Cómo lo ve usted?

CRISTINA: Es un tema muy delicado. Existe, desde luego, un riesgo real de gentrificación cuando las rehabilitaciones se hacen pensando solo en un comprador de alto poder adquisitivo. Por eso yo defiendo que estos proyectos se hagan en colaboración con el Ayuntamiento, con porcentajes reservados a vivienda asequible o alquiler social. Si no, es cierto, puede ocurrir lo que denuncian esos jóvenes.

PERIODISTA: Para terminar, ¿qué consejo le daría a alguien que está pensando en reformar la casa de sus abuelos?

CRISTINA: Lo primero, que no se deje llevar por la prisa. Antes de pedir presupuestos, dedique tiempo a entender el edificio: cómo está hecho, qué patologías tiene, qué le hace único. Y busque a un profesional que, además de diseñar bonito, conozca la técnica antigua. Porque en este tipo de obras, lo que no se ve es casi más importante que lo que se ve.

PERIODISTA: Palabras muy sabias. Muchísimas gracias, Cristina, por estos minutos tan interesantes.`,
    preguntas: [
      {
        q: '1. Cristina comenzó a dedicarse a la rehabilitación porque:',
        opciones: [
          'a) era su vocación desde que estudiaba la carrera.',
          'b) las circunstancias económicas la llevaron a aceptar ese tipo de encargo.',
          'c) lo prefería antes que abrir su propio estudio.'
        ],
        correcta: 1,
        explicacion: 'Cristina explica que "la crisis de dos mil ocho lo complicó todo" y acabó en un estudio que hacía rehabilitación de casualidad. No era su vocación (a): su idea era abrir un estudio propio. No lo prefería: "iba a ayudar de paso".'
      },
      {
        q: '2. Según Cristina, rehabilitar es más difícil que construir nuevo porque:',
        opciones: [
          'a) los materiales antiguos son imposibles de reparar.',
          'b) hay que entender el edificio existente antes de intervenirlo.',
          'c) los vecinos siempre se oponen a los cambios.'
        ],
        correcta: 1,
        explicacion: 'Cristina dice: "el edificio ya tiene sus propias reglas y tú tienes que aprenderlas antes de poder cambiar nada". Los materiales no son imposibles de reparar (solo difíciles de encontrar), y de los vecinos dice que "tienen opiniones muy claras", no que siempre se opongan.'
      },
      {
        q: '3. Respecto al coste de rehabilitar, la entrevistada opina que:',
        opciones: [
          'a) siempre es claramente más barato que construir nuevo.',
          'b) si se tienen en cuenta otros factores, la comparación favorece a la rehabilitación.',
          'c) es imposible de calcular de forma realista.'
        ],
        correcta: 1,
        explicacion: 'Dice "sí y no": es más caro por m² pero, sumando huella ambiental, materia prima y valor patrimonial, "la ecuación cambia bastante". Por eso b) refleja su postura matizada.'
      },
      {
        q: '4. Sobre el problema de la gentrificación, Cristina:',
        opciones: [
          'a) niega que las rehabilitaciones la provoquen.',
          'b) reconoce el riesgo y propone colaboración con la administración pública.',
          'c) sostiene que es responsabilidad exclusiva del Ayuntamiento.'
        ],
        correcta: 1,
        explicacion: 'Admite "un riesgo real" y defiende "que estos proyectos se hagan en colaboración con el Ayuntamiento, con porcentajes reservados a vivienda asequible". No lo niega (a) ni lo delega totalmente (c).'
      },
      {
        q: '5. En cuanto a reformar la casa de los abuelos, recomienda:',
        opciones: [
          'a) contratar al primer profesional que ofrezca buen precio.',
          'b) entender bien el edificio antes de pedir presupuestos.',
          'c) derribar la casa y construir una nueva si se puede.'
        ],
        correcta: 1,
        explicacion: '"Antes de pedir presupuestos, dedique tiempo a entender el edificio". Pide no dejarse llevar por la prisa (contrario a a) y antes había dicho que derribar es "casi siempre una mala idea" (contrario a c).'
      },
      {
        q: '6. La actitud general de Cristina a lo largo de la entrevista es:',
        opciones: [
          'a) defensiva ante las críticas a su profesión.',
          'b) reflexiva y dispuesta a reconocer los problemas del sector.',
          'c) pesimista respecto al futuro de la rehabilitación.'
        ],
        correcta: 1,
        explicacion: 'Admite dificultades, riesgos (gentrificación) y limitaciones, pero también las ventajas. No está a la defensiva (a) ni es pesimista (c): su tono es reflexivo y constructivo.'
      }
    ]
  }
];

// =============================================================
// AUDICIÓN - TAREA 5
// Formato oficial: un monólogo expositivo (conferencia/charla)
// con 6 preguntas a/b/c. Se escucha DOS veces.
// =============================================================

window.DELE_DATA.listening.t5 = [
  {
    id: 'a5-conferencia-sueno',
    titulo: 'Conferencia: La importancia del sueño en la salud',
    instrucciones: 'Va a escuchar una conferencia. Después, conteste a las preguntas. Seleccione la opción correcta (a, b o c). La audición se escuchará dos veces.',
    transcripcion: `Buenas tardes a todos. Es un placer estar hoy aquí, en este ciclo dedicado a la salud preventiva, para hablarles de algo que, a pesar de ocupar aproximadamente un tercio de nuestra vida, todavía se subestima con demasiada frecuencia: el sueño.

Durante siglos se pensó que dormir era una actividad pasiva, casi una forma de apagón biológico. Hoy sabemos que no es así, ni mucho menos. Mientras dormimos, nuestro cerebro está trabajando a pleno rendimiento: consolida la memoria, elimina residuos metabólicos acumulados durante el día y regula la producción de hormonas esenciales. Dormir no es un lujo, es una necesidad fisiológica tan básica como comer o respirar.

El problema es que vivimos en sociedades que han hecho del insomnio una casi normalidad. Según los últimos estudios europeos, uno de cada tres adultos duerme menos de las siete horas recomendadas, y las consecuencias a medio y largo plazo son profundas. Hablamos de un mayor riesgo de enfermedades cardiovasculares, de diabetes tipo dos, de trastornos de ansiedad y, lo que resulta especialmente preocupante, de un envejecimiento cognitivo acelerado. Los déficits de sueño mantenidos en el tiempo, me atrevería a afirmar, son uno de los factores de riesgo más subestimados de nuestra época.

Muchos pensarán: "Bueno, yo duermo poco entre semana, pero los fines de semana recupero". Se trata de un mito especialmente extendido y, siento tener que decirlo, bastante inexacto. La llamada "deuda de sueño" no funciona como una deuda bancaria: no se puede saldar simplemente durmiendo diez horas el sábado. Lo que sí está demostrado es que alternar horarios muy dispares entre días laborables y festivos desregula el ritmo circadiano, provocando el fenómeno conocido como "jet lag social", con efectos comparables a los de cruzar varios husos horarios.

¿Qué podemos hacer, entonces, para mejorar nuestro descanso? En primer lugar, respetar horarios regulares: acostarse y levantarse aproximadamente a la misma hora cada día, fines de semana incluidos. En segundo lugar, prestar atención a la exposición a la luz. La luz natural por la mañana ayuda a sincronizar nuestros ritmos internos, mientras que la luz azul de los dispositivos electrónicos a última hora del día tiene el efecto contrario. Y un detalle que muchos pacientes ignoran: el dormitorio debería estar varios grados más frío que el salón. Una temperatura entre dieciséis y diecinueve grados facilita la entrada y el mantenimiento del sueño profundo.

Por último, conviene desmitificar el uso de pastillas para dormir. Pueden ser útiles en situaciones puntuales y bajo supervisión médica, pero, como sustituto de una higiene del sueño adecuada, suelen generar más problemas que los que resuelven.

Para terminar, me gustaría dejar una reflexión: si dedicásemos a nuestro sueño la mitad de la atención que dedicamos a nuestra alimentación o a nuestra actividad física, la mejora en salud pública sería enorme. Muchas gracias.`,
    preguntas: [
      {
        q: '1. Según la conferenciante, durante el sueño el cerebro:',
        opciones: [
          'a) permanece prácticamente inactivo.',
          'b) realiza funciones importantes como consolidar la memoria.',
          'c) trabaja menos que durante el día.'
        ],
        correcta: 1,
        explicacion: 'La ponente dice: "nuestro cerebro está trabajando a pleno rendimiento: consolida la memoria, elimina residuos..." Explícitamente niega que sea pasivo o esté apagado.'
      },
      {
        q: '2. La conferenciante considera que los problemas de sueño son:',
        opciones: [
          'a) exclusivos de personas mayores.',
          'b) un factor de riesgo poco reconocido para la salud.',
          'c) un problema únicamente estético.'
        ],
        correcta: 1,
        explicacion: '"Uno de los factores de riesgo más subestimados de nuestra época". No son exclusivos de mayores ni un asunto estético.'
      },
      {
        q: '3. Respecto a recuperar el sueño los fines de semana, la ponente afirma que:',
        opciones: [
          'a) es un método eficaz para compensar la falta de descanso.',
          'b) funciona igual que saldar una deuda bancaria.',
          'c) no compensa completamente la pérdida y puede desregular el organismo.'
        ],
        correcta: 2,
        explicacion: 'Señala que "la deuda de sueño no funciona como una deuda bancaria" y que alternar horarios dispares provoca "jet lag social". Descarta frontalmente a) y b).'
      },
      {
        q: '4. Una de las recomendaciones para mejorar el descanso es:',
        opciones: [
          'a) mantener horarios regulares también en fin de semana.',
          'b) usar pantallas antes de dormir para relajarse.',
          'c) aumentar la temperatura del dormitorio.'
        ],
        correcta: 0,
        explicacion: 'Recomienda "acostarse y levantarse aproximadamente a la misma hora cada día, fines de semana incluidos". Las pantallas y el calor excesivo son precisamente lo contrario de lo que aconseja.'
      },
      {
        q: '5. Sobre la temperatura ideal del dormitorio, la ponente sostiene que:',
        opciones: [
          'a) debe ser la misma que la del resto de la casa.',
          'b) debería estar varios grados por debajo de la del salón.',
          'c) cuanto más alta, mejor se concilia el sueño.'
        ],
        correcta: 1,
        explicacion: '"El dormitorio debería estar varios grados más frío que el salón. Una temperatura entre dieciséis y diecinueve grados facilita el sueño profundo".'
      },
      {
        q: '6. La opinión de la conferenciante sobre los somníferos es que:',
        opciones: [
          'a) son imprescindibles para cualquier problema de insomnio.',
          'b) pueden ayudar puntualmente, pero no sustituyen una buena higiene del sueño.',
          'c) deberían prohibirse totalmente.'
        ],
        correcta: 1,
        explicacion: 'Dice que "pueden ser útiles en situaciones puntuales y bajo supervisión médica, pero como sustituto de una higiene del sueño adecuada, suelen generar más problemas". Ni imprescindibles (a) ni prohibidos (c).'
      }
    ]
  }
];

// =============================================================
// GRAMÁTICA B2
// Colección de preguntas por temas clave del nivel. Cada entrada:
// { tema, q, opciones:[a,b,c], correcta:idx, explicacion }
// =============================================================

window.DELE_DATA.grammar = [
  // --- Subjuntivo (presente / imperfecto / perfecto / pluscuamperfecto)
  {
    tema: 'Subjuntivo',
    q: 'Me alegra mucho que ______ antes de la tormenta.',
    opciones: ['a) llegaste', 'b) has llegado', 'c) hayas llegado'],
    correcta: 2,
    explicacion: '"Alegrarse" expresa sentimiento y exige subjuntivo. Como la llegada es reciente y sigue viva en el presente, se usa pretérito perfecto de subjuntivo: "hayas llegado".'
  },
  {
    tema: 'Subjuntivo',
    q: 'No creo que Ana ______ la verdad el otro día.',
    opciones: ['a) dijera', 'b) dijo', 'c) diga'],
    correcta: 0,
    explicacion: 'Con "no creo que" (opinión negada) se usa subjuntivo. La referencia temporal "el otro día" exige imperfecto de subjuntivo: "dijera".'
  },
  {
    tema: 'Subjuntivo',
    q: 'Cuando ______ a Madrid, avísame y nos vemos.',
    opciones: ['a) vienes', 'b) vengas', 'c) vinieras'],
    correcta: 1,
    explicacion: '"Cuando" con valor de futuro exige presente de subjuntivo: "cuando vengas".'
  },
  {
    tema: 'Subjuntivo',
    q: 'Si ______ más temprano, habríamos cogido el tren.',
    opciones: ['a) hubiéramos salido', 'b) saliéramos', 'c) salimos'],
    correcta: 0,
    explicacion: 'Condicional irreal del pasado: "si hubiéramos salido, habríamos cogido". El par es pluscuamperfecto de subjuntivo + condicional compuesto.'
  },
  {
    tema: 'Subjuntivo',
    q: 'Busco un piso que ______ terraza y ascensor.',
    opciones: ['a) tiene', 'b) tenga', 'c) tendría'],
    correcta: 1,
    explicacion: 'Antecedente no específico (un piso cualquiera, todavía no encontrado): subjuntivo "tenga". Si ya lo hubiera visto, sería indicativo "tiene".'
  },
  {
    tema: 'Subjuntivo',
    q: 'Aunque ______ mucho, iremos a la excursión.',
    opciones: ['a) llueva', 'b) llueve', 'c) llovería'],
    correcta: 0,
    explicacion: 'Con "aunque" hipotético/futuro se emplea subjuntivo: "aunque llueva" (aunque exista la posibilidad de que llueva).'
  },
  // --- Indicativo vs subjuntivo (contrastes)
  {
    tema: 'Indicativo vs subjuntivo',
    q: 'Estoy segura de que mañana ______ a tiempo.',
    opciones: ['a) llegará', 'b) llegue', 'c) llegaría'],
    correcta: 0,
    explicacion: '"Estar seguro de que" expresa certeza afirmativa → indicativo futuro: "llegará".'
  },
  {
    tema: 'Indicativo vs subjuntivo',
    q: 'Es probable que no ______ la película que buscas.',
    opciones: ['a) encuentras', 'b) encuentres', 'c) encontrarás'],
    correcta: 1,
    explicacion: '"Es probable que" expresa probabilidad/duda y requiere subjuntivo: "encuentres".'
  },
  {
    tema: 'Indicativo vs subjuntivo',
    q: 'Me dijo que ______ al médico cuanto antes.',
    opciones: ['a) fui', 'b) fuera', 'c) vaya'],
    correcta: 1,
    explicacion: 'Estilo indirecto con verbo de mandato en pasado: "me dijo que fuera". Si el verbo introductorio fuera presente ("me dice que"), sería "vaya".'
  },
  {
    tema: 'Indicativo vs subjuntivo',
    q: 'Por mucho que ______, no te creeré.',
    opciones: ['a) insistes', 'b) insistas', 'c) insistieras'],
    correcta: 1,
    explicacion: '"Por mucho que" + subjuntivo (presente) en contexto general/futuro: "insistas".'
  },
  // --- Por / Para
  {
    tema: 'Por / Para',
    q: 'Este regalo es ______ mi madre, pero lo compré ______ mi hermana.',
    opciones: ['a) por / para', 'b) para / por', 'c) para / para'],
    correcta: 1,
    explicacion: '"Para mi madre" = destinatario. "Por mi hermana" = en lugar de ella (fue ella quien me pidió comprarlo).'
  },
  {
    tema: 'Por / Para',
    q: 'Hemos paseado ______ el parque durante dos horas.',
    opciones: ['a) por', 'b) para', 'c) en'],
    correcta: 0,
    explicacion: '"Por el parque" indica movimiento a través de un lugar. "Para el parque" significaría dirección o destino final.'
  },
  {
    tema: 'Por / Para',
    q: 'El informe debe estar terminado ______ el viernes.',
    opciones: ['a) por', 'b) para', 'c) hasta'],
    correcta: 1,
    explicacion: '"Para el viernes" = fecha límite. "Por el viernes" expresaría aproximación ("alrededor del viernes"). "Hasta" no se usa con plazo cerrado así.'
  },
  {
    tema: 'Por / Para',
    q: '______ mí, la mejor solución es dejarlo así.',
    opciones: ['a) Por', 'b) Para', 'c) Según'],
    correcta: 1,
    explicacion: '"Para mí" = opinión personal. "Por mí" significaría "a mí no me importa". "Según mí" no existe en español (sería "según yo").'
  },
  // --- Ser / Estar
  {
    tema: 'Ser / Estar',
    q: 'La reunión ______ en la sala grande, pero el jefe todavía no ______ allí.',
    opciones: ['a) está / es', 'b) es / está', 'c) es / es'],
    correcta: 1,
    explicacion: 'Con eventos (la reunión) se usa "ser" (tiene lugar). Con ubicación de personas u objetos, "estar": "el jefe está allí".'
  },
  {
    tema: 'Ser / Estar',
    q: 'Hace mucho que no te veo, ¡______ muy cambiada!',
    opciones: ['a) eres', 'b) estás', 'c) fuiste'],
    correcta: 1,
    explicacion: 'Con un cambio respecto a un estado anterior, se usa "estar": "estás cambiada". "Eres cambiada" no es natural en español.'
  },
  {
    tema: 'Ser / Estar',
    q: 'Esta sopa ______ muy rica, felicita a quien la haya hecho.',
    opciones: ['a) es', 'b) está', 'c) resulta'],
    correcta: 1,
    explicacion: 'Valoración concreta de un plato ahora probado: "está rica" (opinión puntual). "Es rica" sería descripción objetiva general.'
  },
  // --- Perífrasis verbales
  {
    tema: 'Perífrasis',
    q: 'Llevo ______ español desde hace cinco años.',
    opciones: ['a) a estudiar', 'b) estudiar', 'c) estudiando'],
    correcta: 2,
    explicacion: '"Llevar + gerundio" expresa continuidad: "llevo estudiando".'
  },
  {
    tema: 'Perífrasis',
    q: 'Acabo ______ recibir tu mensaje, ahora te contesto.',
    opciones: ['a) a', 'b) de', 'c) por'],
    correcta: 1,
    explicacion: '"Acabar de + infinitivo" = acción recién concluida. "Acabar por" significaría "terminar haciendo algo".'
  },
  {
    tema: 'Perífrasis',
    q: 'Tengo ______ terminar este informe antes de las seis.',
    opciones: ['a) a', 'b) que', 'c) de'],
    correcta: 1,
    explicacion: '"Tener que + infinitivo" expresa obligación concreta: "tengo que terminar".'
  },
  // --- Voz pasiva y pasiva refleja
  {
    tema: 'Voz pasiva',
    q: 'La nueva ley ______ aprobada ayer en el Congreso.',
    opciones: ['a) fue', 'b) estaba', 'c) estuvo'],
    correcta: 0,
    explicacion: 'Pasiva con "ser" para expresar la acción: "fue aprobada". "Estaba/estuvo aprobada" sería pasiva de estado (resultado), pero el contexto "ayer" indica acción puntual.'
  },
  {
    tema: 'Voz pasiva',
    q: '______ café en todos los bares de la ciudad.',
    opciones: ['a) Es vendido', 'b) Se vende', 'c) Están vendiendo'],
    correcta: 1,
    explicacion: 'En español, la pasiva refleja "se vende" es mucho más natural que "es vendido" para un hecho general.'
  },
  // --- Estilo indirecto
  {
    tema: 'Estilo indirecto',
    q: 'Me dijo: "Mañana iré a verte". → Me dijo que ______ al día siguiente.',
    opciones: ['a) iba a ir', 'b) irá', 'c) habría ido'],
    correcta: 0,
    explicacion: 'Al pasar a estilo indirecto en pasado, el futuro simple pasa a condicional o a "iba a + infinitivo". "Iba a ir" es la opción correcta (expresa plan cercano).'
  },
  {
    tema: 'Estilo indirecto',
    q: 'Ella me preguntó: "¿Has comido ya?". → Ella me preguntó si ______ ya.',
    opciones: ['a) he comido', 'b) había comido', 'c) comería'],
    correcta: 1,
    explicacion: 'Pretérito perfecto → pluscuamperfecto al trasladar al estilo indirecto en pasado: "había comido".'
  },
  {
    tema: 'Estilo indirecto',
    q: 'El médico le recomendó: "Descanse más". → El médico le recomendó que ______ más.',
    opciones: ['a) descansa', 'b) descansara', 'c) descansaría'],
    correcta: 1,
    explicacion: 'Imperativo en estilo indirecto pasado pasa a imperfecto de subjuntivo: "que descansara".'
  },
  // --- Condicional simple / compuesto
  {
    tema: 'Condicional',
    q: 'Si tuviera tiempo libre, ______ a clases de pintura.',
    opciones: ['a) iré', 'b) iría', 'c) iba'],
    correcta: 1,
    explicacion: 'Condicional irreal del presente: "si + imperfecto subjuntivo (tuviera) → condicional simple (iría)".'
  },
  {
    tema: 'Condicional',
    q: 'Yo que tú, no ______ con ese coche tan viejo.',
    opciones: ['a) viajaría', 'b) viajaba', 'c) viajara'],
    correcta: 0,
    explicacion: 'Para dar consejos hipotéticos en presente: "yo que tú, no viajaría" (condicional simple).'
  },
  {
    tema: 'Condicional',
    q: 'De haberlo sabido, te ______ avisado enseguida.',
    opciones: ['a) hubiera', 'b) habría', 'c) habré'],
    correcta: 1,
    explicacion: '"De + infinitivo compuesto" equivale a una condicional irreal del pasado: "habría avisado" (condicional compuesto). También sería posible "hubiera avisado" en lengua oral, pero "habría" es la forma estándar.'
  },
  // --- Pronombres (OD/OI, leísmo, se)
  {
    tema: 'Pronombres',
    q: 'Dile a Marta que ______ llamaré mañana.',
    opciones: ['a) le', 'b) la', 'c) lo'],
    correcta: 1,
    explicacion: '"Llamar a alguien" (hablar por teléfono) es transitivo: CD femenino → "la". "Le" sería leísmo, aceptable pero no preferido en examen.'
  },
  {
    tema: 'Pronombres',
    q: 'Los libros que me pediste, ya ______ he traído.',
    opciones: ['a) los', 'b) les', 'c) te los'],
    correcta: 2,
    explicacion: 'Aparecen dos pronombres (te = CI a ti; los = CD los libros). Orden: CI + CD → "te los".'
  },
  {
    tema: 'Pronombres',
    q: 'Como no estaba Juan, el paquete ______ entregué a su hermano.',
    opciones: ['a) le', 'b) se', 'c) lo'],
    correcta: 1,
    explicacion: 'Delante de "lo/la/los/las", el pronombre "le" se transforma en "se": "se lo entregué". Aquí está el CD implícito ("el paquete") y el CI ("a su hermano").'
  },
  // --- Oraciones concesivas/causales/consecutivas
  {
    tema: 'Conectores',
    q: '______ la lluvia, seguimos adelante con la excursión.',
    opciones: ['a) Por', 'b) A pesar de', 'c) Aunque'],
    correcta: 1,
    explicacion: '"A pesar de + sustantivo/infinitivo" = concesión. "Aunque" requiere verbo conjugado ("aunque llovía").'
  },
  {
    tema: 'Conectores',
    q: 'Estudia mucho ______ aprobar el examen a la primera.',
    opciones: ['a) para que', 'b) para', 'c) por'],
    correcta: 1,
    explicacion: 'Si el sujeto es el mismo en las dos oraciones: "para + infinitivo" (ella estudia, ella quiere aprobar). "Para que" se usa con sujetos distintos: "para que apruebes".'
  },
  {
    tema: 'Conectores',
    q: 'Habló tan bajo ______ apenas lo entendimos.',
    opciones: ['a) como', 'b) que', 'c) para'],
    correcta: 1,
    explicacion: '"Tan + adj/adv + que" = oración consecutiva: "tan bajo que..."'
  },
  {
    tema: 'Conectores',
    q: 'Lo hicimos así ______ no había otra opción.',
    opciones: ['a) puesto que', 'b) para que', 'c) aunque'],
    correcta: 0,
    explicacion: '"Puesto que" = conector causal (porque). "Para que" es final y "aunque" es concesivo, que no encajan con "no había otra opción".'
  },
  // --- Verbos problemáticos
  {
    tema: 'Léxico-verbal',
    q: 'El motor del coche no ______ bien; habrá que llevarlo al taller.',
    opciones: ['a) trabaja', 'b) funciona', 'c) actúa'],
    correcta: 1,
    explicacion: 'En español los aparatos "funcionan" (no "trabajan", calco del inglés). "Actuar" implica una acción deliberada.'
  },
  {
    tema: 'Léxico-verbal',
    q: 'Me ______ cuenta de que había olvidado las llaves.',
    opciones: ['a) pensé', 'b) di', 'c) tomé'],
    correcta: 1,
    explicacion: 'La locución fija es "darse cuenta de". "Pensar cuenta" y "tomar cuenta" no existen en español con ese significado.'
  },
  {
    tema: 'Léxico-verbal',
    q: 'Llevábamos una hora ______ al autobús en la parada.',
    opciones: ['a) esperando', 'b) mirando', 'c) buscando'],
    correcta: 0,
    explicacion: '"Esperar el autobús" es la expresión habitual. "Mirar" sería observar (algo distinto) y "buscar" implicaría no saber dónde está.'
  },
  // --- Preposiciones / régimen
  {
    tema: 'Preposiciones',
    q: 'Se acordó ______ mí al ver la fotografía antigua.',
    opciones: ['a) a', 'b) de', 'c) con'],
    correcta: 1,
    explicacion: '"Acordarse de" (régimen preposicional fijo). No debe confundirse con "recordar", que es transitivo y no lleva preposición.'
  },
  {
    tema: 'Preposiciones',
    q: 'No me voy a conformar ______ una respuesta tan vaga.',
    opciones: ['a) a', 'b) con', 'c) de'],
    correcta: 1,
    explicacion: '"Conformarse con algo" es la colocación correcta.'
  }
];

// =============================================================
// VOCABULARIO B2 - Flashcards temáticas
// Estructura: { categoria, palabra, tipo, traduccion, ejemplo }
// La traducción incluye inglés para referencia rápida.
// =============================================================

window.DELE_DATA.vocab = [
  // --- Trabajo y economía
  { categoria: 'Trabajo', palabra: 'el despido', tipo: 'sustantivo', traduccion: 'dismissal / layoff', ejemplo: 'Tras el ERE, se anunciaron más de cien despidos en la empresa.' },
  { categoria: 'Trabajo', palabra: 'la plantilla', tipo: 'sustantivo', traduccion: 'workforce / staff', ejemplo: 'La plantilla de la fábrica se ha reducido un 30 %.' },
  { categoria: 'Trabajo', palabra: 'autónomo/a', tipo: 'adj./sust.', traduccion: 'self-employed', ejemplo: 'Trabaja como autónomo desde que dejó la empresa.' },
  { categoria: 'Trabajo', palabra: 'ascender', tipo: 'verbo', traduccion: 'to be promoted', ejemplo: 'La han ascendido a jefa de departamento.' },
  { categoria: 'Trabajo', palabra: 'el sueldo bruto', tipo: 'sustantivo', traduccion: 'gross salary', ejemplo: 'El sueldo bruto es lo que cobras antes de impuestos.' },
  { categoria: 'Trabajo', palabra: 'la jornada laboral', tipo: 'sustantivo', traduccion: 'working day', ejemplo: 'Muchas empresas han reducido la jornada laboral a 35 horas.' },
  { categoria: 'Trabajo', palabra: 'la baja por maternidad', tipo: 'sustantivo', traduccion: 'maternity leave', ejemplo: 'Volverá al trabajo cuando termine la baja por maternidad.' },
  { categoria: 'Trabajo', palabra: 'emprender', tipo: 'verbo', traduccion: 'to start a business', ejemplo: 'Muchos jóvenes quieren emprender su propio negocio.' },

  // --- Medio ambiente
  { categoria: 'Medio ambiente', palabra: 'el calentamiento global', tipo: 'sustantivo', traduccion: 'global warming', ejemplo: 'El calentamiento global provoca sequías más intensas.' },
  { categoria: 'Medio ambiente', palabra: 'reciclar', tipo: 'verbo', traduccion: 'to recycle', ejemplo: 'Es importante reciclar el vidrio y el plástico por separado.' },
  { categoria: 'Medio ambiente', palabra: 'la huella de carbono', tipo: 'sustantivo', traduccion: 'carbon footprint', ejemplo: 'Reducir la huella de carbono implica consumir productos locales.' },
  { categoria: 'Medio ambiente', palabra: 'sostenible', tipo: 'adjetivo', traduccion: 'sustainable', ejemplo: 'Buscamos un modelo de turismo más sostenible.' },
  { categoria: 'Medio ambiente', palabra: 'la deforestación', tipo: 'sustantivo', traduccion: 'deforestation', ejemplo: 'La deforestación del Amazonas preocupa a los científicos.' },
  { categoria: 'Medio ambiente', palabra: 'los residuos', tipo: 'sustantivo', traduccion: 'waste / rubbish', ejemplo: 'La ciudad tiene que gestionar millones de toneladas de residuos cada año.' },
  { categoria: 'Medio ambiente', palabra: 'el vertedero', tipo: 'sustantivo', traduccion: 'landfill', ejemplo: 'Muchas basuras acaban en vertederos ilegales.' },
  { categoria: 'Medio ambiente', palabra: 'concienciar', tipo: 'verbo', traduccion: 'to raise awareness', ejemplo: 'La campaña busca concienciar sobre el consumo responsable.' },

  // --- Tecnología y medios
  { categoria: 'Tecnología', palabra: 'la nube', tipo: 'sustantivo', traduccion: 'the cloud', ejemplo: 'Guarda los archivos en la nube para acceder desde cualquier sitio.' },
  { categoria: 'Tecnología', palabra: 'descargar', tipo: 'verbo', traduccion: 'to download', ejemplo: 'He descargado la aplicación, pero todavía no la he probado.' },
  { categoria: 'Tecnología', palabra: 'el buscador', tipo: 'sustantivo', traduccion: 'search engine', ejemplo: 'Google es el buscador más utilizado en el mundo.' },
  { categoria: 'Tecnología', palabra: 'la red social', tipo: 'sustantivo', traduccion: 'social network', ejemplo: 'Muchos adolescentes pasan horas en las redes sociales.' },
  { categoria: 'Tecnología', palabra: 'el ciberacoso', tipo: 'sustantivo', traduccion: 'cyberbullying', ejemplo: 'El ciberacoso afecta cada vez a más menores.' },
  { categoria: 'Tecnología', palabra: 'la brecha digital', tipo: 'sustantivo', traduccion: 'digital divide', ejemplo: 'Los mayores sufren especialmente la brecha digital.' },
  { categoria: 'Tecnología', palabra: 'el fake news', tipo: 'sustantivo', traduccion: 'fake news', ejemplo: 'Las fake news se propagan muy rápido por internet.' },

  // --- Salud y bienestar
  { categoria: 'Salud', palabra: 'el insomnio', tipo: 'sustantivo', traduccion: 'insomnia', ejemplo: 'El insomnio crónico puede provocar problemas cardiovasculares.' },
  { categoria: 'Salud', palabra: 'el estrés', tipo: 'sustantivo', traduccion: 'stress', ejemplo: 'El exceso de trabajo le provoca mucho estrés.' },
  { categoria: 'Salud', palabra: 'hacer dieta', tipo: 'locución', traduccion: 'to be on a diet', ejemplo: 'Hace dieta desde hace dos meses y ya ha perdido cinco kilos.' },
  { categoria: 'Salud', palabra: 'recuperarse', tipo: 'verbo', traduccion: 'to recover', ejemplo: 'Tardó varias semanas en recuperarse de la operación.' },
  { categoria: 'Salud', palabra: 'la receta médica', tipo: 'sustantivo', traduccion: 'prescription', ejemplo: 'Este medicamento solo se vende con receta médica.' },
  { categoria: 'Salud', palabra: 'la seguridad social', tipo: 'sustantivo', traduccion: 'social security/healthcare', ejemplo: 'La operación está cubierta por la seguridad social.' },
  { categoria: 'Salud', palabra: 'sedentario/a', tipo: 'adjetivo', traduccion: 'sedentary', ejemplo: 'Un estilo de vida sedentario aumenta el riesgo de obesidad.' },

  // --- Educación
  { categoria: 'Educación', palabra: 'la beca', tipo: 'sustantivo', traduccion: 'scholarship', ejemplo: 'Sin esa beca no habría podido estudiar fuera.' },
  { categoria: 'Educación', palabra: 'aprobar / suspender', tipo: 'verbo', traduccion: 'to pass / fail', ejemplo: 'Aprobó todas las asignaturas salvo Matemáticas, que suspendió.' },
  { categoria: 'Educación', palabra: 'la matrícula', tipo: 'sustantivo', traduccion: 'enrolment / tuition fee', ejemplo: 'La matrícula universitaria subió un 10 % este curso.' },
  { categoria: 'Educación', palabra: 'la formación continua', tipo: 'sustantivo', traduccion: 'lifelong learning', ejemplo: 'La formación continua es clave en el mundo profesional actual.' },
  { categoria: 'Educación', palabra: 'el profesorado', tipo: 'sustantivo', traduccion: 'teaching staff', ejemplo: 'El profesorado del centro ha convocado una huelga.' },
  { categoria: 'Educación', palabra: 'el fracaso escolar', tipo: 'sustantivo', traduccion: 'school dropout', ejemplo: 'España tiene una de las tasas de fracaso escolar más altas de Europa.' },

  // --- Cultura y ocio
  { categoria: 'Cultura', palabra: 'el estreno', tipo: 'sustantivo', traduccion: 'premiere / opening', ejemplo: 'Hay mucha expectación por el estreno de la película.' },
  { categoria: 'Cultura', palabra: 'la taquilla', tipo: 'sustantivo', traduccion: 'box office', ejemplo: 'La taquilla del teatro abre a las seis de la tarde.' },
  { categoria: 'Cultura', palabra: 'el guion', tipo: 'sustantivo', traduccion: 'script / screenplay', ejemplo: 'El guion es lo mejor de toda la serie.' },
  { categoria: 'Cultura', palabra: 'una obra de teatro', tipo: 'sustantivo', traduccion: 'a play', ejemplo: 'Vimos una obra de teatro muy divertida en el Lara.' },
  { categoria: 'Cultura', palabra: 'una exposición', tipo: 'sustantivo', traduccion: 'an exhibition', ejemplo: 'Hay una exposición de Picasso en el Reina Sofía.' },
  { categoria: 'Cultura', palabra: 'el patrimonio', tipo: 'sustantivo', traduccion: 'heritage', ejemplo: 'La Alhambra forma parte del patrimonio mundial.' },

  // --- Relaciones y sociedad
  { categoria: 'Sociedad', palabra: 'llevarse bien/mal', tipo: 'locución', traduccion: 'to get along well/badly', ejemplo: 'Los dos hermanos se llevan muy bien.' },
  { categoria: 'Sociedad', palabra: 'comprometerse', tipo: 'verbo', traduccion: 'to commit / get engaged', ejemplo: 'Se comprometieron el año pasado y se casan en junio.' },
  { categoria: 'Sociedad', palabra: 'la brecha salarial', tipo: 'sustantivo', traduccion: 'wage gap', ejemplo: 'La brecha salarial entre hombres y mujeres aún persiste.' },
  { categoria: 'Sociedad', palabra: 'la convivencia', tipo: 'sustantivo', traduccion: 'coexistence / living together', ejemplo: 'La convivencia con los vecinos es muy buena.' },
  { categoria: 'Sociedad', palabra: 'el envejecimiento', tipo: 'sustantivo', traduccion: 'ageing', ejemplo: 'El envejecimiento de la población es un reto para la sanidad.' },
  { categoria: 'Sociedad', palabra: 'la solidaridad', tipo: 'sustantivo', traduccion: 'solidarity', ejemplo: 'Los vecinos dieron muestras de solidaridad tras las inundaciones.' },
  { categoria: 'Sociedad', palabra: 'discriminar', tipo: 'verbo', traduccion: 'to discriminate', ejemplo: 'Ninguna ley permite discriminar por razón de sexo.' },

  // --- Adjetivos útiles B2
  { categoria: 'Adjetivos útiles', palabra: 'asequible', tipo: 'adjetivo', traduccion: 'affordable', ejemplo: 'Buscamos un alquiler asequible cerca del centro.' },
  { categoria: 'Adjetivos útiles', palabra: 'fiable', tipo: 'adjetivo', traduccion: 'reliable', ejemplo: 'Es una fuente de información muy fiable.' },
  { categoria: 'Adjetivos útiles', palabra: 'polémico/a', tipo: 'adjetivo', traduccion: 'controversial', ejemplo: 'La nueva ley es bastante polémica.' },
  { categoria: 'Adjetivos útiles', palabra: 'imprescindible', tipo: 'adjetivo', traduccion: 'essential', ejemplo: 'Es imprescindible tener DNI para hacer ese trámite.' },
  { categoria: 'Adjetivos útiles', palabra: 'exigente', tipo: 'adjetivo', traduccion: 'demanding', ejemplo: 'Es una profesora muy exigente con sus alumnos.' },
  { categoria: 'Adjetivos útiles', palabra: 'acogedor/a', tipo: 'adjetivo', traduccion: 'cosy / welcoming', ejemplo: 'El salón es pequeño pero muy acogedor.' },
  { categoria: 'Adjetivos útiles', palabra: 'rentable', tipo: 'adjetivo', traduccion: 'profitable', ejemplo: 'El negocio empieza a ser rentable tras dos años.' },
  { categoria: 'Adjetivos útiles', palabra: 'escaso/a', tipo: 'adjetivo', traduccion: 'scarce', ejemplo: 'Las plazas son escasas, así que hay que reservar pronto.' }
];

// =============================================================
// EXPRESIONES Y MODISMOS B2
// Estructura: { expresion, significado, ejemplo }
// =============================================================

window.DELE_DATA.idioms = [
  { expresion: 'Estar al loro', significado: 'Estar atento, enterado de lo que pasa.', ejemplo: 'Está al loro de todas las noticias deportivas.' },
  { expresion: 'Tomar el pelo (a alguien)', significado: 'Burlarse o bromear sin mala intención.', ejemplo: '¿Me estás tomando el pelo o lo dices en serio?' },
  { expresion: 'Dar en el clavo', significado: 'Acertar exactamente.', ejemplo: 'Con ese comentario diste en el clavo.' },
  { expresion: 'Echar una mano', significado: 'Ayudar puntualmente.', ejemplo: '¿Me echas una mano con esta maleta?' },
  { expresion: 'Estar como un flan', significado: 'Estar muy nervioso.', ejemplo: 'Antes del examen oral estaba como un flan.' },
  { expresion: 'No pegar ojo', significado: 'No conseguir dormir nada.', ejemplo: 'Con los ruidos de la calle no pegué ojo en toda la noche.' },
  { expresion: 'Ser pan comido', significado: 'Ser muy fácil.', ejemplo: 'El ejercicio fue pan comido: lo acabé en cinco minutos.' },
  { expresion: 'Meter la pata', significado: 'Decir o hacer algo inoportuno.', ejemplo: 'Metí la pata preguntándole por su ex.' },
  { expresion: 'Estar hasta las narices', significado: 'Estar harto de algo/alguien.', ejemplo: 'Estoy hasta las narices del ruido de la obra.' },
  { expresion: 'Hablar por los codos', significado: 'Hablar mucho y sin parar.', ejemplo: 'Mi tía habla por los codos en las cenas familiares.' },
  { expresion: 'Quedarse de piedra', significado: 'Quedarse atónito/sorprendido.', ejemplo: 'Me quedé de piedra al conocer la noticia.' },
  { expresion: 'Ir al grano', significado: 'Hablar directamente, sin rodeos.', ejemplo: 'Déjate de preámbulos y ve al grano.' },
  { expresion: 'Costar un ojo de la cara', significado: 'Ser muy caro.', ejemplo: 'Ese coche cuesta un ojo de la cara.' },
  { expresion: 'Tirar la toalla', significado: 'Rendirse, abandonar.', ejemplo: 'Después de tres intentos, no pienso tirar la toalla ahora.' },
  { expresion: 'No tener pelos en la lengua', significado: 'Decir lo que se piensa sin filtros.', ejemplo: 'Mi abuela no tiene pelos en la lengua: dice lo que opina sin más.' },
  { expresion: 'Ser uña y carne', significado: 'Ser muy amigos, inseparables.', ejemplo: 'Lucía y Marta son uña y carne desde el instituto.' },
  { expresion: 'Dar la lata', significado: 'Molestar, insistir.', ejemplo: 'Deja de dar la lata y espera tu turno.' },
  { expresion: 'Importar un pimiento', significado: 'No importar en absoluto.', ejemplo: 'Lo que diga la vecina me importa un pimiento.' },
  { expresion: 'Poner los puntos sobre las íes', significado: 'Dejar las cosas claras.', ejemplo: 'Voy a poner los puntos sobre las íes antes de seguir trabajando con ellos.' },
  { expresion: 'Coger el toro por los cuernos', significado: 'Afrontar un problema con decisión.', ejemplo: 'Es hora de coger el toro por los cuernos y hablar con el jefe.' },
  { expresion: 'Hacer la vista gorda', significado: 'Fingir no ver algo indebido.', ejemplo: 'El profesor hizo la vista gorda cuando llegó tarde.' },
  { expresion: 'En un abrir y cerrar de ojos', significado: 'En muy poco tiempo.', ejemplo: 'Preparó la comida en un abrir y cerrar de ojos.' },
  { expresion: 'Llover a cántaros', significado: 'Llover muchísimo.', ejemplo: 'No salgas ahora, está lloviendo a cántaros.' },
  { expresion: 'Estar en las nubes', significado: 'Estar distraído.', ejemplo: 'Perdona, estaba en las nubes. ¿Qué decías?' },
  { expresion: 'Buscar una aguja en un pajar', significado: 'Buscar algo casi imposible.', ejemplo: 'Encontrar esas llaves en esta playa es como buscar una aguja en un pajar.' },
  { expresion: 'Ponerse las pilas', significado: 'Empezar a esforzarse.', ejemplo: 'Si quieres aprobar, tendrás que ponerte las pilas.' },
  { expresion: 'No dar pie con bola', significado: 'No hacer nada bien.', ejemplo: 'Hoy no doy pie con bola: todo me sale mal.' },
  { expresion: 'Estar en la luna', significado: 'Estar despistado.', ejemplo: 'Mi hijo estaba en la luna durante toda la clase.' },
  { expresion: 'Valer la pena', significado: 'Merecer el esfuerzo.', ejemplo: 'Visitar Granada merece la pena aunque haga calor.' },
  { expresion: 'Pagar los platos rotos', significado: 'Sufrir las consecuencias de algo que hizo otro.', ejemplo: 'Siempre acabo pagando yo los platos rotos.' }
];

// =============================================================
// CONECTORES DISCURSIVOS B2
// Estructura: { conector, funcion, ejemplo }
// Organizados por función, como suelen pedir en la tarea escrita.
// =============================================================

window.DELE_DATA.connectors = [
  // Adición / continuación
  { conector: 'además', funcion: 'Adición', ejemplo: 'El piso es grande y, además, tiene terraza.' },
  { conector: 'asimismo', funcion: 'Adición (formal)', ejemplo: 'La empresa innova y, asimismo, cuida a sus empleados.' },
  { conector: 'por otra parte', funcion: 'Adición (otro aspecto)', ejemplo: 'Por otra parte, conviene recordar los riesgos.' },
  { conector: 'no solo... sino también', funcion: 'Adición enfática', ejemplo: 'No solo habla español, sino también francés.' },
  // Contraste
  { conector: 'sin embargo', funcion: 'Contraste', ejemplo: 'Hace frío; sin embargo, iremos de excursión.' },
  { conector: 'no obstante', funcion: 'Contraste (formal)', ejemplo: 'Es caro; no obstante, vale la pena.' },
  { conector: 'en cambio', funcion: 'Contraste entre dos elementos', ejemplo: 'Ana es tímida; en cambio, Lucas es extrovertido.' },
  { conector: 'por el contrario', funcion: 'Contraste fuerte', ejemplo: 'Lejos de ayudar, por el contrario, empeoró la situación.' },
  { conector: 'a pesar de (que)', funcion: 'Concesión', ejemplo: 'A pesar de la lluvia, salimos a correr.' },
  // Causa
  { conector: 'porque', funcion: 'Causa (neutra)', ejemplo: 'Llegué tarde porque había mucho tráfico.' },
  { conector: 'ya que / puesto que', funcion: 'Causa (formal)', ejemplo: 'No insistiré, puesto que ya has dicho que no.' },
  { conector: 'debido a', funcion: 'Causa + sustantivo', ejemplo: 'Debido a la huelga, se cerró el metro.' },
  { conector: 'gracias a', funcion: 'Causa positiva', ejemplo: 'Aprobé gracias a tu ayuda.' },
  // Consecuencia
  { conector: 'por lo tanto', funcion: 'Consecuencia', ejemplo: 'No estudiaste; por lo tanto, suspendiste.' },
  { conector: 'por consiguiente', funcion: 'Consecuencia (formal)', ejemplo: 'El informe está incompleto; por consiguiente, se devuelve.' },
  { conector: 'así que', funcion: 'Consecuencia (coloquial)', ejemplo: 'Tenía prisa, así que cogí un taxi.' },
  { conector: 'de ahí que + subj.', funcion: 'Consecuencia', ejemplo: 'No lo avisaron; de ahí que se enfadara.' },
  // Finalidad
  { conector: 'para (que)', funcion: 'Finalidad', ejemplo: 'Te llamo para que me ayudes con la mudanza.' },
  { conector: 'con el fin de', funcion: 'Finalidad (formal)', ejemplo: 'Recogemos firmas con el fin de presentar una queja.' },
  { conector: 'a fin de que', funcion: 'Finalidad (formal)', ejemplo: 'Se reforzará el personal a fin de que mejore la atención.' },
  // Ejemplificación
  { conector: 'por ejemplo', funcion: 'Ejemplificar', ejemplo: 'Hay muchas frutas locales; por ejemplo, las naranjas valencianas.' },
  { conector: 'en concreto / concretamente', funcion: 'Especificar', ejemplo: 'Visitamos varias ciudades, en concreto Lisboa y Oporto.' },
  // Orden
  { conector: 'en primer lugar... en segundo lugar', funcion: 'Ordenar', ejemplo: 'En primer lugar, lea el enunciado; en segundo lugar, conteste.' },
  { conector: 'por un lado... por otro', funcion: 'Estructurar contraste', ejemplo: 'Por un lado, me apetece; por otro, estoy cansada.' },
  // Conclusión
  { conector: 'en conclusión', funcion: 'Cerrar argumentación', ejemplo: 'En conclusión, conviene reflexionar antes de decidir.' },
  { conector: 'en definitiva', funcion: 'Resumir', ejemplo: 'En definitiva, la solución no es fácil pero es necesaria.' },
  { conector: 'para terminar / finalmente', funcion: 'Cerrar', ejemplo: 'Para terminar, quisiera dar las gracias a todos.' },
  // Reformulación
  { conector: 'es decir', funcion: 'Reformular', ejemplo: 'Se trata de un bien inmueble, es decir, una propiedad.' },
  { conector: 'o sea', funcion: 'Reformular (coloquial)', ejemplo: 'Iremos en tren, o sea, sin coche.' }
];

// =============================================================
// EXPRESIÓN ESCRITA - TAREA 1 (carta formal)
// Formato oficial: redactar una carta formal (queja, reclamación,
// solicitud) de 150-180 palabras a partir de un estímulo.
// =============================================================

window.DELE_DATA.writing.tarea1 = [
  {
    id: 'w1-queja-hotel',
    titulo: 'Carta de queja a un hotel',
    instrucciones: 'Durante sus vacaciones en un hotel, ha tenido varios problemas. Escriba una carta al director del establecimiento quejándose y pidiendo una compensación. Extensión: 150-180 palabras.',
    estimulo: `Querido cliente: Agradecemos su estancia en el Hotel Playa Azul. Para cualquier incidencia, por favor contacte con dirección.

Usted ha tomado notas durante su estancia:
- Habitación no era la contratada (prometieron vistas al mar, dieron patio interior)
- Aire acondicionado averiado durante tres noches
- Personal poco amable en recepción
- Piscina cerrada por mantenimiento sin aviso previo
- Desayuno limitado pese a lo anunciado en la web`,
    checklist: [
      'Saludo formal: "Estimado/a señor/a director/a:"',
      'Párrafo 1: presentación y motivo (fechas, tipo de habitación, reserva)',
      'Párrafo 2: exposición clara de los problemas (use conectores: "en primer lugar... además... por otro lado")',
      'Párrafo 3: petición concreta de compensación (devolución, bono, estancia gratuita)',
      'Despedida formal: "Atentamente" + nombre',
      'Extensión: 150-180 palabras',
      'Registro formal (nada de "hola", nada de tuteo)',
      'Conectores de causa-consecuencia al explicar daños'
    ],
    modelo: `Estimado señor director:

Le escribo en relación con mi estancia en su hotel del 12 al 19 de julio, con número de reserva 4578. Lamento decirle que la experiencia ha distado mucho de lo ofrecido en su página web.

En primer lugar, la habitación asignada no era la contratada: pagué por una con vistas al mar y me entregaron una que daba a un patio interior. Además, el aire acondicionado estuvo averiado durante tres noches consecutivas, a pesar de que avisé en recepción. Por otra parte, el personal se mostró poco amable cuando intenté reclamar.

A todo lo anterior se sumó que la piscina permaneció cerrada por mantenimiento sin aviso previo y que el desayuno, anunciado como "bufé libre", se limitaba a pan y café.

Por los motivos expuestos, solicito una compensación económica proporcional a los inconvenientes sufridos, así como una disculpa por escrito. En caso contrario, me veré obligada a acudir a la oficina de consumo.

A la espera de su respuesta, reciba un atento saludo,

Lourdes Martínez`
  },
  {
    id: 'w1-solicitud-beca',
    titulo: 'Solicitud de beca a una institución',
    instrucciones: 'Ha visto un anuncio de becas para cursos de posgrado. Escriba una carta al coordinador pidiendo información y mostrando su interés. Extensión: 150-180 palabras.',
    estimulo: `Fundación Horizonte Cultural
Convocatoria de becas 2025 para posgrados en el extranjero.
Plazo de presentación: 15 de abril.
Requisitos: graduado universitario, nivel B2 en el idioma del país, proyecto académico.
Dotación: hasta 18.000 € por curso.

Puntos a cubrir en la carta:
- Presentarse y explicar formación académica
- Indicar qué posgrado le interesa y dónde
- Solicitar información concreta (fecha entrega, requisitos adicionales)
- Expresar motivación e interés`,
    checklist: [
      'Saludo: "Estimados señores:" (si no se sabe el destinatario)',
      'Párrafo 1: presentación personal + título universitario + cómo se ha enterado',
      'Párrafo 2: proyecto académico o posgrado al que se quiere optar',
      'Párrafo 3: petición concreta de información',
      'Cierre con agradecimiento y "Atentamente" / "Reciban un cordial saludo"',
      'Registro formal, verbos de cortesía (quisiera, me gustaría, agradecería)',
      'Extensión 150-180 palabras'
    ],
    modelo: `Estimados señores:

Me dirijo a ustedes tras haber visto anunciada en su página web la convocatoria de becas de posgrado para el curso 2025. Soy licenciada en Filología Hispánica por la Universidad de Valencia, con una nota media de 8,4, y poseo un nivel certificado de inglés C1.

Estoy especialmente interesada en cursar el Máster en Literatura Comparada de la Universidad de Edimburgo, cuyo programa se ajusta perfectamente a la línea de investigación que deseo desarrollar sobre la recepción de la literatura hispanoamericana en Europa.

Por este motivo, quisiera solicitarles información adicional sobre el proceso de candidatura: en concreto, agradecería que me indicaran si la carta de motivación debe redactarse en inglés o también se admite en español, y si el proyecto académico debe entregarse en un formato específico.

Asimismo, les rogaría que me confirmaran la fecha exacta en que se publicará la resolución provisional.

Quedo a su disposición para cualquier documentación adicional.

Atentamente,

Ana García Pérez`
  }
];

