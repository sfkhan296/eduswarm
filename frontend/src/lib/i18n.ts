export type LangCode =
  | "en" | "hi" | "es" | "fr" | "ar"
  | "de" | "zh" | "ja" | "pt" | "ru"
  | "ko" | "it";

// Single unified interface — every key the app ever needs
export interface UIStrings {
  // Nav
  nav_learn: string;
  nav_history: string;
  nav_profile: string;
  // Learn page
  learn_heading: string;
  learn_subheading: string;
  learn_placeholder: string;
  learn_btn: string;
  learn_generating: string;
  learn_error: string;
  // Lesson tabs
  tab_lesson: string;
  tab_quiz: string;
  tab_chat: string;
  // Quiz
  quiz_correct: string;
  quiz_wrong: string;
  quiz_retry: string;
  quiz_perfect: string;
  quiz_good: string;
  quiz_keep_going: string;
  // Chat
  chat_placeholder: string;
  chat_title: string;
  chat_subtitle: string;
  // History
  history_title: string;
  history_subtitle: string;
  history_empty: string;
  history_start: string;
  // Profile
  profile_title: string;
  profile_email: string;
  profile_joined: string;
  profile_goal: string;
  profile_age: string;
  profile_language: string;
  // Tools
  tool_slides: string;
  tool_word: string;
  tool_code: string;
  tool_mp3: string;
  tool_mp4: string;
  tool_animation: string;
  tool_language: string;
  desc_slides: string;
  desc_word: string;
  desc_code: string;
  desc_mp3: string;
  desc_mp4: string;
  desc_animation: string;
  desc_language: string;
  // Generic UI
  generate: string;
  download: string;
  copy: string;
  copied: string;
  preview: string;
  topic_label: string;
  current_language: string;
  language_note: string;
  // Funny / motivational
  funny_loading_1: string;
  funny_loading_2: string;
  funny_loading_3: string;
  funny_correct: string;
  funny_wrong: string;
  funny_streak: string;
  // Example prompts (suggestion chips)
  example_prompts: string[];
}

// Keep the old alias so existing imports still compile
export type Translations = UIStrings;

const en: UIStrings = {
  nav_learn: "Learn", nav_history: "History", nav_profile: "Profile",
  learn_heading: "What do you want to learn?",
  learn_subheading: "Enter any topic and our AI agents will build a personalized lesson just for you.",
  learn_placeholder: "e.g. Teach me Java from scratch.",
  learn_btn: "Start Learning", learn_generating: "Generating…",
  learn_error: "Something went wrong. Please try again.",
  tab_lesson: "Lesson", tab_quiz: "Quiz", tab_chat: "Ask AI",
  quiz_correct: "Correct!", quiz_wrong: "Not quite!", quiz_retry: "Try Again",
  quiz_perfect: "Perfect score! 🎉", quiz_good: "Good job! Keep it up.", quiz_keep_going: "Keep practicing!",
  chat_placeholder: "Ask a follow-up question…",
  chat_title: "Follow-up Chat", chat_subtitle: "Ask anything about this lesson",
  history_title: "Learning History", history_subtitle: "Click any session to view the full lesson",
  history_empty: "No sessions yet", history_start: "Start Learning",
  profile_title: "Profile", profile_email: "Email", profile_joined: "Joined",
  profile_goal: "Learning Goal", profile_age: "Age", profile_language: "Preferred Language",
  tool_slides: "Slides", tool_word: "Word Doc", tool_code: "Code",
  tool_mp3: "MP3 Audio", tool_mp4: "Video", tool_animation: "Animation", tool_language: "Language",
  desc_slides: "Generate a .pptx presentation",
  desc_word: "Generate a .docx document",
  desc_code: "Generate runnable code",
  desc_mp3: "Generate & record audio",
  desc_mp4: "Generate a video script",
  desc_animation: "Generate a cartoon script",
  desc_language: "Change interface language",
  generate: "Generate", download: "Download", copy: "Copy", copied: "Copied!",
  preview: "Preview", topic_label: "Topic",
  current_language: "Current language",
  language_note: "Selecting a language changes the entire interface and all generated content.",
  funny_loading_1: "🤖 Our AI agents are putting on their thinking caps…",
  funny_loading_2: "☕ Brewing your personalized lesson (no coffee needed)…",
  funny_loading_3: "🧠 Loading brain cells… please wait…",
  funny_correct: "Nailed it! You're basically a genius now. 🎯",
  funny_wrong: "Oops! Even Einstein got things wrong sometimes. 😅",
  funny_streak: "🔥 You're on fire! The knowledge is flowing!",
  example_prompts: [
    "Teach me Java from scratch.",
    "Explain machine learning to a 10-year-old.",
    "Help me understand React hooks as a professional.",
    "What is quantum computing?",
    "Explain DNA replication simply.",
    "Why does my code never work on the first try? 😭",
    "Teach me calculus like I'm a golden retriever 🐕",
    "What even IS the mitochondria?",
    "Explain the stock market without making me cry 📉",
    "Make photosynthesis sound as cool as it actually is 🌱",
  ],
};

