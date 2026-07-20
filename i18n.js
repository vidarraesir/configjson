// =============================================================
// DELE B2 - Sistema de idiomas (interfaz español / ucraniano).
// La INTERFAZ se traduce; el CONTENIDO de estudio (preguntas,
// textos, vocabulario español) permanece en español.
// =============================================================

window.I18N = {
  es: {
    // Cabecera
    btn_theme: 'Cambiar tema',
    btn_reset: 'Reiniciar progreso',
    btn_lang: 'Мова / Idioma',
    // Hero
    hero_title: '¡Hola! Prepara tu DELE B2',
    hero_desc: 'Preguntas tipo examen, vocabulario y verbos con traducción al ucraniano, tiempos verbales explicados y simulacros según el modelo oficial del Instituto Cervantes.',
    hero_love: 'Te quiero Yana, tú puedes.',
    stat_answered: 'Respondidas',
    stat_accuracy: 'Aciertos',
    stat_streak: 'Racha (días)',
    // Cuenta atrás
    cd_days_label: 'días para el DELE B2 · 16 de octubre',
    cd_weeks_sub: '≈ {n} semanas · ¡tú puedes, Yana!',
    cd_one_label: 'día para el DELE B2 · ¡mañana es el examen!',
    cd_one_sub: 'Descansa bien esta noche 💪',
    cd_today_num: '¡Hoy!',
    cd_today_label: 'Es el día del DELE B2',
    cd_today_sub: '¡Mucha suerte, Yana! 🍀',
    cd_past_label: 'El examen ya pasó',
    cd_past_sub: '¡Esperamos que lo aprobaras!',
    cd_loading: 'Cargando cuenta atrás…',
    // Meta diaria
    goal_done: '¡Meta diaria cumplida! {n} preguntas hoy 🎉',
    goal_progress: 'Meta diaria: {n} / {g} preguntas',
    // Secciones
    sec_mock: 'Simulacro completo',
    sec_reading: 'Prueba 1 — Comprensión de lectura',
    sec_listening: 'Prueba 2 — Comprensión auditiva (5 tareas)',
    sec_verbs: 'Verbos y tiempos · Дієслова',
    sec_vocab_grammar: 'Vocabulario y gramática',
    sec_vocab_themes: 'Vocabulario por temas · Ucraniano 🇺🇦',
    sec_expression: 'Expresión',
    // Tarjetas
    card_mock_t: 'Examen completo', card_mock_d: 'Simulacro cronometrado de las 4 pruebas',
    card_quick_t: 'Quiz rápido', card_quick_d: '20 preguntas mixtas aleatorias',
    card_r1_t: 'Tarea 1', card_r1_d: 'Texto largo + opción múltiple',
    card_r2_t: 'Tarea 2', card_r2_d: 'Relacionar textos con personas',
    card_r3_t: 'Tarea 3', card_r3_d: 'Texto con huecos (frases)',
    card_r4_t: 'Tarea 4', card_r4_d: 'Gramática y léxico en contexto',
    card_a1_t: 'Mensajes cortos', card_a1_d: 'Avisos y anuncios',
    card_a2_t: '¿Quién lo dice?', card_a2_d: 'Conversación: él, ella o ninguno',
    card_a3_t: 'Entrevistas', card_a3_d: 'Preguntas sobre entrevistas',
    card_a4_t: 'Relacionar personas', card_a4_d: '6 personas, 9 enunciados',
    card_a5_t: 'Conferencia', card_a5_d: 'Monólogo expositivo',
    card_tenses_t: 'Tiempos verbales', card_tenses_d: '14 tiempos explicados con ucraniano',
    card_verbs_t: 'Verbos clave', card_verbs_d: '50 verbos con formas irregulares',
    card_verbflash_t: 'Flashcards de verbos', card_verbflash_d: 'Repaso con ucraniano',
    card_conj_t: 'Quiz de conjugación', card_conj_d: '15 preguntas de práctica',
    card_flash_t: 'Flashcards', card_flash_d: 'Vocabulario temático B2',
    card_grammar_t: 'Gramática', card_grammar_d: 'Subjuntivo, condicional, ser/estar…',
    card_idioms_t: 'Expresiones', card_idioms_d: 'Modismos y frases hechas',
    card_connectors_t: 'Conectores', card_connectors_d: 'Marcadores discursivos',
    card_articles_t: 'Vocabulario de artículos', card_articles_d: '18 listas temáticas · ucraniano',
    card_serestar_t: 'Frases: SER y ESTAR', card_serestar_d: '37 frases hechas · ucraniano',
    card_serestarquiz_t: 'Quiz: SER y ESTAR', card_serestarquiz_d: 'Adivina el significado',
    card_tener_t: 'Sinónimos de TENER', card_tener_d: 'Sube tu nivel léxico B2',
    card_tendencia_t: 'Palabra: TENDENCIA', card_tendencia_d: 'Calco frecuente + colocaciones',
    card_uaes_t: 'Quiz: ucraniano → español', card_uaes_d: 'Palabra UA, 4 opciones ES',
    card_writing_t: 'Escritura', card_writing_d: 'Prácticas de Tarea 1 y 2',
    card_speaking_t: 'Oral', card_speaking_d: 'Temas y fotos para hablar',
    card_tips_t: 'Consejos', card_tips_d: 'Estrategias de examen',
    // Pestañas
    tab_home: 'Inicio', tab_vocab: 'Vocab', tab_grammar: 'Gramática', tab_quiz: 'Quiz', tab_tips: 'Tips',
    // Chrome / botones
    back: '‹ Volver', check: 'Comprobar', next: 'Siguiente ›', prev: '‹ Anterior', shuffle: 'Mezclar',
    correct: '¡Correcto!', incorrect: 'Incorrecto.', explanation: 'Explicación: ',
    pick_first: 'Elige una opción primero.', pick_one: 'Elige una opción.',
    result_back: 'Volver al inicio', result_repeat: 'Repetir',
    res_correct: 'Aciertos', res_wrong: 'Fallos', res_total: 'Total', res_default: '¡Buen trabajo!',
    flash_hint: 'Toca la tarjeta para ver la respuesta', flash_hard: 'Difícil, repetir', flash_know: '¡La sé!',
    flash_review_hard: 'Repasar solo difíciles ({n})', flash_progress_hard: ' · difíciles: ',
    no_hard: 'No hay tarjetas marcadas como difíciles en este mazo. ¡Bien hecho!',
    afirmacion: 'Afirmación: ', ninguno: 'Ninguno de los dos', quien_dice: '  —  ¿Quién lo dice?',
    reset_confirm: '¿Reiniciar todo el progreso guardado?',
    soon: 'Esta sección estará disponible en breve.',
    // Etiquetas de tipo en el quiz mixto
    tag_reading: 'Lectura', tag_grammar: 'Gramática', tag_listening: 'Audición',
    tag_vocab: 'Vocabulario', tag_tenses: 'Tiempos', tag_lexgram: 'Léxico/Gramática',
    // Resultados
    res_l_90: '¡Excelente! Nivel sobresaliente.',
    res_l_75: '¡Muy bien! Estás lista para el examen.',
    res_l_60: 'Aprobado. Sigue practicando puntos débiles.',
    res_l_40: 'Por debajo del aprobado. Revisa las explicaciones.',
    res_l_0: 'Mucho por repasar. No te rindas, ¡es el principio!',
    time_up: '¡Tiempo agotado!',
    // Títulos de quiz
    qt_r1: 'Lectura · Tarea 1', qt_r2: 'Lectura · Tarea 2', qt_r3: 'Lectura · Tarea 3', qt_r4: 'Lectura · Tarea 4',
    qt_a1: 'Audición · Tarea 1 (mensajes cortos)', qt_a2: 'Audición · Tarea 2 (¿quién lo dice?)',
    qt_a3: 'Audición · Tarea 3 (entrevista)', qt_a4: 'Audición · Tarea 4 (relacionar personas)',
    qt_a5: 'Audición · Tarea 5 (conferencia)',
    qt_grammar: 'Gramática B2 (10 preguntas)', qt_conj: 'Conjugación (15 preguntas)',
    qt_random: 'Quiz rápido (20 mixtas)', qt_serestar: 'Quiz: SER y ESTAR (12)',
    qt_mock: 'Simulacro DELE B2', qt_vocab_mixed: 'Quiz mixto de vocabulario', qt_vocab_prefix: 'Quiz · ',
    qt_uaes: 'Ucraniano → español (4 opciones)',
    // Materiales de apoyo
    support_reading: '▾ Texto de lectura (toca para ocultar/mostrar)',
    support_audio: '▾ Audio (transcripción — léela en voz alta o usa la lectura del sistema)',
    // Títulos de pantalla
    title_tenses: 'Tiempos verbales · Дієслівні часи', title_verbs: 'Verbos clave · Ключові дієслова',
    title_tips: 'Consejos y estrategias', title_articles: 'Vocabulario de artículos · Ucraniano',
    title_tener: 'Sinónimos de TENER · Синоніми до TENER', title_tendencia: 'Palabra clave: TENDENCIA',
    title_writing: 'Expresión escrita', title_writing_choose: 'Expresión escrita — elige una tarea',
    title_speaking: 'Expresión oral',
    // Navegador de artículos
    ab_intro_strong: 'Cada artículo es un mazo. ',
    ab_intro_rest: 'Estúdialo con flashcards o ponte a prueba con el quiz. Marca las difíciles y repásalas aparte. En total: {n} palabras.',
    ab_mixed: '🎲 Quiz mixto de vocabulario (20)', ab_cards: 'Tarjetas', ab_quiz: 'Quiz',
    ab_words: '{n} palabras', ab_too_small: 'Este mazo es demasiado pequeño para un quiz.',
    // Tiempos
    tn_how_strong: '¿Cómo estudiar los tiempos? ',
    tn_how_rest: 'Lee un tiempo al día, copia sus ejemplos a mano y luego haz el quiz de conjugación. El contraste indefinido/imperfecto y el subjuntivo son los que más caen en el examen.',
    tn_practice: 'Practicar conjugación (quiz)', tn_formation: 'Formación: ', tn_trick: 'Truco: ',
    // Verbos
    vb_forms_strong: 'Formas mostradas: ',
    vb_forms_rest: 'yo presente · yo indefinido · yo subjuntivo · participio. Domina estas cuatro y el resto de la conjugación sale sola.',
    vb_study_flash: 'Estudiar con flashcards', vb_quiz: 'Quiz de conjugación',
    slot_indef: 'yo, pretérito indefinido', slot_subj: 'yo, presente de subjuntivo', slot_part: 'participio',
    conj_q: '¿Cuál es la forma correcta de "{inf}" ({ua}) — {slot}?',
    // TENER
    tn_level_strong: 'Sube tu nivel: ',
    tn_level_rest: 'el verbo "tener" es correcto, pero repetirlo baja la nota en el DELE. Sustitúyelo por estos sinónimos según el contexto y tu expresión sonará mucho más rica.',
    // Escritura
    w_group1: 'Tarea 1 · Carta formal', w_group2: 'Tarea 2 · Redacción', w_start: 'Empezar',
    w_ideas: 'Ideas clave: ', w_your_text: 'Tu redacción', w_placeholder: 'Escribe aquí tu texto...',
    w_words: '{n} palabras (objetivo: 150–180)', w_criteria: 'Criterios a revisar',
    w_model: 'Texto modelo (tras escribir el tuyo)', w_model_toggle: '▸ Ver texto modelo',
    w_back_list: '‹ Volver a la lista',
    // Oral
    sp_fillers_toggle: '▸ Muletillas para ganar tiempo · Як заповнити тишу',
    sp_g1: 'Tarea 1 · Valorar propuestas (6-7 min)', sp_g2: 'Tarea 2 · Situación a partir de una foto (5-6 min)',
    sp_g3: 'Tarea 3 · Opinar sobre una encuesta (3-4 min)', sp_extra: 'Práctica extra de conversación (no entra en el examen)',
    sp_open: 'Abrir',
    lbl_preguntaEncuesta: 'Pregunta de la encuesta', lbl_opcionesEncuesta: 'Opciones (conteste usted primero)',
    lbl_datosReales: 'Datos reales (compárelos con su respuesta)', lbl_propuestas: 'Propuestas a valorar',
    lbl_preguntasGuia: 'Preguntas guía', lbl_ayuda: 'Ayudas y vocabulario', lbl_vocabularioUtil: 'Vocabulario útil',
    lbl_supuestoExaminador: 'Papel del examinador', lbl_suPapel: 'Tu papel', lbl_estrategias: 'Estrategias',
    lbl_estructura: 'Estructura sugerida', lbl_ideasClave: 'Ideas clave',
    // Simulacro
    mock_confirm: 'Simulacro DELE B2:\n\n• Lectura (≈20 preguntas) + Audición (≈18 preguntas)\n• Tiempo total: 60 minutos con cronómetro\n• Las escritas y orales se practican aparte.\n\n¿Empezar?',
    // Aviso instalación iOS
    ios_hint_strong: 'Instálala en tu iPhone:',
    ios_hint_rest: ' pulsa el botón Compartir en Safari y elige "Añadir a pantalla de inicio" para usarla como una app.'
  },
  uk: {
    // Cabecera
    btn_theme: 'Змінити тему',
    btn_reset: 'Скинути прогрес',
    btn_lang: 'Мова / Idioma',
    // Hero
    hero_title: 'Привіт! Готуйся до DELE B2',
    hero_desc: 'Питання у форматі іспиту, лексика та дієслова з перекладом українською, пояснення дієслівних часів і пробні іспити за офіційною моделлю Інституту Сервантеса.',
    hero_love: 'Я тебе кохаю, Яно, ти зможеш.',
    stat_answered: 'Відповіді',
    stat_accuracy: 'Правильні',
    stat_streak: 'Серія (днів)',
    // Cuenta atrás
    cd_days_label: 'днів до DELE B2 · 16 жовтня',
    cd_weeks_sub: '≈ {n} тижнів · ти зможеш, Яно!',
    cd_one_label: 'день до DELE B2 · завтра іспит!',
    cd_one_sub: 'Добре відпочинь цієї ночі 💪',
    cd_today_num: 'Сьогодні!',
    cd_today_label: 'Сьогодні день DELE B2',
    cd_today_sub: 'Успіху, Яно! 🍀',
    cd_past_label: 'Іспит уже позаду',
    cd_past_sub: 'Сподіваємось, ти склала його!',
    cd_loading: 'Завантаження зворотного відліку…',
    // Meta diaria
    goal_done: 'Денну ціль виконано! {n} питань сьогодні 🎉',
    goal_progress: 'Денна ціль: {n} / {g} питань',
    // Secciones
    sec_mock: 'Повний пробний іспит',
    sec_reading: 'Іспит 1 — Розуміння прочитаного',
    sec_listening: 'Іспит 2 — Розуміння на слух (5 завдань)',
    sec_verbs: 'Дієслова та часи',
    sec_vocab_grammar: 'Лексика та граматика',
    sec_vocab_themes: 'Тематична лексика · Українською 🇺🇦',
    sec_expression: 'Висловлювання',
    // Tarjetas
    card_mock_t: 'Повний іспит', card_mock_d: 'Пробний іспит на час із 4 частин',
    card_quick_t: 'Швидкий тест', card_quick_d: '20 випадкових змішаних питань',
    card_r1_t: 'Завдання 1', card_r1_d: 'Довгий текст + вибір відповіді',
    card_r2_t: 'Завдання 2', card_r2_d: 'Зіставити тексти з людьми',
    card_r3_t: 'Завдання 3', card_r3_d: 'Текст із пропусками (фрази)',
    card_r4_t: 'Завдання 4', card_r4_d: 'Граматика й лексика в контексті',
    card_a1_t: 'Короткі повідомлення', card_a1_d: 'Оголошення й анонси',
    card_a2_t: 'Хто це каже?', card_a2_d: 'Розмова: він, вона чи ніхто',
    card_a3_t: "Інтерв'ю", card_a3_d: "Питання за інтерв'ю",
    card_a4_t: 'Зіставити людей', card_a4_d: '6 людей, 9 тверджень',
    card_a5_t: 'Лекція', card_a5_d: 'Пояснювальний монолог',
    card_tenses_t: 'Дієслівні часи', card_tenses_d: '14 часів із поясненням українською',
    card_verbs_t: 'Ключові дієслова', card_verbs_d: '50 дієслів із неправильними формами',
    card_verbflash_t: 'Картки дієслів', card_verbflash_d: 'Повторення з українською',
    card_conj_t: 'Тест на дієвідміну', card_conj_d: '15 практичних питань',
    card_flash_t: 'Картки', card_flash_d: 'Тематична лексика B2',
    card_grammar_t: 'Граматика', card_grammar_d: 'Subjuntivo, умовний, ser/estar…',
    card_idioms_t: 'Вирази', card_idioms_d: 'Ідіоми та сталі вирази',
    card_connectors_t: 'Конектори', card_connectors_d: 'Дискурсивні маркери',
    card_articles_t: 'Лексика зі статей', card_articles_d: '18 тематичних списків · українською',
    card_serestar_t: 'Вирази: SER та ESTAR', card_serestar_d: '37 сталих виразів · українською',
    card_serestarquiz_t: 'Тест: SER та ESTAR', card_serestarquiz_d: 'Вгадай значення',
    card_tener_t: 'Синоніми до TENER', card_tener_d: 'Підвищ свій рівень лексики B2',
    card_tendencia_t: 'Слово: TENDENCIA', card_tendencia_d: 'Часта калька + колокації',
    card_uaes_t: 'Тест: українська → іспанська', card_uaes_d: 'Слово укр, 4 варіанти ісп',
    card_writing_t: 'Письмо', card_writing_d: 'Практика завдань 1 і 2',
    card_speaking_t: 'Усне мовлення', card_speaking_d: 'Теми й фото для розмови',
    card_tips_t: 'Поради', card_tips_d: 'Стратегії іспиту',
    // Pestañas
    tab_home: 'Головна', tab_vocab: 'Лексика', tab_grammar: 'Граматика', tab_quiz: 'Тест', tab_tips: 'Поради',
    // Chrome / botones
    back: '‹ Назад', check: 'Перевірити', next: 'Далі ›', prev: '‹ Попередня', shuffle: 'Перемішати',
    correct: 'Правильно!', incorrect: 'Неправильно.', explanation: 'Пояснення: ',
    pick_first: 'Спочатку обери варіант.', pick_one: 'Обери варіант.',
    result_back: 'На головну', result_repeat: 'Повторити',
    res_correct: 'Правильні', res_wrong: 'Помилки', res_total: 'Усього', res_default: 'Гарна робота!',
    flash_hint: 'Торкнись картки, щоб побачити відповідь', flash_hard: 'Складно, повторити', flash_know: 'Знаю!',
    flash_review_hard: 'Повторити лише складні ({n})', flash_progress_hard: ' · складні: ',
    no_hard: 'У цій колоді немає складних карток. Молодець!',
    afirmacion: 'Твердження: ', ninguno: 'Жоден із двох', quien_dice: '  —  Хто це каже?',
    reset_confirm: 'Скинути весь збережений прогрес?',
    soon: 'Цей розділ незабаром буде доступний.',
    // Etiquetas de tipo
    tag_reading: 'Читання', tag_grammar: 'Граматика', tag_listening: 'Аудіювання',
    tag_vocab: 'Лексика', tag_tenses: 'Часи', tag_lexgram: 'Лексика/Граматика',
    // Resultados
    res_l_90: 'Відмінно! Найвищий рівень.',
    res_l_75: 'Дуже добре! Ти готова до іспиту.',
    res_l_60: 'Склала. Працюй далі над слабкими місцями.',
    res_l_40: 'Нижче прохідного балу. Перечитай пояснення.',
    res_l_0: 'Ще багато повторювати. Не здавайся, це лише початок!',
    time_up: 'Час вичерпано!',
    // Títulos de quiz
    qt_r1: 'Читання · Завдання 1', qt_r2: 'Читання · Завдання 2', qt_r3: 'Читання · Завдання 3', qt_r4: 'Читання · Завдання 4',
    qt_a1: 'Аудіювання · Завдання 1 (короткі повідомлення)', qt_a2: 'Аудіювання · Завдання 2 (хто це каже?)',
    qt_a3: "Аудіювання · Завдання 3 (інтерв'ю)", qt_a4: 'Аудіювання · Завдання 4 (зіставити людей)',
    qt_a5: 'Аудіювання · Завдання 5 (лекція)',
    qt_grammar: 'Граматика B2 (10 питань)', qt_conj: 'Дієвідміна (15 питань)',
    qt_random: 'Швидкий тест (20 змішаних)', qt_serestar: 'Тест: SER та ESTAR (12)',
    qt_mock: 'Пробний іспит DELE B2', qt_vocab_mixed: 'Змішаний тест з лексики', qt_vocab_prefix: 'Тест · ',
    qt_uaes: 'Українська → іспанська (4 варіанти)',
    // Materiales de apoyo
    support_reading: '▾ Текст для читання (торкнись, щоб сховати/показати)',
    support_audio: '▾ Аудіо (транскрипція — читай уголос або скористайся озвучкою системи)',
    // Títulos de pantalla
    title_tenses: 'Дієслівні часи', title_verbs: 'Ключові дієслова',
    title_tips: 'Поради та стратегії', title_articles: 'Лексика зі статей · Українською',
    title_tener: 'Синоніми до TENER', title_tendencia: 'Ключове слово: TENDENCIA',
    title_writing: 'Письмове висловлювання', title_writing_choose: 'Письмо — обери завдання',
    title_speaking: 'Усне висловлювання',
    // Navegador de artículos
    ab_intro_strong: 'Кожна стаття — це колода. ',
    ab_intro_rest: 'Вивчай картками або перевір себе тестом. Познач складні й повторюй окремо. Усього: {n} слів.',
    ab_mixed: '🎲 Змішаний тест з лексики (20)', ab_cards: 'Картки', ab_quiz: 'Тест',
    ab_words: '{n} слів', ab_too_small: 'Ця колода замала для тесту.',
    // Tiempos
    tn_how_strong: 'Як вчити часи? ',
    tn_how_rest: 'Читай один час на день, перепиши приклади від руки, а потім пройди тест на дієвідміну. Контраст indefinido/imperfecto і subjuntivo трапляються на іспиті найчастіше.',
    tn_practice: 'Практикувати дієвідміну (тест)', tn_formation: 'Утворення: ', tn_trick: 'Порада: ',
    // Verbos
    vb_forms_strong: 'Показані форми: ',
    vb_forms_rest: 'yo present · yo indefinido · yo subjuntivo · дієприкметник. Опануй ці чотири — і решта дієвідміни піде сама.',
    vb_study_flash: 'Вчити картками', vb_quiz: 'Тест на дієвідміну',
    slot_indef: 'yo, pretérito indefinido', slot_subj: 'yo, presente de subjuntivo', slot_part: 'дієприкметник',
    conj_q: 'Яка правильна форма дієслова "{inf}" ({ua}) — {slot}?',
    // TENER
    tn_level_strong: 'Підвищ свій рівень: ',
    tn_level_rest: 'дієслово "tener" правильне, але його повторення знижує оцінку на DELE. Заміняй його цими синонімами за контекстом — і твоє мовлення звучатиме набагато багатше.',
    // Escritura
    w_group1: 'Завдання 1 · Офіційний лист', w_group2: 'Завдання 2 · Твір', w_start: 'Почати',
    w_ideas: 'Ключові ідеї: ', w_your_text: 'Твій текст', w_placeholder: 'Пиши свій текст тут...',
    w_words: '{n} слів (ціль: 150–180)', w_criteria: 'Критерії для перевірки',
    w_model: 'Зразок тексту (після того, як напишеш свій)', w_model_toggle: '▸ Показати зразок',
    w_back_list: '‹ Назад до списку',
    // Oral
    sp_fillers_toggle: '▸ Слова-заповнювачі, щоб виграти час · Як заповнити тишу',
    sp_g1: 'Завдання 1 · Оцінити пропозиції (6-7 хв)', sp_g2: 'Завдання 2 · Ситуація за фото (5-6 хв)',
    sp_g3: 'Завдання 3 · Думка про опитування (3-4 хв)', sp_extra: 'Додаткова розмовна практика (не входить до іспиту)',
    sp_open: 'Відкрити',
    lbl_preguntaEncuesta: 'Питання опитування', lbl_opcionesEncuesta: 'Варіанти (спершу дай відповідь сама)',
    lbl_datosReales: 'Реальні дані (порівняй зі своєю відповіддю)', lbl_propuestas: 'Пропозиції для оцінки',
    lbl_preguntasGuia: 'Орієнтовні питання', lbl_ayuda: 'Підказки та лексика', lbl_vocabularioUtil: 'Корисна лексика',
    lbl_supuestoExaminador: 'Роль екзаменатора', lbl_suPapel: 'Твоя роль', lbl_estrategias: 'Стратегії',
    lbl_estructura: 'Рекомендована структура', lbl_ideasClave: 'Ключові ідеї',
    // Simulacro
    mock_confirm: 'Пробний іспит DELE B2:\n\n• Читання (≈20 питань) + Аудіювання (≈18 питань)\n• Загальний час: 60 хвилин із таймером\n• Письмо й усне мовлення практикуються окремо.\n\nПочати?',
    // Aviso instalación iOS
    ios_hint_strong: 'Встанови на iPhone:',
    ios_hint_rest: ' натисни кнопку «Поділитися» у Safari та обери «На початковий екран», щоб користуватися як застосунком.'
  }
};

(function () {
  const LKEY = 'dele-lang';
  window.getLang = () => localStorage.getItem(LKEY) || 'es';
  window.t = (key, vars) => {
    const l = window.getLang();
    let s = (window.I18N[l] && window.I18N[l][key]) || window.I18N.es[key] || key;
    if (vars) Object.keys(vars).forEach((n) => { s = s.split('{' + n + '}').join(vars[n]); });
    return s;
  };
  function applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = window.t(e.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-title]').forEach((e) => { e.title = window.t(e.getAttribute('data-i18n-title')); });
    const lb = document.getElementById('langBtn');
    if (lb) lb.textContent = window.getLang() === 'es' ? 'УКР' : 'ESP';
  }
  window.applyStaticI18n = applyStatic;
  window.setLang = (l) => {
    localStorage.setItem(LKEY, l);
    document.documentElement.setAttribute('lang', l === 'uk' ? 'uk' : 'es');
    applyStatic();
    if (typeof window._deleOnLangChange === 'function') window._deleOnLangChange();
  };
  window.toggleLang = () => window.setLang(window.getLang() === 'es' ? 'uk' : 'es');
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('lang', window.getLang() === 'uk' ? 'uk' : 'es');
    applyStatic();
  });
})();
