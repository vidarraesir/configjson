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