const hi: UIStrings = {
  nav_learn: "सीखें", nav_history: "इतिहास", nav_profile: "प्रोफ़ाइल",
  learn_heading: "आप क्या सीखना चाहते हैं?",
  learn_subheading: "कोई भी विषय दर्ज करें और हमारे AI एजेंट आपके लिए व्यक्तिगत पाठ तैयार करेंगे।",
  learn_placeholder: "उदा. मुझे Java सिखाएं।",
  learn_btn: "सीखना शुरू करें", learn_generating: "तैयार हो रहा है…",
  learn_error: "कुछ गलत हुआ। कृपया पुनः प्रयास करें।",
  tab_lesson: "पाठ", tab_quiz: "प्रश्नोत्तरी", tab_chat: "AI से पूछें",
  quiz_correct: "सही!", quiz_wrong: "बिल्कुल नहीं!", quiz_retry: "फिर कोशिश करें",
  quiz_perfect: "परफेक्ट स्कोर! 🎉", quiz_good: "शाबाश! जारी रखो।", quiz_keep_going: "अभ्यास जारी रखें!",
  chat_placeholder: "अनुवर्ती प्रश्न पूछें…",
  chat_title: "AI से बात करें", chat_subtitle: "इस पाठ के बारे में कुछ भी पूछें",
  history_title: "सीखने का इतिहास", history_subtitle: "पूरा पाठ देखने के लिए किसी सत्र पर क्लिक करें",
  history_empty: "अभी तक कोई सत्र नहीं", history_start: "सीखना शुरू करें",
  profile_title: "प्रोफ़ाइल", profile_email: "ईमेल", profile_joined: "शामिल हुए",
  profile_goal: "सीखने का लक्ष्य", profile_age: "उम्र", profile_language: "पसंदीदा भाषा",
  tool_slides: "स्लाइड्स", tool_word: "Word दस्तावेज़", tool_code: "कोड",
  tool_mp3: "MP3 ऑडियो", tool_mp4: "वीडियो", tool_animation: "एनिमेशन", tool_language: "भाषा",
  desc_slides: ".pptx प्रेजेंटेशन बनाएं", desc_word: ".docx दस्तावेज़ बनाएं",
  desc_code: "चलने योग्य कोड बनाएं", desc_mp3: "ऑडियो बनाएं और रिकॉर्ड करें",
  desc_mp4: "वीडियो स्क्रिप्ट बनाएं", desc_animation: "कार्टून स्क्रिप्ट बनाएं",
  desc_language: "इंटरफ़ेस भाषा बदलें",
  generate: "बनाएं", download: "डाउनलोड", copy: "कॉपी", copied: "कॉपी हो गया!",
  preview: "पूर्वावलोकन", topic_label: "विषय",
  current_language: "वर्तमान भाषा",
  language_note: "भाषा चुनने से पूरा इंटरफ़ेस और सभी जेनरेट की गई सामग्री बदल जाती है।",
  funny_loading_1: "🤖 हमारे AI एजेंट सोच की टोपी पहन रहे हैं…",
  funny_loading_2: "☕ आपका व्यक्तिगत पाठ तैयार हो रहा है…",
  funny_loading_3: "🧠 दिमाग की कोशिकाएं लोड हो रही हैं…",
  funny_correct: "शाबाश! आप तो जीनियस हो! 🎯",
  funny_wrong: "अरे! आइंस्टीन भी कभी-कभी गलत होते थे। 😅",
  funny_streak: "🔥 आप तो आग लगा रहे हो! ज्ञान बह रहा है!",
  example_prompts: [
    "मुझे Java सिखाएं।",
    "10 साल के बच्चे को मशीन लर्निंग समझाएं।",
    "React hooks को प्रोफेशनल तरीके से समझाएं।",
    "क्वांटम कंप्यूटिंग क्या है?",
    "DNA प्रतिकृति को सरलता से समझाएं।",
    "मेरा कोड पहली बार क्यों काम नहीं करता? 😭",
    "मुझे कैलकुलस सिखाएं जैसे मैं एक बच्चा हूं 🐕",
    "माइटोकॉन्ड्रिया क्या है?",
    "शेयर बाजार को बिना रुलाए समझाएं 📉",
    "प्रकाश संश्लेषण को रोचक बनाएं 🌱",
  ],
};

