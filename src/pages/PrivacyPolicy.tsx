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
                  Questo sito utilizza tecnologie di archiviazione locale (localStorage) esclusivamente per:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Preferenza lingua:</strong> Salvare la lingua scelta dall'utente per migliorare l'esperienza di navigazione</li>
                  <li><strong>Stato interfaccia:</strong> Memorizzare preferenze tecniche necessarie per il corretto funzionamento del sito</li>
                </ul>
                <p className="mt-4">
                  <strong>Importante:</strong> Questi dati sono memorizzati esclusivamente nel browser dell'utente e non vengono trasmessi a server esterni o terze parti. L'utente può cancellarli in qualsiasi momento attraverso le impostazioni del proprio browser.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Finalità del Trattamento</h2>
                <p className="mb-4">
                  I dati memorizzati localmente sono utilizzati per le seguenti finalità:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Personalizzazione dell'interfaccia in base alla lingua scelta</li>
                  <li>Miglioramento dell'esperienza utente durante la navigazione</li>
                  <li>Funzionamento tecnico ottimale del sito</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Base Giuridica del Trattamento</h2>
                <p className="mb-4">
                  Il trattamento dei dati si basa su:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Interesse legittimo:</strong> L'archiviazione locale delle preferenze è strettamente necessaria per fornire i servizi richiesti dall'utente e migliorare l'usabilità del sito</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Cookie e Tecnologie di Tracciamento</h2>
                <p className="mb-4">
                  Questo sito <strong>non utilizza cookie</strong> né tecnologie di tracciamento di terze parti. Non vengono raccolti dati per finalità di profilazione o marketing.
                </p>
                <p className="mb-4">
                  Utilizza esclusivamente localStorage (archiviazione locale del browser) per memorizzare preferenze tecniche essenziali. Queste informazioni rimangono sul dispositivo dell'utente e non sono accessibili da server esterni.
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
                  Le preferenze memorizzate in localStorage rimangono salvate nel browser dell'utente fino a quando:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>L'utente cancella manualmente i dati del browser</li>
                  <li>L'utente cancella la cache e i dati del sito</li>
                  <li>Il browser viene disinstallato</li>
                </ul>
                <p className="mt-4">
                  Non essendoci server che memorizzano dati personali, non esistono policy di conservazione lato server.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Comunicazione e Diffusione dei Dati</h2>
                <p className="mb-4">
                  I dati memorizzati in localStorage <strong>non vengono mai trasmessi</strong> a server esterni o terze parti. Rimangono esclusivamente sul dispositivo dell'utente.
                </p>
                <p className="mb-4">
                  Il sito è ospitato su Cloudflare Pages, ma il provider di hosting non ha accesso ai dati memorizzati localmente nel browser dell'utente.
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
                  This website uses local storage technologies (localStorage) exclusively for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Language preference:</strong> To save the language chosen by the user to improve the browsing experience</li>
                  <li><strong>Interface state:</strong> To store technical preferences necessary for the proper functioning of the site</li>
                </ul>
                <p className="mt-4">
                  <strong>Important:</strong> This data is stored exclusively in the user's browser and is not transmitted to external servers or third parties. Users can delete it at any time through their browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Purpose of Processing</h2>
                <p className="mb-4">
                  Locally stored data is used for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Interface personalization based on chosen language</li>
                  <li>Improving user experience during browsing</li>
                  <li>Optimal technical functioning of the site</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Legal Basis for Processing</h2>
                <p className="mb-4">
                  Data processing is based on:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Legitimate interest:</strong> Local storage of preferences is strictly necessary to provide the services requested by the user and improve site usability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking Technologies</h2>
                <p className="mb-4">
                  This website <strong>does not use cookies</strong> or third-party tracking technologies. No data is collected for profiling or marketing purposes.
                </p>
                <p className="mb-4">
                  It exclusively uses localStorage (local browser storage) to store essential technical preferences. This information remains on the user's device and is not accessible from external servers.
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
                  Preferences stored in localStorage remain saved in the user's browser until:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The user manually deletes browser data</li>
                  <li>The user clears the site's cache and data</li>
                  <li>The browser is uninstalled</li>
                </ul>
                <p className="mt-4">
                  Since there are no servers storing personal data, there are no server-side retention policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Data Communication and Disclosure</h2>
                <p className="mb-4">
                  Data stored in localStorage <strong>is never transmitted</strong> to external servers or third parties. It remains exclusively on the user's device.
                </p>
                <p className="mb-4">
                  The site is hosted on Cloudflare Pages, but the hosting provider does not have access to data stored locally in the user's browser.
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
