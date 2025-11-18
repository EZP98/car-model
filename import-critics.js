/**
 * Script per importare i critici da critics-data.ts nel database D1
 */

const critics = [
  {
    name: 'Angelo Leidi',
    role: "Critico d'Arte",
    text: `Le opere di Adele Lo Feudo sono un viaggio nell'anima umana, dove la materia diventa linguaggio e il colore emozione pura. La sua ricerca artistica si muove tra il figurativo e l'astratto, creando un dialogo continuo tra forma e contenuto. Ogni tela è un campo di battaglia emotivo dove l'artista combatte per dare voce all'invisibile, trasformando la superficie pittorica in uno spazio di riflessione profonda sull'esistenza umana. La forza espressiva delle sue opere risiede nella capacità di coniugare tecnica raffinata e istinto creativo, dando vita a composizioni che parlano direttamente all'anima dello spettatore.`,
    order_index: 1,
    is_visible: 1
  },
  {
    name: 'Leonardo Varasano',
    role: 'Assessore alla Cultura del Comune di Perugia',
    text: `Adele Lo Feudo rappresenta una delle voci più autentiche dell'arte contemporanea italiana. Il suo lavoro, profondamente radicato nella tradizione pittorica italiana, si proietta verso il futuro con una visione innovativa e coraggiosa. La città di Perugia è orgogliosa di ospitare le sue mostre, che rappresentano momenti di alto valore culturale per la nostra comunità. L'artista ha saputo interpretare con sensibilità unica i temi del nostro tempo, creando opere che sono al contempo testimonianza storica e visione profetica. Il suo contributo all'arte contemporanea va oltre la semplice produzione artistica, configurandosi come una vera e propria missione culturale che arricchisce il patrimonio artistico della nostra città e dell'Italia intera.`,
    order_index: 2,
    is_visible: 1
  },
  {
    name: 'Celeste Morè',
    role: "Critico d'Arte",
    text: `La pittura materica di ALF trasforma la tela in territorio di esplorazione dell'anima. Ogni opera è un viaggio iniziatico che conduce lo spettatore attraverso paesaggi emotivi intensi e viscerali. L'artista utilizza la materia come veicolo espressivo, creando superfici che vibrano di vita propria, dove il gesto pittorico diventa scrittura dell'inconscio. La sua ricerca si colloca in quella linea di continuità che lega l'informale storico alle più recenti sperimentazioni contemporanee, portando avanti un discorso artistico che unisce tradizione e innovazione in una sintesi originale e potente.`,
    order_index: 3,
    is_visible: 1
  },
  {
    name: 'Marco Botti',
    role: 'Giornalista Culturale',
    text: `Seguire il percorso artistico di Adele Lo Feudo significa assistere a una continua evoluzione creativa che non conosce compromessi. Ogni nuova mostra rappresenta un capitolo di una narrazione visiva che si arricchisce costantemente di nuovi elementi, senza mai perdere la sua identità profonda. L'artista ha il coraggio di mettersi in gioco, di sperimentare, di osare. Le sue opere sono cronache visuali del nostro tempo, testimonianze di un'epoca complessa che l'artista sa interpretare con lucidità e passione. Il suo lavoro rappresenta un punto di riferimento importante nel panorama dell'arte contemporanea italiana.`,
    order_index: 4,
    is_visible: 1
  },
  {
    name: 'Helen Pankhurst',
    role: 'Nipote di Emmeline Pankhurst, leader delle Suffragette',
    text: `L'arte di Adele Lo Feudo incarna lo spirito di resistenza e libertà che ha sempre caratterizzato le grandi battaglie per i diritti umani. Come mia nonna Emmeline combatteva per l'emancipazione femminile attraverso l'azione politica, così Adele combatte attraverso l'arte per l'affermazione della dignità umana in tutte le sue forme. Le sue opere sono manifesti visivi di libertà, che parlano un linguaggio universale di emancipazione e autodeterminazione. In ogni sua creazione riconosco quella stessa forza rivoluzionaria che ha animato le suffragette: la determinazione a non arrendersi mai nella ricerca della verità e della giustizia attraverso l'espressione creativa.`,
    order_index: 5,
    is_visible: 1
  },
  {
    name: 'Alessandra Boldreghini',
    role: "Assessore alla Cultura del Comune di Morro d'Alba",
    text: `L'incontro con l'arte di Adele Lo Feudo rappresenta sempre un momento di arricchimento culturale per le nostre comunità. La capacità dell'artista di dialogare con i territori, di interpretarne l'anima e di restituirla attraverso le sue opere, rende ogni sua esposizione un evento di particolare rilevanza. Le sue creazioni non sono solo oggetti d'arte, ma veri e propri ponti culturali che collegano tradizione e contemporaneità, locale e universale. Il Comune di Morro d'Alba è onorato di aver ospitato le sue opere, che hanno lasciato un segno indelebile nel tessuto culturale della nostra città.`,
    order_index: 6,
    is_visible: 1
  },
  {
    name: 'Donato Antonio Loscalzo',
    role: 'Poeta e Professore di Lingua e Letteratura Greca - Università di Perugia',
    text: `Nell'opera di Adele Lo Feudo ritrovo l'eco degli antichi miti greci, quella capacità di narrare l'universale attraverso il particolare che caratterizzava i grandi tragici. Come Eschilo e Sofocle esploravano le profondità dell'animo umano attraverso le vicende degli eroi, così Adele esplora la condizione umana contemporanea attraverso la materia pittorica. La sua arte possiede quella qualità catartica che i greci chiamavano κάθαρσις, la purificazione attraverso l'emozione estetica. Ogni sua opera è un poema visivo che parla il linguaggio eterno della poesia, trasformando il dolore in bellezza, il caos in armonia, l'effimero in eterno.`,
    order_index: 7,
    is_visible: 1
  },
  {
    name: 'Alessandra Primicerio',
    role: "Critico d'Arte",
    text: `La ricerca artistica di Adele Lo Feudo si distingue per la sua capacità di creare un linguaggio visivo personale e riconoscibile, che si nutre di riferimenti culturali molteplici senza mai perdere la sua originalità. L'artista ha sviluppato una poetica che unisce la forza del gesto all'intensità del colore, creando opere che sono al tempo stesso immediate nella loro comunicatività e complesse nella loro stratificazione semantica. Il suo lavoro si inserisce nel solco della grande tradizione dell'arte italiana, reinterpretandola con sensibilità contemporanea e proiettandola verso nuovi orizzonti espressivi.`,
    order_index: 8,
    is_visible: 1
  },
  {
    name: 'Emidio De Albentiis',
    role: 'Direttore Accademia Belle Arti "Pietro Vannucci" di Perugia',
    text: `Adele Lo Feudo rappresenta un esempio eccellente di come la formazione accademica possa coniugarsi con la ricerca sperimentale per dare vita a un linguaggio artistico maturo e consapevole. La sua opera dimostra una padronanza tecnica che si accompagna a una libertà espressiva conquistata attraverso anni di studio e sperimentazione. Come direttore dell'Accademia, vedo nel suo percorso artistico un modello per le nuove generazioni: la capacità di rispettare la tradizione mentre si esplora il nuovo, di dominare la tecnica senza esserne schiavi, di comunicare con il pubblico senza rinunciare alla profondità del messaggio artistico. Il suo contributo all'arte contemporanea è prezioso non solo per la qualità delle opere prodotte, ma anche per l'esempio di rigore e passione che offre agli artisti emergenti.`,
    order_index: 9,
    is_visible: 1
  }
];

console.log('Creazione comandi SQL per import critici...\n');

critics.forEach(critic => {
  const sql = `INSERT INTO critics (name, role, text, order_index, is_visible) VALUES ('${critic.name.replace(/'/g, "''")}', '${critic.role.replace(/'/g, "''")}', '${critic.text.replace(/'/g, "''")}', ${critic.order_index}, ${critic.is_visible});`;
  console.log(sql);
  console.log('');
});

console.log('✅ Copia questi comandi e eseguili con:\nwrangler d1 execute alf-portfolio-db --local --command "COMANDO_SQL"');