const es: UIStrings = {
  nav_learn: "Aprender", nav_history: "Historial", nav_profile: "Perfil",
  learn_heading: "¿Qué quieres aprender?",
  learn_subheading: "Ingresa cualquier tema y nuestros agentes de IA crearán una lección personalizada para ti.",
  learn_placeholder: "ej. Enséñame Java desde cero.",
  learn_btn: "Empezar a Aprender", learn_generating: "Generando…",
  learn_error: "Algo salió mal. Por favor, inténtalo de nuevo.",
  tab_lesson: "Lección", tab_quiz: "Quiz", tab_chat: "Preguntar IA",
  quiz_correct: "¡Correcto!", quiz_wrong: "¡No del todo!", quiz_retry: "Intentar de nuevo",
  quiz_perfect: "¡Puntuación perfecta! 🎉", quiz_good: "¡Buen trabajo! Sigue así.", quiz_keep_going: "¡Sigue practicando!",
  chat_placeholder: "Haz una pregunta de seguimiento…",
  chat_title: "Chat de seguimiento", chat_subtitle: "Pregunta cualquier cosa sobre esta lección",
  history_title: "Historial", history_subtitle: "Haz clic en una sesión para ver la lección",
  history_empty: "Aún no hay sesiones", history_start: "Empezar",
  profile_title: "Perfil", profile_email: "Correo", profile_joined: "Unido",
  profile_goal: "Objetivo de aprendizaje", profile_age: "Edad", profile_language: "Idioma preferido",
  tool_slides: "Diapositivas", tool_word: "Documento", tool_code: "Código",
  tool_mp3: "Audio MP3", tool_mp4: "Video", tool_animation: "Animación", tool_language: "Idioma",
  desc_slides: "Generar presentación .pptx", desc_word: "Generar documento .docx",
  desc_code: "Generar código ejecutable", desc_mp3: "Generar y grabar audio",
  desc_mp4: "Generar guión de video", desc_animation: "Generar guión animado",
  desc_language: "Cambiar idioma de la interfaz",
  generate: "Generar", download: "Descargar", copy: "Copiar", copied: "¡Copiado!",
  preview: "Vista previa", topic_label: "Tema",
  current_language: "Idioma actual",
  language_note: "Cambiar el idioma cambia toda la interfaz y el contenido generado.",
  funny_loading_1: "🤖 Nuestros agentes de IA se están poniendo los sombreros de pensar…",
  funny_loading_2: "☕ Preparando tu lección personalizada…",
  funny_loading_3: "🧠 Cargando células cerebrales…",
  funny_correct: "¡Lo clavaste! 🎯", funny_wrong: "¡Ups! Hasta Einstein se equivocó. 😅",
  funny_streak: "🔥 ¡Estás en llamas!",
  example_prompts: [
    "Enséñame Java desde cero.",
    "Explica el aprendizaje automático a un niño de 10 años.",
    "Ayúdame a entender los hooks de React como profesional.",
    "¿Qué es la computación cuántica?",
    "Explica la replicación del ADN de forma sencilla.",
    "¿Por qué mi código nunca funciona a la primera? 😭",
    "Enséñame cálculo como si fuera un perrito 🐕",
    "¿Qué ES exactamente la mitocondria?",
    "Explica la bolsa sin hacerme llorar 📉",
    "Haz que la fotosíntesis suene interesante 🌱",
  ],
};

