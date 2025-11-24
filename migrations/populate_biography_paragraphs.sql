-- Populate biography paragraph fields with content split from text_it

UPDATE biography SET
  paragraph1_it = 'Nata a Cosenza nel 1967, Adele Lo Feudo – ALF – ha costruito il suo percorso artistico tra formazione accademica e ricerca personale. Dopo studi classici e una laurea in giurisprudenza, si trasferisce a Perugia dove la sua vita prende la strada dell''arte.',

  paragraph2_it = 'Diplomata interior designer e maestra d''arte, dal 2010 porta avanti un''intensa attività espositiva in Italia e all''estero. Le sue opere – caratterizzate da figure umane come finestre dell''anima – esplorano temi universali quali l''identità, la memoria e la condizione femminile, con particolare attenzione alle sfide che le artiste affrontano nel mondo dell''arte contemporanea.',

  paragraph3_it = 'Il suo debutto avviene nel 2010 con la mostra personale "Ali per volare" a Perugia, cui seguono numerose esposizioni in spazi prestigiosi tra Italia, Stati Uniti e Europa. Nel 2017 partecipa al Columbus Day Gala a New York, portando la sua arte oltreoceano. La sua produzione artistica si è evoluta attraverso serie tematiche che indagano la complessità dell''animo umano, dalle maschere sociali alla ricerca di autenticità.',

  paragraph4_it = 'Oltre alla pratica artistica, ALF è attivamente impegnata nel sociale. Ha curato e partecipato al progetto "Un petalo rosa", un''iniziativa collettiva che ha riunito 65 artiste donne per sensibilizzare contro la violenza di genere. Questo impegno riflette la sua visione dell''arte come strumento di dialogo e trasformazione sociale, capace di dare voce alle esperienze e alle lotte delle donne nel panorama culturale contemporaneo.',

  content_version = content_version + 1,
  updated_at = datetime('now')
WHERE id = 1;
