# Windsurf Coding Assistant – Projekt Dokumentation

## Überblick

Der **Windsurf Coding Assistant** ist ein spezialisiertes System, das die unternehmerische Entscheidungsfindung und Bewertung von Projektideen in einem IT-Startup-Umfeld unterstützt. Der Assistent integriert moderne Bewertungstechniken wie **RICE** und **ROI**, um datenbasierte Empfehlungen für kurzfristigen, mittelfristigen und langfristigen Erfolg zu liefern. Bestehende Projekte und Ressourcen werden aus einer lokalen JSON-Datenbank bezogen, und die Ergebnisse werden in einem Next.js Dashboard visualisiert.

## Komponenten

### 1. System Prompt (.windsurfrules)

Die Datei `.windsurfrules` definiert:
- **Rolle und Aufgaben des Assistenten:**  
  Der Assistant agiert als unternehmerischer Berater, der die Denkweise von Influencern wie Alex Hormozi und Y Combinator-Startups verkörpert.
- **Bewertungsmetriken:**  
  - **RICE:** Reach, Impact, Confidence, Effort  
  - **ROI:** Startinvestition, monatliche Zeitersparnis, laufende Kosten, geschätzter Umsatz  
  - **Time to Market:** Maximale Tage bis zur Markteinführung  
  - **Synergie:** Bewertung der Synergieeffekte mit bestehenden Projekten  
- **Evaluation Prioritäten:**  
  - Kurzfristige Erfolge mit mittelfristigen Synergie-Vorteilen  
  - Langfristiger unternehmerischer Erfolg

### 2. JSON Schema Dateien

#### a) Resources Schema (resources.schema.json)

Dieses Schema beschreibt die Struktur der lokalen Datenbank, die alle existierenden Projekte und Ressourcen enthält:
- **Projekte:**  
  Jedes Projekt enthält eine ID, Name, RICE- und ROI-Metriken, Time to Market sowie Synergie-Score.
- **Ressourcen:**  
  Verfügbare Zeit (z. B. Stunden/Woche) und Budget (in Euro).

#### b) Evaluation Output Schema (evaluation.schema.json)

Dieses Schema definiert den strukturierten Output, der nach der Bewertung eines Projekts generiert wird:
- **Projekt ID & Evaluationsdatum**
- **Metriken:**  
  Detaillierte Werte für RICE, ROI, Time to Market, Synergie und ein Gesamtscore.
- **Empfehlungen:**  
  Konkrete Empfehlungen für kurzfristige, mittelfristige und langfristige Maßnahmen.

### 3. Next.js Dashboard

Das Dashboard visualisiert die Evaluationsdaten in Echtzeit. Es umfasst:
- **API-Endpunkte:**  
  Zur Bereitstellung des Evaluationsoutputs (BJSON) an das Frontend.
- **Interaktive Visualisierungen:**  
  Diagramme und Score-Anzeigen zur Darstellung der Kennzahlen.
- **Schnelles lokales Deployment:**  
  Optimiert für eine schnelle lokale Entwicklungsumgebung, z. B. mittels Docker oder Vercel CLI.

## Arbeitsablauf

1. **Eingabe:**  
   Thomas gibt neue Projektideen im Windsurf Interface ein.  
2. **Evaluierung:**  
   Die Eingaben werden anhand der Regeln in `.windsurfrules` verarbeitet, wobei RICE-, ROI- und weitere Metriken berechnet werden.  
3. **Datenintegration:**  
   Die Ergebnisse werden als BJSON Datei ausgegeben und in die bestehende lokale JSON-Datenbank integriert.  
4. **Visualisierung:**  
   Das Next.js Dashboard ruft die aktuellen Bewertungsdaten ab und stellt diese interaktiv dar.  
5. **Dokumentation & Erweiterung:**  
   Jede Änderung und Erweiterung der Bewertungslogik wird dokumentiert und fließt in zukünftige Versionen ein.

## Weiterführende Ressourcen

- [Alex Hormozi](https://www.alexhormozi.com)
- [Y Combinator](https://www.ycombinator.com)
- [RICE Framework Erklärung (Intercom)](https://www.intercom.com/blog/rice-simple-prioritization-framework-for-product-managers)
- [ROI Grundlagen (Corporate Finance Institute)](https://corporatefinanceinstitute.com/resources/knowledge/valuation/return-on-investment-roi/)
- [Next.js Dokumentation](https://nextjs.org/docs)

## Weiteres Vorgehen

1. **Prototypenentwicklung:**  
   Integration der Module (Eingabeformular, Evaluationslogik, JSON-Datenbank, Dashboard) in einem isolierten Testsystem.
2. **Test und Feedback:**  
   Simulierte Projektinputs evaluieren und die Bewertungsalgorithmen anhand von Feedback optimieren.
3. **Erweiterung der Bewertungslogik:**  
   Fortlaufende Anpassung und Erweiterung der `.windsurfrules` und JSON-Schemata basierend auf neuen Erkenntnissen.
4. **Deployment:**  
   Einrichtung eines robusten, lokal deploybaren Setups zur schnellen Iteration und Verbesserung des Systems.

---

Diese Dokumentation dient als umfassender Leitfaden für die Entwicklung, den Betrieb und die zukünftige Erweiterung des Windsurf Coding Assistant.
  
---

Mit diesen finalen Dateien steht der Grundstein für ein flexibles, dynamisches und datengesteuertes Bewertungssystem, das Thomas dabei unterstützt, fundierte unternehmerische Entscheidungen zu treffen.