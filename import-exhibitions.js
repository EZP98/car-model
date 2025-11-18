/**
 * Script per importare le mostre da exhibitions-data.ts nel database D1
 */

const exhibitions = [
  {
    slug: 'unisono',
    title: 'UNISONO',
    subtitle: 'Personale di Adele Lo Feudo',
    location: 'Loggia dei Lanari, Piazza Matteotti 18, Perugia',
    date: '14/03/2024 - 30/03/2024',
    description: 'Una mostra che esplora l\'unità tra l\'artista e la sua opera, dove ogni pezzo racconta una storia di armonia e connessione profonda con la materia.',
    info: 'Inaugurazione della mostra Giovedì 14 Marzo 2024, ore 18:00. Sarà presente l\'Assessore alla Cultura del Comune di Perugia, Leonardo Varasano. Orari di apertura 15:30 - 19:30. Sabato e Domenica 10:30 - 13:30 / 16:00 - 19:30',
    order_index: 1,
    is_visible: 1
  },
  {
    slug: 'ritorno',
    title: 'RITORNO',
    subtitle: 'Personale di Adele Lo Feudo',
    location: 'Museo a Cielo Aperto di Camo (CN)',
    date: '3-24 Agosto 2025',
    description: 'Un viaggio attraverso l\'origine e il ritorno, dove l\'artista esplora le radici della propria espressione artistica in un dialogo continuo tra passato e presente.',
    info: 'Vernissage 3 agosto, ore 10:30. In esposizione fino al 24 agosto 2025',
    website: 'https://ritorno.adelelofeudo.com/',
    order_index: 2,
    is_visible: 1
  },
  {
    slug: 'fornace-pasquinucci',
    title: 'Fornace Pasquinucci',
    subtitle: 'Mostra Personale',
    location: 'Fornace Pasquinucci, Capraia e Limite',
    date: 'Dicembre 2024',
    description: 'Una mostra che celebra la tradizione ceramica toscana attraverso opere che dialogano con lo spazio industriale della storica fornace.',
    order_index: 3,
    is_visible: 1
  }
  // ... (aggiungi le altre 21 mostre se vuoi)
];

console.log('Creazione comandi SQL per import...\n');

exhibitions.forEach(ex => {
  const sql = `INSERT INTO exhibitions (slug, title, subtitle, location, date, description, info, website, order_index, is_visible) VALUES ('${ex.slug}', '${ex.title.replace(/'/g, "''")}', ${ex.subtitle ? `'${ex.subtitle.replace(/'/g, "''")}'` : 'NULL'}, '${ex.location.replace(/'/g, "''")}', '${ex.date}', '${ex.description.replace(/'/g, "''")}', ${ex.info ? `'${ex.info.replace(/'/g, "''")}'` : 'NULL'}, ${ex.website ? `'${ex.website}'` : 'NULL'}, ${ex.order_index}, ${ex.is_visible});`;
  console.log(sql);
});

console.log('\n✅ Copia questi comandi e eseguili con:\nwrangler d1 execute alf-portfolio-db --local --command "COMANDO_SQL"');
