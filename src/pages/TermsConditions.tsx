import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../i18n/LanguageContext';

const TermsConditions: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{language === 'it' ? 'Termini e Condizioni - Adele Lo Feudo' : 'Terms and Conditions - Adele Lo Feudo'}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto py-32 px-6">
        {language === 'it' ? (
          <>
            <h1 className="text-4xl font-bold text-white mb-12 uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Termini e Condizioni
            </h1>

            <div className="space-y-8 text-white/90" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <section>
                <p className="text-sm text-white/60 mb-8">Ultimo aggiornamento: 18/11/2025</p>

                <h2 className="text-2xl font-bold text-white mb-4">1. Oggetto</h2>
                <p className="mb-4">
                  I presenti Termini e Condizioni regolano l'utilizzo del sito web dedicato all'artista Adele Lo Feudo (di seguito "il Sito").
                  L'accesso e l'utilizzo del Sito comportano l'accettazione dei presenti Termini e Condizioni.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Proprietà Intellettuale</h2>
                <p className="mb-4">
                  Tutti i contenuti presenti sul Sito, inclusi testi, immagini, fotografie di opere d'arte, grafiche, loghi, video e qualsiasi altro materiale, sono di proprietà esclusiva di Adele Lo Feudo o dei rispettivi autori e sono protetti dalle leggi sul diritto d'autore e sulla proprietà intellettuale.
                </p>
                <p className="mb-4">
                  È vietata qualsiasi forma di riproduzione, distribuzione, modifica, pubblicazione o utilizzo commerciale dei contenuti senza esplicita autorizzazione scritta del titolare.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Utilizzo del Sito</h2>
                <p className="mb-4">
                  Il Sito ha finalità informative e promozionali relativamente alle opere e alle attività artistiche di Adele Lo Feudo. L'utente si impegna a:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Utilizzare il Sito in conformità alla legge e ai presenti Termini</li>
                  <li>Non utilizzare il Sito per scopi illeciti o non autorizzati</li>
                  <li>Non violare i diritti di proprietà intellettuale</li>
                  <li>Non danneggiare, disabilitare o compromettere il funzionamento del Sito</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Collegamenti a Siti Terzi</h2>
                <p className="mb-4">
                  Il Sito può contenere collegamenti a siti web di terze parti. Adele Lo Feudo non è responsabile per il contenuto, la privacy policy o le pratiche di tali siti esterni.
                  L'accesso a siti terzi avviene a esclusivo rischio dell'utente.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Limitazione di Responsabilità</h2>
                <p className="mb-4">
                  Il Sito è fornito "così com'è" senza alcuna garanzia, esplicita o implicita. Adele Lo Feudo non garantisce che:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Il Sito sarà sempre disponibile, ininterrotto o privo di errori</li>
                  <li>Le informazioni pubblicate siano sempre complete, accurate o aggiornate</li>
                  <li>I difetti saranno corretti tempestivamente</li>
                </ul>
                <p className="mt-4">
                  Adele Lo Feudo non sarà responsabile per danni diretti, indiretti, incidentali o consequenziali derivanti dall'uso o dall'impossibilità di utilizzare il Sito.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Richieste di Informazioni sulle Opere</h2>
                <p className="mb-4">
                  Per informazioni su opere, prezzi, disponibilità o commissioni, gli interessati possono contattare direttamente l'artista all'indirizzo: <a href="mailto:adelelofeudo@gmail.com" className="text-accent hover:underline">adelelofeudo@gmail.com</a>
                </p>
                <p className="mb-4">
                  Le immagini delle opere presenti sul Sito sono fornite esclusivamente a scopo illustrativo. I colori e i dettagli potrebbero variare rispetto all'opera originale.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Modifiche ai Termini</h2>
                <p className="mb-4">
                  Adele Lo Feudo si riserva il diritto di modificare i presenti Termini e Condizioni in qualsiasi momento.
                  Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.
                  L'uso continuato del Sito dopo la pubblicazione delle modifiche costituisce accettazione dei nuovi Termini.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Legge Applicabile e Foro Competente</h2>
                <p className="mb-4">
                  I presenti Termini e Condizioni sono regolati dalla legge italiana.
                  Per qualsiasi controversia relativa all'interpretazione, esecuzione o validità dei presenti Termini sarà competente il Foro di Perugia.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Contatti</h2>
                <p className="mb-4">
                  Per qualsiasi informazione o richiesta relativa ai presenti Termini e Condizioni, è possibile contattare:
                </p>
                <ul className="list-none space-y-2 ml-4">
                  <li><strong>Adele Lo Feudo</strong></li>
                  <li>Perugia, Italia</li>
                  <li>Email: <a href="mailto:adelelofeudo@gmail.com" className="text-accent hover:underline">adelelofeudo@gmail.com</a></li>
                </ul>
              </section>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-white mb-12 uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Terms and Conditions
            </h1>

            <div className="space-y-8 text-white/90" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <section>
                <p className="text-sm text-white/60 mb-8">Last updated: 11/18/2025</p>

                <h2 className="text-2xl font-bold text-white mb-4">1. Purpose</h2>
                <p className="mb-4">
                  These Terms and Conditions govern the use of the website dedicated to artist Adele Lo Feudo (hereinafter "the Site").
                  Access to and use of the Site constitutes acceptance of these Terms and Conditions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Intellectual Property</h2>
                <p className="mb-4">
                  All content on the Site, including texts, images, photographs of artworks, graphics, logos, videos, and any other material, is the exclusive property of Adele Lo Feudo or their respective authors and is protected by copyright and intellectual property laws.
                </p>
                <p className="mb-4">
                  Any form of reproduction, distribution, modification, publication, or commercial use of the content without explicit written authorization from the owner is prohibited.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Use of the Site</h2>
                <p className="mb-4">
                  The Site serves informational and promotional purposes regarding Adele Lo Feudo's artworks and artistic activities. Users agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the Site in compliance with the law and these Terms</li>
                  <li>Not use the Site for unlawful or unauthorized purposes</li>
                  <li>Not violate intellectual property rights</li>
                  <li>Not damage, disable, or compromise the functioning of the Site</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Links to Third-Party Sites</h2>
                <p className="mb-4">
                  The Site may contain links to third-party websites. Adele Lo Feudo is not responsible for the content, privacy policies, or practices of such external sites.
                  Access to third-party sites is at the user's sole risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                <p className="mb-4">
                  The Site is provided "as is" without any warranty, express or implied. Adele Lo Feudo does not guarantee that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The Site will always be available, uninterrupted, or error-free</li>
                  <li>Published information will always be complete, accurate, or up-to-date</li>
                  <li>Defects will be corrected promptly</li>
                </ul>
                <p className="mt-4">
                  Adele Lo Feudo shall not be liable for any direct, indirect, incidental, or consequential damages arising from use or inability to use the Site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Artwork Inquiries</h2>
                <p className="mb-4">
                  For information about artworks, pricing, availability, or commissions, interested parties may contact the artist directly at: <a href="mailto:adelelofeudo@gmail.com" className="text-accent hover:underline">adelelofeudo@gmail.com</a>
                </p>
                <p className="mb-4">
                  Images of artworks on the Site are provided for illustrative purposes only. Colors and details may vary from the original artwork.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
                <p className="mb-4">
                  Adele Lo Feudo reserves the right to modify these Terms and Conditions at any time.
                  Changes will be published on this page with the date of last update indicated.
                  Continued use of the Site after publication of changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Governing Law and Jurisdiction</h2>
                <p className="mb-4">
                  These Terms and Conditions are governed by Italian law.
                  For any dispute relating to the interpretation, execution, or validity of these Terms, the Court of Perugia shall have jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Contact</h2>
                <p className="mb-4">
                  For any information or request regarding these Terms and Conditions, please contact:
                </p>
                <ul className="list-none space-y-2 ml-4">
                  <li><strong>Adele Lo Feudo</strong></li>
                  <li>Perugia, Italy</li>
                  <li>Email: <a href="mailto:adelelofeudo@gmail.com" className="text-accent hover:underline">adelelofeudo@gmail.com</a></li>
                </ul>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TermsConditions;
