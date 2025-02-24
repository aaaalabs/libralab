import React from 'react';

export default function ImpressumPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold text-navy mb-8">Impressum</h1>
      
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">Unternehmensangaben</h2>
          <p className="text-navy/80">
            Libra Innovation FlexCo<br />
            Adamgasse 23<br />
            6020 Innsbruck<br />
            Österreich
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">Kontakt</h2>
          <p className="text-navy/80">
            Tel.: +49 176 577 16 229<br />
            Email: <a href="mailto:contact@libralab.ai" className="text-copper hover:underline">contact@libralab.ai</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">Geschäftsführung</h2>
          <p className="text-navy/80">
            Thomas & Stefan Seiger
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">Gewerberechtlicher Geschäftsführer</h2>
          <p className="text-navy/80">
            Hr. Stefan Seiger
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">Firmendaten</h2>
          <p className="text-navy/80">
            Firmenbuchnummer: FN503145w<br />
            USt.ID: ATU74236828<br />
            Steuernummer: 81 417/7937<br />
            Gerichtsstand: LG Innsbruck
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">Behördliche Aufsicht</h2>
          <p className="text-navy/80">
            Behörde: Magistrat der Stadt Innsbruck<br />
            Gewerbe: Dienstleistungen in der automatischen Datenverarbeitung und Informationstechnik
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">Bürostandort</h2>
          <p className="text-navy/80">
            Kristeneben 49<br />
            6094 Kristen
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">Datenschutzbeauftragter</h2>
          <p className="text-navy/80">
            Thomas Seiger<br />
            Email: <a href="mailto:privacy@libralab.ai" className="text-copper hover:underline">privacy@libralab.ai</a>
          </p>
        </div>
      </section>
    </main>
  );
}
