-- Migration: Create Biography Table
-- Purpose: Store artist biography with multilingual support
-- This allows managing the biography through the backoffice instead of hardcoded translations

CREATE TABLE IF NOT EXISTS biography (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Italian (source content)
  text_it TEXT NOT NULL,

  -- Translations
  text_en TEXT,
  text_es TEXT,
  text_fr TEXT,
  text_ja TEXT,
  text_zh TEXT,
  text_zh_tw TEXT,

  -- Versioning for translation tracking
  content_version INTEGER NOT NULL DEFAULT 1,
  translations_version INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial biography content from existing translations
INSERT INTO biography (
  text_it,
  text_en,
  text_es,
  text_fr,
  text_ja,
  text_zh,
  text_zh_tw,
  content_version,
  translations_version
) VALUES (
  'Nata a Cosenza nel 1967, Adele Lo Feudo – ALF – ha costruito il suo percorso artistico tra formazione accademica e ricerca personale. Dopo studi classici e una laurea in giurisprudenza, si trasferisce a Perugia dove la sua vita prende la strada dell''arte.

Diplomata interior designer e maestra d''arte, dal 2010 porta avanti un''intensa attività espositiva in Italia e all''estero. Le sue opere – caratterizzate da figure umane come finestre dell''anima – esplorano temi universali quali l''identità, la memoria e la condizione femminile, con particolare attenzione alle sfide che le artiste affrontano nel mondo dell''arte contemporanea.

Il suo debutto avviene nel 2010 con la mostra personale "Ali per volare" a Perugia, cui seguono numerose esposizioni in spazi prestigiosi tra Italia, Stati Uniti e Europa. Nel 2017 partecipa al Columbus Day Gala a New York, portando la sua arte oltreoceano. La sua produzione artistica si è evoluta attraverso serie tematiche che indagano la complessità dell''animo umano, dalle maschere sociali alla ricerca di autenticità.

Oltre alla pratica artistica, ALF è attivamente impegnata nel sociale. Ha curato e partecipato al progetto "Un petalo rosa", un''iniziativa collettiva che ha riunito 65 artiste donne per sensibilizzare contro la violenza di genere. Questo impegno riflette la sua visione dell''arte come strumento di dialogo e trasformazione sociale, capace di dare voce alle esperienze e alle lotte delle donne nel panorama culturale contemporaneo.',

  'Born in Cosenza in 1967, Adele Lo Feudo – ALF – has built her artistic journey between academic training and personal research. After classical studies and a law degree, she moved to Perugia where her life took the path of art.

Graduated as an interior designer and art teacher, since 2010 she has carried out an intense exhibition activity in Italy and abroad. Her works – characterized by human figures as windows of the soul – explore universal themes such as identity, memory and the female condition, with particular attention to the challenges that women artists face in the world of contemporary art.

Her debut came in 2010 with the solo exhibition "Wings to Fly" in Perugia, followed by numerous exhibitions in prestigious spaces between Italy, the United States and Europe. In 2017 she participated in the Columbus Day Gala in New York, bringing her art overseas. Her artistic production has evolved through thematic series that investigate the complexity of the human soul, from social masks to the search for authenticity.

In addition to her artistic practice, ALF is actively engaged in social issues. She curated and participated in the project "A Pink Petal", a collective initiative that brought together 65 women artists to raise awareness against gender-based violence. This commitment reflects her vision of art as an instrument of dialogue and social transformation, capable of giving voice to the experiences and struggles of women in the contemporary cultural landscape.',

  'Nacida en Cosenza en 1967, Adele Lo Feudo – ALF – ha construido su trayectoria artística entre formación académica e investigación personal. Después de estudios clásicos y una licenciatura en derecho, se traslada a Perugia donde su vida toma el camino del arte.

Diplomada como diseñadora de interiores y maestra de arte, desde 2010 lleva adelante una intensa actividad expositiva en Italia y en el extranjero. Sus obras – caracterizadas por figuras humanas como ventanas del alma – exploran temas universales como la identidad, la memoria y la condición femenina.

Su debut llegó en 2010 con la exposición individual "Alas para volar" en Perugia, seguida por numerosas exposiciones en espacios prestigiosos entre Italia, Estados Unidos y Europa. En 2017 participó en el Columbus Day Gala en Nueva York, llevando su arte al extranjero. Su producción artística ha evolucionado a través de series temáticas que investigan la complejidad del alma humana.

Además de su práctica artística, ALF está activamente comprometida con temas sociales. Ha curado y participado en el proyecto "Un pétalo rosa", una iniciativa colectiva que reunió a 65 artistas mujeres para sensibilizar contra la violencia de género. Este compromiso refleja su visión del arte como instrumento de diálogo y transformación social.',

  'Née à Cosenza en 1967, Adele Lo Feudo – ALF – a construit son parcours artistique entre formation académique et recherche personnelle. Après des études classiques et un diplôme en droit, elle s''installe à Pérouse où sa vie prend le chemin de l''art.

Diplômée en design d''intérieur et maître d''art, elle mène depuis 2010 une activité d''exposition intense en Italie et à l''étranger. Ses œuvres – caractérisées par des figures humaines comme fenêtres de l''âme – explorent des thèmes universels tels que l''identité, la mémoire et la condition féminine.

Ses débuts ont eu lieu en 2010 avec l''exposition personnelle "Des ailes pour voler" à Pérouse, suivie de nombreuses expositions dans des espaces prestigieux entre l''Italie, les États-Unis et l''Europe. En 2017, elle a participé au Columbus Day Gala à New York, apportant son art outre-mer. Sa production artistique a évolué à travers des séries thématiques qui explorent la complexité de l''âme humaine.

En plus de sa pratique artistique, ALF est activement engagée dans les questions sociales. Elle a organisé et participé au projet "Un pétale rose", une initiative collective qui a rassemblé 65 artistes femmes pour sensibiliser contre la violence fondée sur le genre. Cet engagement reflète sa vision de l''art comme instrument de dialogue et de transformation sociale.',

  '1967年コゼンツァ生まれのアデーレ・ロ・フェウド（ALF）は、アカデミックな教育と個人的な研究の間で芸術的な道を築いてきました。古典的な研究と法学の学位を取得後、ペルージャに移り、そこで彼女の人生は芸術の道を歩み始めました。

インテリアデザイナーとアートマスターの資格を持ち、2010年からイタリア国内外で精力的な展示活動を行っています。魂の窓としての人物像を特徴とする彼女の作品は、アイデンティティ、記憶、女性の状態などの普遍的なテーマを探求しています。

2010年にペルージャで個展"飛ぶための翼"でデビュー、その後イタリア、アメリカ、ヨーロッパの名だたる場所で数多くの展覧会を開催。2017年にはニューヨークのコロンブスデー・ガラに参加し、彼女の芸術を海外に届けました。彼女の芸術的制作は、人間の魂の複雑さを探求するテーマ別シリーズを通じて進化してきました。

芸術活動に加えて、ALFは社会問題に積極的に取り組んでいます。彼女はジェンダーに基づく暴力に対する意識を高めるために65人の女性アーティストを集めた集団イニシアチブ"ピンクの花びら"プロジェクトを企画し、参加しました。この取り組みは、対話と社会変革の道具としての芸術に対する彼女のビジョンを反映しています。',

  '1967年出生于科森扎的阿黛尔·洛·费乌多（ALF）在学术培训和个人研究之间建立了她的艺术道路。在完成古典研究和法律学位后，她搬到佩鲁贾，在那里她的生活走上了艺术之路。

作为室内设计师和艺术大师的毕业生，自2010年以来，她在意大利和国外进行了密集的展览活动。她的作品以人物形象作为灵魂之窗为特征，探索了身份、记忆和女性状况等普遍主题。

她于2010年在佩鲁贾举办个展"飞翔的翅膀"首次亮相，随后在意大利、美国和欧洲的著名场所举办了多次展览。2017年，她参加了纽约的哥伦布日晚会，将她的艺术带到了海外。她的艺术创作通过探索人类灵魂复杂性的主题系列而不断发展。

除了艺术实践，ALF还积极参与社会问题。她策划并参与了"粉红花瓣"项目，这是一个汇集了65位女性艺术家的集体倡议，旨在提高对基于性别暴力的认识。这种承诺反映了她对艺术作为对话和社会转型工具的愿景。',

  '1967年出生於科森扎的阿黛爾·洛·費烏多（ALF）在學術培訓和個人研究之間建立了她的藝術道路。在完成古典研究和法律學位後，她搬到佩魯賈，在那裡她的生活走上了藝術之路。

作為室內設計師和藝術大師的畢業生，自2010年以來，她在義大利和國外進行了密集的展覽活動。她的作品以人物形象作為靈魂之窗為特徵，探索了身份、記憶和女性狀況等普遍主題。

她於2010年在佩魯賈舉辦個展"飛翔的翅膀"首次亮相，隨後在義大利、美國和歐洲的著名場所舉辦了多次展覽。2017年，她參加了紐約的哥倫布日晚會，將她的藝術帶到了海外。她的藝術創作通過探索人類靈魂複雜性的主題系列而不斷發展。

除了藝術實踐，ALF還積極參與社會問題。她策劃並參與了"粉紅花瓣"項目，這是一個匯集了65位女性藝術家的集體倡議，旨在提高對基於性別暴力的認識。這種承諾反映了她對藝術作為對話和社會轉型工具的願景。',

  1,
  1
);
