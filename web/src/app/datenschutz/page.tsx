import React from 'react';
import { Footer } from '@/components/layout/Footer';

export default function DatenschutzPage() {
  return (
    <>
      <main className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
        <h1 className="text-3xl font-bold text-navy mb-8">Datenschutzerklärung</h1>
        
        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-lg font-medium text-navy mb-2">Allgemeine Hinweise</h3>
            <p className="text-navy/80 mb-4">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
              wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert 
              werden können.
            </p>
            
            <h3 className="text-lg font-medium text-navy mb-2">Datenerfassung auf dieser Website</h3>
            <p className="text-navy/80 mb-4">
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem 
              Impressum dieser Website entnehmen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">2. Verantwortliche Stelle</h2>
            <p className="text-navy/80 mb-4">
              Libra Innovation FlexCo<br />
              Adamgasse 23<br />
              6020 Innsbruck<br />
              Österreich<br /><br />
              Tel.: +49 176 577 16 229<br />
              Email: <a href="mailto:contact@libralab.ai" className="text-copper hover:underline">contact@libralab.ai</a>
            </p>
            
            <p className="text-navy/80 mb-4">
              Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die 
              Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">3. Datenschutzbeauftragter</h2>
            <p className="text-navy/80 mb-4">
              Gesetzlich vorgeschriebener Datenschutzbeauftragter:<br />
              Thomas Seiger<br />
              Email: <a href="mailto:privacy@libralab.ai" className="text-copper hover:underline">privacy@libralab.ai</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">4. Datenerfassung auf unserer Website</h2>
            
            <h3 className="text-lg font-medium text-navy mb-2">Cookies</h3>
            <p className="text-navy/80 mb-4">
              Unsere Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden 
              an und enthalten keine Viren. Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer 
              zu machen.
            </p>

            <h3 className="text-lg font-medium text-navy mb-2">Server-Log-Dateien</h3>
            <p className="text-navy/80 mb-4">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die 
              Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul className="list-disc list-inside text-navy/80 mb-4 ml-4">
              <li>Browsertyp und Browserversion</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">5. Analyse-Tools und Werbung</h2>
            <p className="text-navy/80 mb-4">
              Wir nutzen verschiedene Analyse-Tools, um die Nutzung unserer Website auszuwerten. Die daraus gewonnenen Daten 
              werden genutzt, um unsere Website zu optimieren.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">6. Newsletter</h2>
            <p className="text-navy/80 mb-4">
              Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse 
              sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind 
              und mit dem Empfang des Newsletters einverstanden sind.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">7. Plugins und Tools</h2>
            <p className="text-navy/80 mb-4">
              Wir setzen verschiedene Plugins und Tools ein, um die Funktionalität unserer Website zu erweitern. Die Details 
              zu den einzelnen Plugins und Tools sowie deren Datenschutzbestimmungen finden Sie in den jeweiligen Abschnitten.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-4">8. Ihre Rechte</h2>
            <p className="text-navy/80 mb-4">
              Sie haben das Recht:
            </p>
            <ul className="list-disc list-inside text-navy/80 mb-4 ml-4">
              <li>Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten zu verlangen</li>
              <li>Die Berichtigung unrichtiger Daten zu verlangen</li>
              <li>Die Löschung Ihrer bei uns gespeicherten Daten zu verlangen</li>
              <li>Die Einschränkung der Datenverarbeitung zu verlangen</li>
              <li>Der Datenverarbeitung zu widersprechen</li>
              <li>Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten</li>
            </ul>
          </div>

          <div className="pt-8">
            <p className="text-navy/80 italic">
              Stand: März 2025
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
