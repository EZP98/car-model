import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../i18n/LanguageContext';

const PrivacyPolicy: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{language === 'it' ? 'Privacy Policy - Adele Lo Feudo' : 'Privacy Policy - Adele Lo Feudo'}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto py-32 px-6">
        {language === 'it' ? (
          <>
            <h1 className="text-4xl font-bold text-white mb-12 uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Privacy Policy
            </h1>

            <div className="space-y-8 text-white/90" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <section>
                <p className="text-sm text-white/60 mb-8">Ultimo aggiornamento: 18/11/2025</p>

                <h2 className="text-2xl font-bold text-white mb-4">1. Titolare del Trattamento</h2>
                <p className="mb-4">
                  Il Titolare del trattamento dei dati personali è:
                </p>
                <ul className="list-none space-y-2 ml-4">
                  <li><strong>Nome:</strong> Adele Lo Feudo</li>
                  <li><strong>Sede:</strong> Perugia, Italia</li>
                  <li><strong>Email:</strong> adelelofeudo@gmail.com</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Tipologie di Dati Raccolti</h2>
                <p className="mb-4">
                  Questo sito raccoglie i seguenti dati personali:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Dati di navigazione:</strong> Cookie tecnici e di analytics per migliorare l'esperienza utente</li>
                  <li><strong>Newsletter:</strong> Indirizzo email fornito volontariamente per ricevere aggiornamenti su mostre ed eventi</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Finalità del Trattamento</h2>
                <p className="mb-4">
                  I dati personali sono raccolti e trattati per le seguenti finalità:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Invio di newsletter e comunicazioni relative a mostre, eventi e opere disponibili</li>
                  <li>Analisi statistiche anonime per migliorare il sito</li>
                  <li>Rispetto degli obblighi di legge</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Base Giuridica del Trattamento</h2>
                <p className="mb-4">
                  Il trattamento dei dati si basa su:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Consenso:</strong> Per l'invio della newsletter</li>
                  <li><strong>Interesse legittimo:</strong> Per l'analisi statistica e il miglioramento del sito</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Cookie</h2>
                <p className="mb-4">
                  Questo sito utilizza cookie tecnici necessari per il corretto funzionamento del sito. In futuro potrebbero essere implementati cookie analitici, per i quali verrà richiesto il consenso secondo la normativa vigente.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Modalità del Trattamento</h2>
                <p className="mb-4">
                  I dati personali sono trattati con strumenti informatici e telematici, con logiche strettamente correlate alle finalità indicate e comunque in modo da garantire la sicurezza e la riservatezza dei dati stessi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Periodo di Conservazione</h2>
                <p className="mb-4">
                  I dati personali saranno conservati per il tempo necessario a perseguire le finalità indicate, salvo diversi obblighi di legge. I dati della newsletter saranno conservati fino alla richiesta di cancellazione da parte dell'interessato.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Comunicazione e Diffusione dei Dati</h2>
                <p className="mb-4">
                  I dati personali non saranno diffusi e potranno essere comunicati solo a soggetti terzi per finalità strettamente connesse alle finalità del trattamento (es. provider di hosting), che operano come responsabili del trattamento.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Diritti dell'Interessato</h2>
                <p className="mb-4">
                  Ai sensi del Regolamento UE 2016/679 (GDPR), l'interessato ha il diritto di:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accedere ai propri dati personali</li>
                  <li>Rettificare dati inesatti</li>
                  <li>Cancellare i propri dati (diritto all'oblio)</li>
                  <li>Limitare il trattamento</li>
                  <li>Opporsi al trattamento</li>
                  <li>Richiedere la portabilità dei dati</li>
                  <li>Revocare il consenso in qualsiasi momento</li>
                  <li>Proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali</li>
                </ul>
                <p className="mt-4">
                  Per esercitare i propri diritti, l'interessato può contattare il Titolare all'indirizzo: <a href="mailto:adelelofeudo@gmail.com" className="text-accent hover:underline">adelelofeudo@gmail.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Modifiche alla Privacy Policy</h2>
                <p className="mb-4">
                  Il Titolare si riserva il diritto di modificare questa Privacy Policy in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.
                </p>
              </section>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-white mb-12 uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Privacy Policy
            </h1>

            <div className="space-y-8 text-white/90" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <section>
                <p className="text-sm text-white/60 mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

                <h2 className="text-2xl font-bold text-white mb-4">1. Data Controller</h2>
                <p className="mb-4">
                  The Data Controller is:
                </p>
                <ul className="list-none space-y-2 ml-4">
                  <li><strong>Name:</strong> Adele Lo Feudo</li>
                  <li><strong>Location:</strong> Perugia, Italy</li>
                  <li><strong>Email:</strong> adelelofeudo@gmail.com</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Types of Data Collected</h2>
                <p className="mb-4">
                  This website collects the following personal data:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Browsing data:</strong> Technical and analytics cookies to improve user experience</li>
                  <li><strong>Newsletter:</strong> Email address voluntarily provided to receive updates about exhibitions and events</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Purpose of Processing</h2>
                <p className="mb-4">
                  Personal data is collected and processed for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Sending newsletters and communications about exhibitions, events, and available artworks</li>
                  <li>Anonymous statistical analysis to improve the website</li>
                  <li>Compliance with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Legal Basis for Processing</h2>
                <p className="mb-4">
                  Data processing is based on:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Consent:</strong> For newsletter subscriptions</li>
                  <li><strong>Legitimate interest:</strong> For statistical analysis and website improvement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Cookies</h2>
                <p className="mb-4">
                  This website uses technical cookies necessary for proper functioning. Analytics cookies may be implemented in the future, for which consent will be requested according to applicable regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Processing Methods</h2>
                <p className="mb-4">
                  Personal data is processed using IT and telematic tools, with logic strictly related to the stated purposes and in a manner that ensures data security and confidentiality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Retention Period</h2>
                <p className="mb-4">
                  Personal data will be retained for as long as necessary to fulfill the stated purposes, unless otherwise required by law. Newsletter data will be retained until the data subject requests deletion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Data Communication and Disclosure</h2>
                <p className="mb-4">
                  Personal data will not be disclosed and may only be communicated to third parties for purposes strictly connected to processing purposes (e.g., hosting providers), who operate as data processors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Data Subject Rights</h2>
                <p className="mb-4">
                  Under EU Regulation 2016/679 (GDPR), data subjects have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access their personal data</li>
                  <li>Rectify inaccurate data</li>
                  <li>Delete their data (right to be forgotten)</li>
                  <li>Restrict processing</li>
                  <li>Object to processing</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent at any time</li>
                  <li>Lodge a complaint with the Data Protection Authority</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact the Data Controller at: <a href="mailto:adelelofeudo@gmail.com" className="text-accent hover:underline">adelelofeudo@gmail.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Privacy Policy</h2>
                <p className="mb-4">
                  The Data Controller reserves the right to modify this Privacy Policy at any time. Changes will be published on this page with the date of last update indicated.
                </p>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
