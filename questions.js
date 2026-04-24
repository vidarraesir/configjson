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