// Helper to clone English and override specific keys
function overlay(base: UIStrings, overrides: Partial<UIStrings>): UIStrings {
  return { ...base, ...overrides };
}

export const TRANSLATIONS: Record<LangCode, UIStrings> = {
  en,
  hi,
  es,
  fr: overlay(en, {
    nav_learn:"Apprendre", nav_history:"Historique", nav_profile:"Profil",
    learn_heading:"Que voulez-vous apprendre ?",
    learn_subheading:"Entrez n'importe quel sujet et nos agents IA créeront une leçon personnalisée pour vous.",
    learn_placeholder:"ex. Apprenez-moi Java depuis le début.",
    learn_btn:"Commencer", learn_generating:"Génération…",
    tab_lesson:"Leçon", tab_quiz:"Quiz", tab_chat:"Demander à l'IA",
    quiz_correct:"Correct !", quiz_wrong:"Pas tout à fait !", quiz_retry:"Réessayer",
    quiz_perfect:"Score parfait ! 🎉", quiz_good:"Bon travail !", quiz_keep_going:"Continuez !",
    chat_placeholder:"Posez une question de suivi…",
    chat_title:"Chat de suivi", chat_subtitle:"Demandez n'importe quoi sur cette leçon",
    history_title:"Historique", history_subtitle:"Cliquez sur une session",
    history_empty:"Pas encore de sessions", history_start:"Commencer",
    profile_title:"Profil", profile_email:"Email", profile_joined:"Rejoint",
    current_language:"Langue actuelle",
    language_note:"Changer la langue modifie toute l'interface et le contenu généré.",
    generate:"Générer", download:"Télécharger", copy:"Copier", copied:"Copié !",
    preview:"Aperçu", topic_label:"Sujet",
    funny_loading_1:"🤖 Nos agents IA réfléchissent…",
    funny_correct:"Parfait ! 🎯", funny_wrong:"Oups ! 😅", funny_streak:"🔥 En feu !",
    example_prompts: [
      "Apprenez-moi Java depuis le début.",
      "Expliquez le machine learning à un enfant de 10 ans.",
      "Aidez-moi à comprendre les hooks React comme un pro.",
      "Qu'est-ce que l'informatique quantique ?",
      "Expliquez simplement la réplication de l'ADN.",
      "Pourquoi mon code ne fonctionne jamais du premier coup ? 😭",
      "Apprenez-moi le calcul comme si j'étais un chiot 🐕",
      "C'est quoi exactement la mitochondrie ?",
      "Expliquez la bourse sans me faire pleurer 📉",
      "Rendez la photosynthèse fascinante 🌱",
    ],
  }),
  ar: overlay(en, {
    nav_learn:"تعلم", nav_history:"السجل", nav_profile:"الملف",
    learn_heading:"ماذا تريد أن تتعلم؟",
    learn_subheading:"أدخل أي موضوع وسيقوم وكلاء الذكاء الاصطناعي ببناء درس مخصص لك.",
    learn_placeholder:"مثال: علمني Java من الصفر.",
    learn_btn:"ابدأ التعلم", learn_generating:"جارٍ الإنشاء…",
    tab_lesson:"الدرس", tab_quiz:"اختبار", tab_chat:"اسأل الذكاء الاصطناعي",
    quiz_correct:"صحيح!", quiz_wrong:"ليس تماماً!", quiz_retry:"حاول مجدداً",
    quiz_perfect:"درجة مثالية! 🎉", quiz_good:"عمل جيد!", quiz_keep_going:"استمر!",
    chat_placeholder:"اطرح سؤالاً متابعاً…",
    chat_title:"محادثة المتابعة", chat_subtitle:"اسأل أي شيء عن هذا الدرس",
    history_title:"سجل التعلم", history_subtitle:"انقر على جلسة لعرضها",
    history_empty:"لا جلسات بعد", history_start:"ابدأ التعلم",
    profile_title:"الملف", profile_email:"البريد", profile_joined:"انضم",
    current_language:"اللغة الحالية",
    language_note:"تغيير اللغة يؤثر على كامل الواجهة والمحتوى.",
    generate:"إنشاء", download:"تحميل", copy:"نسخ", copied:"تم النسخ!",
    preview:"معاينة", topic_label:"الموضوع",
    funny_loading_1:"🤖 وكلاؤنا يفكرون…",
    funny_correct:"أحسنت! 🎯", funny_wrong:"أوبس! 😅", funny_streak:"🔥 متقد!",
    example_prompts: [
      "علمني Java من الصفر.",
      "اشرح التعلم الآلي لطفل في العاشرة.",
      "ساعدني على فهم React hooks كمحترف.",
      "ما هو الحوسبة الكمية؟",
      "اشرح تضاعف الـ DNA ببساطة.",
      "لماذا لا يعمل كودي من أول مرة؟ 😭",
      "علمني حساب التفاضل كأنني جرو صغير 🐕",
      "ما هو الميتوكوندريا بالضبط؟",
      "اشرح البورصة بدون أن تجعلني أبكي 📉",
      "اجعل التمثيل الضوئي يبدو رائعاً 🌱",
    ],
  }),
  de: overlay(en, {
    nav_learn:"Lernen", nav_history:"Verlauf", nav_profile:"Profil",
    learn_heading:"Was möchten Sie lernen?",
    learn_subheading:"Geben Sie ein Thema ein — unsere KI erstellt eine personalisierte Lektion.",
    learn_placeholder:"z.B. Lehre mir Java von Grund auf.",
    learn_btn:"Lernen starten", learn_generating:"Wird generiert…",
    tab_lesson:"Lektion", tab_quiz:"Quiz", tab_chat:"KI fragen",
    quiz_correct:"Richtig!", quiz_wrong:"Nicht ganz!", quiz_retry:"Nochmal",
    quiz_perfect:"Perfekt! 🎉", quiz_good:"Gut gemacht!", quiz_keep_going:"Weiter!",
    chat_placeholder:"Folgefrage stellen…",
    chat_title:"Folgechat", chat_subtitle:"Fragen Sie alles zu dieser Lektion",
    history_title:"Lernverlauf", history_subtitle:"Klicken Sie auf eine Sitzung",
    history_empty:"Noch keine Sitzungen", history_start:"Lernen starten",
    current_language:"Aktuelle Sprache",
    language_note:"Die Sprachänderung wirkt sich auf die gesamte Oberfläche aus.",
    generate:"Generieren", download:"Herunterladen", copy:"Kopieren", copied:"Kopiert!",
    funny_correct:"Genau! 🎯", funny_wrong:"Hoppla! 😅", funny_streak:"🔥 Auf Feuer!",
    example_prompts: [
      "Lehre mir Java von Grund auf.",
      "Erkläre maschinelles Lernen einem 10-Jährigen.",
      "Hilf mir, React Hooks wie ein Profi zu verstehen.",
      "Was ist Quantencomputing?",
      "Erkläre DNA-Replikation einfach.",
      "Warum funktioniert mein Code nie beim ersten Versuch? 😭",
      "Lehre mir Analysis wie für einen Golden Retriever 🐕",
      "Was genau ist das Mitochondrium?",
      "Erkläre die Börse, ohne mich zum Weinen zu bringen 📉",
      "Mach Fotosynthese so cool wie sie ist 🌱",
    ],
  }),
  zh: overlay(en, {
    nav_learn:"学习", nav_history:"历史", nav_profile:"个人资料",
    learn_heading:"你想学什么？",
    learn_subheading:"输入任何主题，我们的AI助手将为你创建个性化课程。",
    learn_placeholder:"例如：从零开始教我Java。",
    learn_btn:"开始学习", learn_generating:"生成中…",
    tab_lesson:"课程", tab_quiz:"测验", tab_chat:"问AI",
    quiz_correct:"正确！", quiz_wrong:"不太对！", quiz_retry:"再试一次",
    quiz_perfect:"满分！🎉", quiz_good:"干得好！", quiz_keep_going:"继续！",
    chat_placeholder:"提问…",
    chat_title:"后续聊天", chat_subtitle:"问任何关于本课程的问题",
    history_title:"学习历史", history_subtitle:"点击会话查看完整课程",
    history_empty:"还没有会话", history_start:"开始学习",
    current_language:"当前语言", language_note:"更改语言会影响整个界面。",
    generate:"生成", download:"下载", copy:"复制", copied:"已复制！",
    funny_correct:"太棒了！🎯", funny_wrong:"哎呀！😅", funny_streak:"🔥 厉害！",
    example_prompts: [
      "从零开始教我Java。",
      "向10岁的孩子解释机器学习。",
      "帮我像专业人士一样理解React hooks。",
      "什么是量子计算？",
      "简单解释DNA复制。",
      "为什么我的代码第一次总是不工作？😭",
      "像对小狗一样教我微积分 🐕",
      "线粒体到底是什么？",
      "不让我哭的情况下解释股市 📉",
      "让光合作用听起来很酷 🌱",
    ],
  }),
  ja: overlay(en, {
    nav_learn:"学ぶ", nav_history:"履歴", nav_profile:"プロフィール",
    learn_heading:"何を学びたいですか？",
    learn_subheading:"トピックを入力すると、AIエージェントがパーソナライズされたレッスンを作成します。",
    learn_placeholder:"例：Javaをゼロから教えてください。",
    learn_btn:"学習開始", learn_generating:"生成中…",
    tab_lesson:"レッスン", tab_quiz:"クイズ", tab_chat:"AIに聞く",
    quiz_correct:"正解！", quiz_wrong:"残念！", quiz_retry:"もう一度",
    quiz_perfect:"満点！🎉", quiz_good:"よくできました！", quiz_keep_going:"続けよう！",
    chat_placeholder:"フォローアップの質問をする…",
    chat_title:"フォローアップチャット", chat_subtitle:"このレッスンについて質問",
    history_title:"学習履歴", history_subtitle:"セッションをクリック",
    history_empty:"セッションがありません", history_start:"学習開始",
    current_language:"現在の言語", language_note:"言語を変えると画面全体が変わります。",
    generate:"生成", download:"ダウンロード", copy:"コピー", copied:"コピーしました！",
    funny_correct:"やった！🎯", funny_wrong:"おっと！😅", funny_streak:"🔥 燃えています！",
    example_prompts: [
      "Javaをゼロから教えてください。",
      "機械学習を10歳の子供に説明してください。",
      "Reactフックをプロとして理解する手助けをしてください。",
      "量子コンピューティングとは何ですか？",
      "DNA複製を簡単に説明してください。",
      "なぜ私のコードは最初から動かないの？😭",
      "子犬に教えるように微積分を教えてください 🐕",
      "ミトコンドリアって何ですか？",
      "泣かせずに株式市場を説明してください 📉",
      "光合成をカッコよく聞こえるようにして 🌱",
    ],
  }),
  pt: overlay(en, {
    nav_learn:"Aprender", nav_history:"Histórico", nav_profile:"Perfil",
    learn_heading:"O que você quer aprender?",
    learn_subheading:"Digite qualquer tópico e nossos agentes de IA criarão uma aula personalizada para você.",
    learn_placeholder:"ex. Me ensine Java do zero.",
    learn_btn:"Começar a Aprender", learn_generating:"Gerando…",
    tab_lesson:"Aula", tab_quiz:"Quiz", tab_chat:"Perguntar IA",
    quiz_correct:"Correto!", quiz_wrong:"Não exatamente!", quiz_retry:"Tentar novamente",
    quiz_perfect:"Pontuação perfeita! 🎉", quiz_good:"Bom trabalho!", quiz_keep_going:"Continue!",
    chat_placeholder:"Faça uma pergunta…",
    chat_title:"Chat de acompanhamento", chat_subtitle:"Pergunte sobre esta aula",
    history_title:"Histórico", history_subtitle:"Clique em uma sessão",
    history_empty:"Nenhuma sessão ainda", history_start:"Começar",
    current_language:"Idioma atual", language_note:"Mudar o idioma altera toda a interface.",
    generate:"Gerar", download:"Baixar", copy:"Copiar", copied:"Copiado!",
    funny_correct:"Acertou! 🎯", funny_wrong:"Ops! 😅", funny_streak:"🔥 Em chamas!",
  }),
  ru: overlay(en, {
    nav_learn:"Учиться", nav_history:"История", nav_profile:"Профиль",
    learn_heading:"Что вы хотите изучить?",
    learn_subheading:"Введите любую тему, и наши ИИ-агенты создадут персонализированный урок.",
    learn_placeholder:"напр. Научи меня Java с нуля.",
    learn_btn:"Начать обучение", learn_generating:"Генерация…",
    tab_lesson:"Урок", tab_quiz:"Тест", tab_chat:"Спросить ИИ",
    quiz_correct:"Правильно!", quiz_wrong:"Не совсем!", quiz_retry:"Попробовать снова",
    quiz_perfect:"Идеально! 🎉", quiz_good:"Хорошая работа!", quiz_keep_going:"Продолжайте!",
    chat_placeholder:"Задайте уточняющий вопрос…",
    chat_title:"Чат с ИИ", chat_subtitle:"Спросите всё об этом уроке",
    history_title:"История обучения", history_subtitle:"Нажмите на сессию",
    history_empty:"Сессий пока нет", history_start:"Начать",
    current_language:"Текущий язык", language_note:"Изменение языка меняет весь интерфейс.",
    generate:"Генерировать", download:"Скачать", copy:"Копировать", copied:"Скопировано!",
    funny_correct:"Точно! 🎯", funny_wrong:"Упс! 😅", funny_streak:"🔥 Горите!",
  }),
  ko: overlay(en, {
    nav_learn:"배우기", nav_history:"기록", nav_profile:"프로필",
    learn_heading:"무엇을 배우고 싶으신가요?",
    learn_subheading:"주제를 입력하면 AI가 맞춤 수업을 만들어 드립니다.",
    learn_placeholder:"예: Java를 처음부터 가르쳐 주세요.",
    learn_btn:"학습 시작", learn_generating:"생성 중…",
    tab_lesson:"수업", tab_quiz:"퀴즈", tab_chat:"AI에게 물어보기",
    quiz_correct:"정답!", quiz_wrong:"아쉽네요!", quiz_retry:"다시 시도",
    quiz_perfect:"만점! 🎉", quiz_good:"잘했어요!", quiz_keep_going:"계속하세요!",
    chat_placeholder:"후속 질문 입력…",
    chat_title:"후속 채팅", chat_subtitle:"이 수업에 대해 무엇이든 물어보세요",
    history_title:"학습 기록", history_subtitle:"세션을 클릭하세요",
    history_empty:"세션 없음", history_start:"학습 시작",
    current_language:"현재 언어", language_note:"언어를 변경하면 전체 인터페이스가 변경됩니다.",
    generate:"생성", download:"다운로드", copy:"복사", copied:"복사됨!",
    funny_correct:"정확해! 🎯", funny_wrong:"이런! 😅", funny_streak:"🔥 불타고 있어!",
  }),
  it: overlay(en, {
    nav_learn:"Imparare", nav_history:"Cronologia", nav_profile:"Profilo",
    learn_heading:"Cosa vuoi imparare?",
    learn_subheading:"Inserisci un argomento e i nostri agenti AI creeranno una lezione personalizzata per te.",
    learn_placeholder:"es. Insegnami Java da zero.",
    learn_btn:"Inizia ad Imparare", learn_generating:"Generazione…",
    tab_lesson:"Lezione", tab_quiz:"Quiz", tab_chat:"Chiedi all'IA",
    quiz_correct:"Corretto!", quiz_wrong:"Non proprio!", quiz_retry:"Riprova",
    quiz_perfect:"Punteggio perfetto! 🎉", quiz_good:"Ottimo lavoro!", quiz_keep_going:"Continua!",
    chat_placeholder:"Fai una domanda di approfondimento…",
    chat_title:"Chat di approfondimento", chat_subtitle:"Chiedi qualsiasi cosa su questa lezione",
    history_title:"Cronologia", history_subtitle:"Clicca su una sessione",
    history_empty:"Nessuna sessione", history_start:"Inizia",
    current_language:"Lingua corrente", language_note:"Cambiare la lingua cambia l'intera interfaccia.",
    generate:"Genera", download:"Scarica", copy:"Copia", copied:"Copiato!",
    funny_correct:"Esatto! 🎯", funny_wrong:"Ops! 😅", funny_streak:"🔥 Stai volando!",
  }),
};

export function t(lang: LangCode, key: keyof UIStrings): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
}
