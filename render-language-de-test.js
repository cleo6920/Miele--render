(function(){
'use strict';
const KEY='fda-render-language';
const IT='it', DE='de';
let lang=IT, busy=false, timer=null;
const originals=new WeakMap(), translated=new Set(), attrOriginals=new WeakMap();
let italianPreviewHtml=null;

const T={
"Centro di Alveoterapia Integrata - Castel d'Ario":"Zentrum für Integrierte Alveotherapie - Castel d'Ario",
"A Castel d'Ario (MN) nasce il Centro di Alveoterapia Integrata":"In Castel d'Ario (MN) entsteht das Zentrum für Integrierte Alveotherapie",
"ALVEOTERAPIA INTEGRATA":"INTEGRIERTE ALVEOTHERAPIE",
"Castel d'Ario · Mantova":"Castel d'Ario · Mantua",
"Il Centro":"Das Zentrum","Alveoterapia":"Alveotherapie","Bacheca":"Aktuelles","Chi siamo":"Über uns","Contatti":"Kontakt",
"Prodotti & Shop":"Produkte & Shop","SHOP 🛒":"SHOP 🛒","Nuova apertura":"Neueröffnung","A Castel d'Ario":"In Castel d'Ario",
"Centro di Alveoterapia Integrata":"Zentrum für Integrierte Alveotherapie","Nuova apertura · Castel d'Ario":"Neueröffnung · Castel d'Ario",
"Il primo Centro di":"Das erste Zentrum für","Alveoterapia Integrata":"Integrierte Alveotherapie",
"Un nuovo spazio dedicato al benessere dell'alveare, nel calore naturale del legno, con postazioni professionali e una selezione completa di mieli, prodotti dell'alveare e cosmesi naturale.":"Ein neuer Ort rund um die Welt des Bienenstocks, in der natürlichen Wärme von Holz, mit professionellen Plätzen sowie einer Auswahl an Honig, Bienenprodukten und Naturkosmetik.",
"Le sedute di Alveoterapia Integrata sono offerte gratuitamente dal Centro a chiunque desideri provarle.":"Die Sitzungen der Integrierten Alveotherapie werden vom Zentrum allen Interessierten kostenlos angeboten.",
"Scopri il Centro":"Zentrum entdecken","Entra nello Shop":"Zum Shop","Respira l'essenza dell'alveare":"Erlebe die Essenz des Bienenstocks",
"Uno spazio per vivere l’esperienza dell’alveare":"Ein Ort, um die Welt des Bienenstocks zu erleben",
"La struttura in legno ospita due postazioni dedicate e dispositivi professionali per la diffusione della propoli, in un ambiente raccolto e accogliente.":"Die Holzstruktur beherbergt zwei dafür vorgesehene Plätze und professionelle Geräte zur Propolis-Diffusion in einer ruhigen und einladenden Umgebung.",
"Sedute gratuite":"Kostenlose Sitzungen","Il Centro offre gratuitamente l'esperienza a chiunque desideri provarla.":"Das Zentrum bietet diese Erfahrung allen Interessierten kostenlos an.",
"Ambiente dedicato":"Eigener Bereich","Uno spazio protetto nel porticato di Via XX Settembre a Castel d'Ario.":"Ein geschützter Bereich unter dem Portikus in der Via XX Settembre in Castel d'Ario.",
"Due postazioni":"Zwei Plätze","Un'esperienza organizzata per garantire comfort, ordine e riservatezza.":"Eine organisierte Erfahrung mit Komfort, Ruhe und Privatsphäre.",
"Continuità anche a casa":"Auch zu Hause weiterführen","I prodotti dell'alveare accompagnano il percorso quotidiano di benessere.":"Bienenprodukte begleiten den Alltag auch zu Hause.",
"Come funziona":"So funktioniert es","Un sito, un centro, un ecosistema":"Eine Website, ein Zentrum, ein Ökosystem",
"Tutto il mondo dell'alveare, in un unico luogo":"Die ganze Welt des Bienenstocks an einem Ort",
"Informazione, esperienza nel centro fisico e acquisto online convivono nello stesso sito.":"Information, die Erfahrung im Zentrum und der Online-Einkauf sind auf derselben Website vereint.",
"Scopri la struttura, l'ambiente e il progetto di Castel d'Ario.":"Entdecke die Struktur, die Atmosphäre und das Projekt in Castel d'Ario.",
"Entra nel Centro →":"Zum Zentrum →","Scopri come si svolge una seduta: il servizio è offerto gratuitamente dal Centro.":"Erfahre, wie eine Sitzung abläuft: Das Angebot des Zentrums ist kostenlos.",
"Scopri il percorso →":"Ablauf entdecken →","Prodotti":"Produkte","Mieli, specialità, prodotti dell'alveare, cosmesi e linee BIO.":"Honig, Spezialitäten, Bienenprodukte, Kosmetik und BIO-Linien.",
"Vai allo Shop →":"Zum Shop →","Apertura, iniziative, aggiornamenti e novità del Centro.":"Eröffnung, Initiativen, Neuigkeiten und Aktualisierungen des Zentrums.",
"Leggi le novità →":"Neuigkeiten lesen →","L'e-commerce resta al centro":"Der Online-Shop bleibt zentral","Dal Centro alla tua casa":"Vom Zentrum zu dir nach Hause",
"Lo shop mantiene lo stesso catalogo già attivo: ricerca, categorie, schede prodotto, prezzi, quantità, carrello, spedizione e checkout restano invariati.":"Der Shop behält seinen vollständigen Katalog mit Suche, Kategorien, Produktseiten, Preisen, Mengen, Warenkorb, Versand und Checkout.",
"Apri il catalogo 🛒":"Katalog öffnen 🛒","Prodotti dell'alveare":"Bienenprodukte","Integratori e specialità BIO già presenti nello shop.":"BIO-Nahrungsergänzungen und Spezialitäten sind bereits im Shop verfügbar.",
"Mieli e specialità":"Honig und Spezialitäten","Dai mieli del Busatello ai mieli selezionati e preparati.":"Von Busatello-Honig bis zu ausgewählten Honigspezialitäten.",
"Cosmesi naturale":"Naturkosmetik","Prodotti a base di miele, propoli, aloe, pappa reale e polline.":"Produkte mit Honig, Propolis, Aloe, Gelée Royale und Pollen.",
"Dove trovarci":"Wo du uns findest","Il Centro a Castel d'Ario":"Das Zentrum in Castel d'Ario",
"Un progetto nato per valorizzare un porticato esistente trasformandolo in uno spazio dedicato al benessere dell'alveare.":"Ein Projekt, das einen bestehenden Portikus in einen Ort rund um die Welt des Bienenstocks verwandelt.",
"Informazioni e contatti":"Informationen und Kontakt","Centro di Castel d'Ario e shop online dedicato ai prodotti dell'alveare.":"Zentrum in Castel d'Ario und Online-Shop für Bienenprodukte.",
"Scopri":"Entdecken","Acquista":"Einkaufen","Home":"Startseite",
"Il progetto":"Das Projekt","Una struttura in legno inserita nel porticato di Via XX Settembre a Castel d'Ario, progettata per creare un ambiente dedicato all'alveoterapia integrata, con sedute offerte gratuitamente dal Centro.":"Eine Holzstruktur unter dem Portikus in der Via XX Settembre in Castel d'Ario, geschaffen für die Integrierte Alveotherapie; die Sitzungen werden vom Zentrum kostenlos angeboten.",
"La fabbrica delle api":"La Fabbrica delle Api","Il progetto valorizza il porticato esistente con una struttura lignea prefabbricata, inserita in modo funzionale e reversibile, senza perdere il rapporto con l'ambiente circostante.":"Das Projekt wertet den bestehenden Portikus mit einer funktionalen, reversiblen Holzstruktur auf und bewahrt dabei die Verbindung zur Umgebung.",
"Il Centro offre gratuitamente le sedute di Alveoterapia Integrata a chiunque desideri provarle.":"Das Zentrum bietet Sitzungen der Integrierten Alveotherapie allen Interessierten kostenlos an.",
"Castel d'Ario":"Castel d'Ario","Il Centro nasce in Via XX Settembre, in provincia di Mantova.":"Das Zentrum befindet sich in der Via XX Settembre in der Provinz Mantua.",
"Legno naturale":"Naturholz","L'ambiente è pensato per essere raccolto, ordinato e accogliente.":"Die Umgebung ist ruhig, geordnet und einladend gestaltet.",
"Lo spazio interno è organizzato per ospitare due postazioni dedicate.":"Der Innenraum ist für zwei eigene Plätze organisiert.",
"Uno spazio pensato per stare bene":"Ein Ort zum Wohlfühlen","Un ambiente raccolto e accogliente, dove vivere con tranquillità l'esperienza dell'Alveoterapia Integrata e concedersi un momento di benessere.":"Eine ruhige und einladende Umgebung, in der du die Integrierte Alveotherapie entspannt erleben kannst.",
"Un progetto integrato":"Ein integriertes Projekt","Il Centro non vive separato dallo shop: mieli, prodotti dell'alveare e cosmesi naturale rappresentano la continuità del percorso anche fuori dalla struttura.":"Zentrum und Shop gehören zusammen: Honig, Bienenprodukte und Naturkosmetik führen das Erlebnis auch außerhalb des Zentrums fort.",
"Scopri i prodotti →":"Produkte entdecken →",
"Sedute gratuite · Castel d'Ario":"Kostenlose Sitzungen · Castel d'Ario","Il Centro offre gratuitamente le sedute di Alveoterapia Integrata a chiunque desideri provarle, in un ambiente dedicato con diffusori professionali e capsule specifiche a base di propoli.":"Das Zentrum bietet die Sitzungen der Integrierten Alveotherapie kostenlos an, in einem eigenen Bereich mit professionellen Diffusoren und speziellen Propolis-Kapseln.",
"Un servizio del Centro":"Ein Angebot des Zentrums","Le sedute sono gratuite":"Die Sitzungen sind kostenlos",
"Vogliamo rendere l'esperienza accessibile: il Centro offre gratuitamente le sedute di Alveoterapia Integrata a chiunque desideri provarle.":"Wir möchten die Erfahrung zugänglich machen: Das Zentrum bietet die Sitzungen allen Interessierten kostenlos an.",
"Informazioni":"Informationen","Come si svolge":"Ablauf einer Sitzung","All'interno della struttura sono previste due postazioni. La persona si accomoda e utilizza il dispositivo dedicato alla diffusione della propoli attraverso il sistema previsto dal produttore.":"Im Inneren gibt es zwei Plätze. Die Person nimmt Platz und nutzt das dafür vorgesehene Gerät zur Propolis-Diffusion entsprechend dem System des Herstellers.",
"Il servizio è offerto gratuitamente dal Centro a chiunque desideri provare l'esperienza.":"Das Angebot ist für alle, die es ausprobieren möchten, kostenlos.",
"Ambiente raccolto":"Ruhige Umgebung","La struttura in legno è parte dell'esperienza e favorisce una permanenza tranquilla e ordinata.":"Die Holzstruktur ist Teil der Erfahrung und schafft eine ruhige, geordnete Atmosphäre.",
"Dispositivo professionale":"Professionelles Gerät","Il progetto prevede l'impiego di Propolair / Propoltherapy Professional.":"Zum Projekt gehört der Einsatz von Propolair / Propoltherapy Professional.",
"Capsule dedicate":"Spezielle Kapseln","Il sistema utilizza capsule compatibili specifiche per il diffusore.":"Das System verwendet speziell für den Diffusor geeignete Kapseln.",
"Il concetto di integrazione":"Das Konzept der Integration","Il Centro unisce esperienza nel luogo fisico e continuità quotidiana attraverso una selezione di prodotti dell'alveare disponibili anche nello shop online.":"Das Zentrum verbindet die Erfahrung vor Ort mit einer Auswahl an Bienenprodukten, die auch im Online-Shop erhältlich sind.",
"Vai ai prodotti →":"Zu den Produkten →","Informazione responsabile":"Verantwortungsvolle Information",
"Le informazioni presenti sul sito descrivono il progetto e l'esperienza proposta. Non sostituiscono diagnosi, indicazioni o trattamenti medici.":"Die Informationen auf dieser Website beschreiben das Projekt und die angebotene Erfahrung. Sie ersetzen keine medizinische Diagnose, Empfehlung oder Behandlung.",
"Aggiornamenti dal Centro":"Neuigkeiten aus dem Zentrum","Uno spazio semplice per seguire l'apertura, le novità, le iniziative e gli aggiornamenti del Centro.":"Hier findest du Informationen zur Eröffnung, Neuigkeiten, Initiativen und Aktualisierungen des Zentrums.",
"In evidenza":"Im Fokus","Nuova apertura a Castel d'Ario":"Neueröffnung in Castel d'Ario",
"Il progetto del nuovo Centro di Alveoterapia Integrata prende forma in Via XX Settembre 20/A. In questa pagina pubblicheremo gli aggiornamenti utili sull'apertura e sulle attività.":"Das neue Zentrum für Integrierte Alveotherapie entsteht in der Via XX Settembre 20/A. Hier veröffentlichen wir Informationen zur Eröffnung und zu den Aktivitäten.",
"Shop":"Shop","Il catalogo è già online":"Der Katalog ist bereits online","Mieli, prodotti dell'alveare, specialità e cosmesi naturale sono già consultabili nello shop integrato.":"Honig, Bienenprodukte, Spezialitäten und Naturkosmetik sind bereits im integrierten Shop verfügbar.",
"Apri il catalogo →":"Katalog öffnen →","Prossimi aggiornamenti":"Weitere Neuigkeiten",
"Questa bacheca potrà ospitare orari, giornate di presentazione, nuove linee di prodotto e comunicazioni del Centro senza modificare la struttura dell'e-commerce.":"Hier können Öffnungszeiten, Präsentationstage, neue Produktlinien und Mitteilungen des Zentrums veröffentlicht werden.",
"Le date e gli orari ufficiali di apertura verranno pubblicati quando saranno definiti.":"Die offiziellen Eröffnungstage und -zeiten werden veröffentlicht, sobald sie feststehen.",
"La nostra idea":"Unsere Idee","Un progetto che unisce cultura dell'alveare, prodotti selezionati e un nuovo spazio dedicato all'alveoterapia integrata.":"Ein Projekt, das die Welt des Bienenstocks, ausgewählte Produkte und einen neuen Ort für Integrierte Alveotherapie verbindet.",
"Dall'e-commerce al Centro":"Vom Online-Shop zum Zentrum","Lo shop nasce dalla selezione di mieli, specialità e prodotti dell'alveare. Con il Centro di Castel d'Ario questa esperienza si amplia: il sito diventa il punto di incontro tra informazione, luogo fisico e acquisto online.":"Der Shop entstand aus einer Auswahl von Honig, Spezialitäten und Bienenprodukten. Mit dem Zentrum in Castel d'Ario wird dieses Erlebnis erweitert: Die Website verbindet Information, den physischen Ort und den Online-Einkauf.",
"Territorio":"Region","Il progetto valorizza Castel d'Ario e le eccellenze legate all'Oasi del Busatello.":"Das Projekt stellt Castel d'Ario und die Besonderheiten rund um die Oasi del Busatello in den Mittelpunkt.",
"Alveare":"Bienenstock","Miele, propoli, polline, pappa reale, pane d'api e cosmesi naturale sono il filo conduttore dell'offerta.":"Honig, Propolis, Pollen, Gelée Royale, Bienenbrot und Naturkosmetik bilden den roten Faden des Angebots.",
"Continuità":"Kontinuität","Il Centro e lo shop sono due parti dello stesso percorso, non due attività separate.":"Zentrum und Shop sind zwei Teile desselben Weges und keine getrennten Aktivitäten.",
"Dove siamo":"Wo wir sind","Il Centro di Alveoterapia Integrata si trova a Castel d'Ario, in provincia di Mantova.":"Das Zentrum für Integrierte Alveotherapie befindet sich in Castel d'Ario in der Provinz Mantua.",
"Telefono":"Telefon","Email":"E-Mail","Per informazioni, disponibilità e modalità di accesso puoi contattarci telefonicamente oppure inviare un messaggio dal modulo qui sotto.":"Für Informationen, Verfügbarkeit und Zugangsmöglichkeiten kannst du uns telefonisch kontaktieren oder das Formular unten verwenden.",
"Scopri come si svolge →":"Ablauf entdecken →","Vai alla Bacheca →":"Zu den Neuigkeiten →","Messaggio inviato. Grazie, ti risponderemo appena possibile.":"Nachricht gesendet. Vielen Dank, wir antworten so bald wie möglich.",
"Contattaci direttamente":"Direkt kontaktieren","Invia un messaggio":"Nachricht senden","Compila i campi qui sotto. Il messaggio verrà inviato a":"Fülle die Felder aus. Die Nachricht wird gesendet an",
"Nome e cognome *":"Vor- und Nachname *","Email *":"E-Mail *","Messaggio *":"Nachricht *","Invia messaggio":"Nachricht senden",
"I dati inseriti vengono utilizzati esclusivamente per rispondere alla richiesta inviata.":"Die eingegebenen Daten werden ausschließlich zur Beantwortung deiner Anfrage verwendet.",
"Vuoi vedere i prodotti?":"Möchtest du die Produkte sehen?","Lo shop online resta sempre accessibile dal sito del Centro.":"Der Online-Shop ist jederzeit über die Website des Zentrums erreichbar.",
"Vai a Prodotti & Shop":"Zu Produkte & Shop",
"← Home Centro":"← Startseite Zentrum","Le linee della Fabbrica delle Api":"Die Produktlinien der Fabbrica delle Api","Tutte le linee":"Alle Produktlinien",
"Carrello":"Warenkorb","Scegli il formato:":"Format wählen:","➕ Aggiungi al carrello":"➕ In den Warenkorb","Non Disponibile":"Nicht verfügbar","Esaurito / Stock Insuff.":"Ausverkauft / Bestand nicht ausreichend",
"Consegna prevista entro 5–6 giorni • Spedizione gratuita per ordini da €200 in su":"Voraussichtliche Lieferung in 5–6 Tagen • Kostenloser Versand ab 200 €",
"Spedizione gratuita":"Kostenloser Versand","Consegna locale":"Lokale Lieferung","Corriere":"Kurier",
"Linea Alimenti":"Lebensmittel","Linea Integratori":"Nahrungsergänzung","Linea Cosmesi e Tesori in Cera d’Api":"Kosmetik & Bienenwachs","I Tesori di Francesco":"Francescos Spezialitäten","I Tris dell’Alveare":"Bienenstock-Dreier-Sets","Linea Cosmetica al Veleno d’Api":"Kosmetik mit Bienengift",
"ALVEO DIGITALE":"ALVEO DIGITAL","Ricette, video e idee regalo da usare subito":"Rezepte, Videos und digitale Geschenkideen - sofort nutzbar","Scopri Alveo Digitale":"Alveo Digital entdecken","Ricette, video e regali digitali":"Digitale Rezepte, Videos und Geschenke","← Torna alle linee":"← Zurück zu den Produktlinien","Ricetta digitale":"Digitales Rezept","10 Colazioni dell’Alveare":"10 Frühstücke aus dem Bienenstock","👁 Sfoglia anteprima":"👁 Vorschau ansehen","Acquista PDF":"PDF kaufen (Test)","Video narrato":"Erzähltes Video","Un Momento nell’Alveare":"Ein Moment im Bienenstock","Guarda esempio":"Beispiel ansehen","Regalo digitale":"Digitales Geschenk","Regala l’Alveare":"Verschenke den Bienenstock","Esempio":"Beispiel","Come funziona":"So funktioniert es","1. Scegli":"1. Auswählen","2. Acquista":"2. Kaufen","3. Apri subito":"3. Sofort öffnen","Prodotto digitale · nessuna spedizione":"Digitales Produkt · kein Versand",
"NOVITÀ ASSOLUTA!":"ABSOLUTE NEUHEIT!","Avvertenze:":"Hinweise:","Solo per uso cosmetico esterno.":"Nur zur äußerlichen kosmetischen Anwendung.","Le informazioni riportate descrivono esclusivamente l’uso cosmetico del prodotto e non costituiscono indicazioni mediche.":"Die Angaben beschreiben ausschließlich die kosmetische Verwendung des Produkts und stellen keine medizinischen Hinweise dar.",
"Miele di Acacia":"Akazienhonig","Miele di Acacia in Favo":"Akazienhonig mit Wabe","Miele Millefiori":"Blütenhonig","Miele di Castagno":"Kastanienhonig","Miele Eucalipto":"Eukalyptushonig","Miele di Acacia e Zenzero":"Akazienhonig mit Ingwer","Polline Italiano":"Italienischer Blütenpollen","Pappa Reale - 10 g":"Gelée Royale - 10 g","Pappa Reale Italiana fresca Bio":"Frisches italienisches Bio-Gelée-Royale","Pane delle Api Bio":"Bio-Bienenbrot","Favo Integrale Bio":"Bio-Honigwabe",
"Bee Energy BIO":"Bee Energy BIO","Propol Active BIO":"Propol Active BIO","Spray Gola BIO":"Bio-Halsspray","Soluzione Propoli 30% Spray":"Propolis-Lösung 30 % Spray","Soluzione Propoli 30% con Contagocce - Alcolica":"Propolis-Lösung 30 % mit Tropfer - alkoholisch","Soluzione Propoli con Contagocce Analcolica":"Alkoholfreie Propolis-Lösung mit Tropfer",
"Crema Mani":"Handcreme","Burrocacao Propoli e Aloe Vera":"Lippenpflege Propolis & Aloe Vera","Burrocacao Miele e Pappa Reale":"Lippenpflege Honig & Gelée Royale","Shampoo Multivitaminico":"Multivitamin-Shampoo","Saponetta Miele e Frutti di Bosco":"Pflanzenseife Honig & Waldbeeren","Saponetta Miele e Lavanda":"Pflanzenseife Honig & Lavendel","Saponetta Miele e Aloe Vera":"Pflanzenseife Honig & Aloe Vera","Candela Alveare Grande in Cera d’Api":"Große Bienenstockkerze aus Bienenwachs",
"Limoncello “I Tesori di Francesco”":"Limoncello „Francescos Spezialitäten“","Liquore di Caffè “I Tesori di Francesco”":"Kaffeelikör „Francescos Spezialitäten“","Castagne al Rum “I Tesori di Francesco”":"Kastanien in Rum „Francescos Spezialitäten“",
"SOS DOL – Unguento al Veleno d’Api – 15 ml":"SOS DOL – Salbe mit Bienengift – 15 ml","Crema Viso al Veleno d’Api – 50 ml – APIS1":"Gesichtscreme mit Bienengift – 50 ml – APIS1","Siero Viso al Veleno d’Api – 30 ml – APIS2":"Gesichtsserum mit Bienengift – 30 ml – APIS2","Crema Corpo Veleno d’Api e Miele di Manuka – 250 ml – APIS4":"Körpercreme mit Bienengift und Manuka-Honig – 250 ml – APIS4","Gommage Viso e Corpo Veleno d’Api e Miele di Manuka – 250 ml – APIS5":"Gesichts- und Körperpeeling mit Bienengift und Manuka-Honig – 250 ml – APIS5","Bagnodoccia Veleno d’Oro – 250 ml – APIS7":"Duschbad Veleno d’Oro – 250 ml – APIS7",
"1 confezione":"1 Packung","1 vasetto (250 g)":"1 Glas (250 g)","1 vasetto (250g)":"1 Glas (250 g)","1 vasetto (200 g)":"1 Glas (200 g)","1 vasetto (40 g)":"1 Glas (40 g)","1 confezione (200 g)":"1 Packung (200 g)","1 confezione (125 g)":"1 Packung (125 g)","1 confezione (80 g)":"1 Packung (80 g)","1 flacone spray - 20 ml":"1 Sprühflasche - 20 ml","1 flacone con contagocce - 20 ml":"1 Tropfflasche - 20 ml","1 flacone - 250 ml":"1 Flasche - 250 ml","1 stick - 5 ml":"1 Stick - 5 ml","1 saponetta - 100 g":"1 Seife - 100 g","1 candela - cera d’api":"1 Kerze - Bienenwachs","1 bottiglia - 250 ml":"1 Flasche - 250 ml","1 Tris - 3 prodotti":"1 Dreier-Set - 3 Produkte",
"Privacy Policy":"Datenschutzerklärung","Condizioni di vendita":"Verkaufsbedingungen","Resi e recesso":"Rückgabe und Widerruf","Ultimo aggiornamento: 15 settembre 2026.":"Letzte Aktualisierung: 15. September 2026.","Titolare del trattamento":"Verantwortlicher für die Datenverarbeitung","Venditore":"Verkäufer","Resi, recesso e rimborsi":"Rückgabe, Widerruf und Erstattungen","Contatto per recesso e resi":"Kontakt für Widerruf und Rückgabe",
"1. Dati trattati":"1. Verarbeitete Daten","2. Finalità e basi giuridiche":"2. Zwecke und Rechtsgrundlagen","3. Pagamenti":"3. Zahlungen","4. Destinatari":"4. Empfänger","5. Conservazione":"5. Aufbewahrung","6. Cookie e tecnologie tecniche":"6. Cookies und technische Technologien","7. Diritti dell'interessato":"7. Rechte der betroffenen Person","8. Contatti":"8. Kontakt",
"Condizioni generali di vendita":"Allgemeine Verkaufsbedingungen","1. Ambito di applicazione":"1. Anwendungsbereich","2. Prodotti e informazioni":"2. Produkte und Informationen","3. Prezzi":"3. Preise","4. Ordine e conclusione del contratto":"4. Bestellung und Vertragsschluss","5. Pagamenti":"5. Zahlungen","6. Disponibilità":"6. Verfügbarkeit","7. Spedizione e consegna":"7. Versand und Lieferung","8. Diritto di recesso e resi":"8. Widerrufsrecht und Rückgabe","9. Garanzia legale":"9. Gesetzliche Gewährleistung","10. Assistenza":"10. Kundenservice","11. Legge applicabile":"11. Anwendbares Recht",
"1. Diritto di recesso":"1. Widerrufsrecht","2. Come esercitarlo":"2. Ausübung des Widerrufs","3. Restituzione dei prodotti":"3. Rücksendung der Produkte","4. Condizioni dei beni restituiti":"4. Zustand der zurückgesandten Waren","5. Eccezioni al recesso":"5. Ausnahmen vom Widerrufsrecht","6. Rimborso":"6. Erstattung","7. Prodotti danneggiati o non conformi":"7. Beschädigte oder nicht vertragsgemäße Produkte",
"🐝 SALDO API":"🐝 BIENENPUNKTE","Controlla tutte le tue Api in un unico posto.":"Prüfe alle deine Bienenpunkte an einem Ort.","I codici non scadono.":"Die Codes verfallen nicht.","🐝 CONTROLLA IL MIO SALDO":"🐝 MEINEN PUNKTESTAND PRÜFEN","Il tuo Saldo Api":"Deine Bienenpunkte","➕ Aggiungi un Coupon Api":"➕ Bienenpunkte-Coupon hinzufügen","AGGIUNGI AL SALDO":"ZUM PUNKTESTAND HINZUFÜGEN","🎁 Componi il Cesto":"🎁 Korb zusammenstellen","5 prodotti":"5 Produkte","Pagamento":"Zahlung","Spedizione":"Versand","Totale da pagare":"Zu zahlender Gesamtbetrag","← Torna al negozio":"← Zurück zum Shop","Nome e cognome *":"Vor- und Nachname *","Telefono *":"Telefon *","Via e numero civico *":"Straße und Hausnummer *","CAP *":"PLZ *","Comune / Città *":"Ort / Stadt *","Provincia (es. MN) *":"Provinz (z. B. MN) *","Paese":"Land","Note per la consegna (facoltative)":"Hinweise zur Lieferung (optional)",
"Pagamento Completato!":"Zahlung abgeschlossen!","Grazie per il tuo ordine!":"Vielen Dank für deine Bestellung!","Il tuo pagamento è stato completato con successo. Riceverai una conferma via email a breve.":"Deine Zahlung wurde erfolgreich abgeschlossen. Du erhältst in Kürze eine Bestätigung per E-Mail.","Torna al Negozio":"Zurück zum Shop","Pagamento Annullato":"Zahlung abgebrochen","Il pagamento è stato annullato. Puoi riprovare o contattarci per assistenza.":"Die Zahlung wurde abgebrochen. Du kannst es erneut versuchen oder uns kontaktieren."
};

const SUB=[
["confezioni","Packungen"],["confezione","Packung"],["vasetti","Gläser"],["vasetto","Glas"],["flacone","Flasche"],["bottiglia","Flasche"],["saponetta","Seife"],["candela","Kerze"],["prodotti","Produkte"],["prodotto","Produkt"],["sconto","Rabatt"],["Spedizione:","Versand:"],["gratuita","kostenlos"],["Disponibile","Verfügbar"],["Esaurito","Ausverkauft"],["Quantità","Menge"],["Prezzo","Preis"],["Totale","Gesamt"],["Continua gli acquisti","Weiter einkaufen"],["Vai al carrello","Zum Warenkorb"],["Procedi al checkout","Zur Kasse"],["Rimuovi","Entfernen"],["Cerca","Suchen"],["Categorie","Kategorien"]
];

const ATTRS=['placeholder','aria-label','title','alt'];
const DE_PREVIEW=
'<div class="alveo-preview-page alveo-de-sheet alveo-active-page"><div class="de-cover"><div class="de-kicker">ALVEO DIGITAL · DEUTSCHE DEMO</div><div class="de-title">10 FRÜHSTÜCKE<br>AUS DEM BIENENSTOCK</div><div class="de-gold">ZEHN MORGEN. ZEHN KLEINE GENUSSMOMENTE.</div><p>Ein kleines Magazin zum Kochen, Blättern und jeden Morgen neu Entdecken.</p><div class="de-grid"><b>10 VOLLSTÄNDIGE REZEPTE</b><b>20 SCHNELLE IDEEN</b><b>WOCHENPLANER UND EINKAUFSLISTE</b><b>QUIZ UND HONIGVERKOSTUNG</b></div><small>RENDER-TEST · 5 SEITEN</small></div><span>Cover</span></div>'+
'<div class="alveo-preview-page alveo-de-sheet"><div class="de-paper"><div class="de-kicker gold">DER WEG DURCH DEN RATGEBER</div><h2>Was dich erwartet</h2><p>Rezepte, praktische Hilfen, Honigwissen und schnelle Ideen.</p><div class="de-index"><div><b>01 · DIE 10 FRÜHSTÜCKE</b><p>01 Joghurt, Obst und Blütenhonig</p><p>02 Brot, Ricotta und Akazienhonig</p><p>03 Apfel-Kastanien-Porridge</p><p>04 Bananen-Pancakes mit Orangenhonig</p><p>05 Knuspriges Honig-Granola</p></div><div><b>02 · ORGANISIERE DEINE MORGEN</b><p>Wochenplaner</p><p>Einkaufsliste</p><b>03 · ENTDECKE DEINEN HONIG</b><p>Quiz · Verkostung · Geschmackspass</p><b>04 · 20 SCHNELLE IDEEN</b></div></div></div><span>Inhalt</span></div>'+
'<div class="alveo-preview-page alveo-de-sheet"><div class="de-section"><div class="de-big">01</div><div class="de-line"></div><h2>Die 10 Frühstücke</h2><p>Zehn vollständige Rezepte. Jedes Frühstück wird auf der nächsten Seite mit Varianten und praktischen Tipps fortgesetzt.</p></div><span>Die 10 Frühstücke</span></div>'+
'<div class="alveo-preview-page alveo-de-sheet"><div class="de-paper recipe"><div class="de-kicker gold">FRÜHSTÜCK 01 · REZEPT</div><h2>Joghurt, Obst und Blütenhonig</h2><p>Frisch, farbenfroh und in wenigen Minuten fertig.</p><div class="de-stats"><b>ZEIT<br><em>5 Minuten</em></b><b>SCHWIERIGKEIT<br><em>Sehr einfach</em></b><b>FÜR<br><em>1 Person</em></b></div><div class="de-index"><div><b>DU BRAUCHST</b><p>150 g Naturjoghurt</p><p>100 g Obst der Saison</p><p>2 EL Haferflocken</p><p>1 TL Blütenhonig</p></div><div><b>SO GEHT’S</b><p><strong>01</strong> Joghurt in eine Schüssel geben.</p><p><strong>02</strong> Obst und Haferflocken dazugeben.</p><p><strong>03</strong> Kurz vor dem Servieren mit Honig verfeinern.</p></div></div><div class="de-honey"><b>EMPFOHLENER HONIG · Blütenhonig</b><br>Mild und ausgewogen: verbindet Joghurt, Getreide und Obst.</div></div><span>Erstes vollständiges Rezept</span></div>'+
'<div class="alveo-preview-page alveo-de-sheet"><div class="de-paper recipe"><div class="de-kicker gold">FRÜHSTÜCK 01 · VARIANTEN UND IDEEN</div><h2>Mach es noch mehr zu deinem</h2><h3>DREI VARIANTEN</h3><p><strong>01 Pfirsich</strong><br>Pfirsichwürfel und ein wenig Blütenhonig.</p><p><strong>02 Beeren</strong><br>Heidelbeeren, Himbeeren oder Erdbeeren.</p><p><strong>03 Apfel und Zimt</strong><br>Dünne Apfelscheiben, Zimt und geröstete Haferflocken.</p><h3>VORBEREITEN</h3><p><strong>Am Vorabend vorbereiten:</strong> Obst abends waschen und schneiden. Getreide und Honig getrennt aufbewahren.</p><div class="de-note"><b>MEINE VARIANTE</b><br><br>________________________________<br><br>________________________________</div></div><span>Varianten und Ideen</span></div>';

function style(){
 if(document.getElementById('fda-lang-style'))return;
 const s=document.createElement('style');s.id='fda-lang-style';s.textContent=
 '#fda-language-test{display:flex;align-items:center;gap:7px;margin-left:auto;padding:5px 7px;border:1px solid rgba(245,190,65,.7);border-radius:999px;background:#111;color:#fff;font:800 12px/1 system-ui,sans-serif;z-index:1000001}#fda-language-test select{border:0;border-radius:999px;background:#f2b83f;color:#171717;padding:7px 9px;font-weight:900;outline:none}#fda-language-test.fallback{position:fixed;right:10px;top:10px;margin:0;box-shadow:0 5px 20px rgba(0,0,0,.35)}.alveo-lang-points{display:inline-flex;margin-top:8px;border:1px solid rgba(250,204,21,.5);background:rgba(113,63,18,.35);color:#fde68a;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:950}.alveo-de-sheet>div{box-sizing:border-box;width:100%;aspect-ratio:210/297;border-radius:8px;overflow:hidden;text-align:left}.de-cover{background:#0d493a;color:#fff;padding:8%;display:flex;flex-direction:column;justify-content:center}.de-title{font-family:Georgia,serif;font-size:clamp(30px,6vw,62px);font-weight:900;line-height:1.02;margin:8% 0 4%}.de-gold,.gold{color:#e0a018;font-weight:900}.de-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10%;padding-top:5%;border-top:1px solid rgba(255,255,255,.35)}.de-paper{background:#f8f1e2;color:#19251f;padding:7%;height:100%}.de-paper h2{font-family:Georgia,serif;color:#0d493a;font-size:clamp(28px,5vw,52px)}.de-index{display:grid;grid-template-columns:1fr 1fr;gap:5%;margin-top:7%}.de-section{height:100%;padding:9%;background:linear-gradient(135deg,#74410e,#2f1b08);color:white;display:flex;flex-direction:column;justify-content:center}.de-big{font:400 clamp(90px,20vw,190px)/.9 Georgia,serif;color:#e8b33a}.de-line{width:35%;border-top:4px solid #e8b33a;margin:4% 0}.de-section h2{font:900 clamp(36px,7vw,74px)/1.05 Georgia,serif}.de-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:3%;border-bottom:2px solid #d99a12;padding:4% 0}.de-honey{margin:7% -7% -7%;padding:4% 7%;background:#0d493a;color:#fff}.de-note{margin-top:7%;padding:4%;border:1px solid #ead08d;border-radius:12px;background:#fff0bd}@media(max-width:760px){#fda-language-test{font-size:11px}.de-index,.de-grid{grid-template-columns:1fr}.alveo-de-sheet>div{min-height:72vh;aspect-ratio:auto}.de-title{font-size:34px}}';
 document.head.appendChild(s);
}

function selector(){
 style();
 let box=document.getElementById('fda-language-test');
 if(!box){
   box=document.createElement('div');box.id='fda-language-test';
   box.innerHTML='<span>🌐 Lingua / Sprache</span><select id="fda-language-select"><option value="it">🇮🇹 Italiano</option><option value="de">🇩🇪 Deutsch</option></select>';
   const target=document.getElementById('center-home-bar')||document.querySelector('header nav')||document.querySelector('header .nav')||document.querySelector('header');
   if(target)target.appendChild(box);else{box.classList.add('fallback');document.body.appendChild(box);}
   box.querySelector('select').addEventListener('change',e=>setLang(e.target.value));
 }
 const sel=document.getElementById('fda-language-select');if(sel)sel.value=lang;
}

function trText(v){
 const raw=String(v||'');const x=raw.trim();if(!x)return raw;
 let out=T[x]||x;
 if(out===x && lang===DE){for(const [a,b] of SUB){if(out.includes(a))out=out.split(a).join(b);}}
 if(out===x)return raw;
 return raw.replace(x,out);
}
function translateNode(node){
 if(!node||node.nodeType!==3)return;
 const p=node.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(p.tagName))return;
 const old=node.nodeValue;if(!String(old||'').trim())return;
 if(!originals.has(node))originals.set(node,old);
 const nv=trText(old);
 if(nv!==old){node.nodeValue=nv;translated.add(node);}
}
function translateAttrs(el){
 if(!el||el.nodeType!==1)return;
 let map=attrOriginals.get(el);if(!map){map={};attrOriginals.set(el,map);}
 for(const a of ATTRS){
   if(!el.hasAttribute(a))continue;
   const v=el.getAttribute(a);if(!v)continue;
   if(!(a in map))map[a]=v;
   const n=trText(v);if(n!==v)el.setAttribute(a,n);
 }
}
function walk(root){
 if(!root)return;
 if(root.nodeType===1)translateAttrs(root);
 const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){if(n.nodeType===3)translateNode(n);else translateAttrs(n);}
}
function restore(){
 translated.forEach(n=>{if(n&&originals.has(n))n.nodeValue=originals.get(n);});translated.clear();
 document.querySelectorAll('*').forEach(el=>{const m=attrOriginals.get(el);if(m)for(const a in m)el.setAttribute(a,m[a]);});
}

function productFacts(){
 const panel=document.getElementById('alveo-digitale-inline-panel');if(!panel)return;
 const article=Array.from(panel.querySelectorAll('article')).find(a=>/10 Colazioni|10 Frühstücke/i.test(a.textContent||''));if(!article)return;
 const title=article.querySelector('h3');if(title)title.textContent=lang===DE?'10 Frühstücke aus dem Bienenstock':'10 Colazioni dell’Alveare';
 const desc=article.querySelector('p');if(desc)desc.textContent=lang===DE?'Deutsche Sprachdemo: fünf Beispielseiten. Die endgültige deutsche Ausgabe wird erst nach Freigabe des Tests erstellt.':'37 pagine con 10 ricette complete, 20 idee lampo, planner, lista della spesa, quiz e degustazione dei mieli.';
 const price=Array.from(article.querySelectorAll('div')).find(el=>/^€\s*[234][,.]90$/.test(String(el.textContent||'').trim()));if(price)price.textContent='€4,90';
 let b=article.querySelector('.alveo-lang-points');if(!b){b=document.createElement('div');b.className='alveo-lang-points';article.appendChild(b);}b.textContent=lang===DE?'🐝 2 Bienenpunkte':'🐝 2 Punti Ape';
 const buy=article.querySelector('[data-alveo-buy="colazioni"]');if(buy)buy.textContent=lang===DE?'PDF kaufen (Test)':'Acquista PDF';
}

function purchase(){
 const o=document.getElementById('alveo-sim-overlay');if(!o)return;
 const $=s=>o.querySelector(s), d=document.getElementById('alveo-sim-download');
 if(d&&!d.dataset.itHref)d.dataset.itHref=d.getAttribute('href')||'';
 const values=lang===DE?{
 eye:'ALVEO DIGITAL · RENDER-TEST',title:'Kauf simulieren',prod:'10 Frühstücke aus dem Bienenstock - deutsche Demo (5 Seiten)',notice:'🧪 Technischer Test auf Render. Es wird kein echter Betrag belastet. Nach der Simulation wird die deutsche PDF-Demo angeboten.',lab:'E-Mail für den Test',pay:'💳 Karte · Zahlung simulieren',proc:'Simulierter Kauf läuft...',close:'Abbrechen und zurück zu den Produkten',ok:'Simulierter Kauf abgeschlossen',okp:'Es wurde keine echte Zahlung ausgeführt. Die deutsche Testversion steht bereit.',down:'⬇ Deutsche PDF-Demo herunterladen',close2:'Schließen'
 }:{eye:'ALVEO DIGITALE · PROVA RENDER',title:"Simula l'acquisto",prod:"10 Colazioni dell'Alveare - Edizione Premium · 37 pagine",notice:'🧪 Questa è una simulazione solo su Render. Nessun importo verrà addebitato e non devi inserire dati reali della carta.',lab:'Email per la prova',pay:'💳 Carta · Simula pagamento',proc:'Acquisto simulato in corso...',close:'Annulla e torna ai prodotti',ok:'Acquisto simulato completato',okp:'Nessun pagamento reale è stato eseguito. Il prodotto digitale è pronto.',down:'⬇ Scarica il prodotto',close2:'Chiudi'};
 const set=(sel,v)=>{const e=$(sel);if(e)e.textContent=v;};set('#alveo-sim-head .eyebrow',values.eye);set('#alveo-sim-title',values.title);set('#alveo-sim-product strong',values.prod);set('#alveo-sim-product span','€4,90');set('#alveo-sim-notice',values.notice);set('label[for="alveo-sim-email"]',values.lab);const pay=$('#alveo-sim-card');if(pay&&!pay.disabled)pay.textContent=values.pay;set('#alveo-sim-processing',values.proc);set('#alveo-sim-close',values.close);set('#alveo-sim-success h4',values.ok);set('#alveo-sim-success p',values.okp);set('#alveo-sim-close-success',values.close2);
 if(d){d.textContent=values.down;if(lang===DE){d.href='/downloads/10-fruehstuecke-bienenstock-demo-de.pdf';d.setAttribute('download','10-Fruehstuecke-aus-dem-Bienenstock-DEMO.pdf');}else{if(d.dataset.itHref)d.href=d.dataset.itHref;d.removeAttribute('download');}}
}

function preview(){
 const pages=document.getElementById('alveo-preview-pages');if(!pages)return;if(italianPreviewHtml===null)italianPreviewHtml=pages.innerHTML;
 const h=document.querySelector('#alveo-preview-head strong'),i=document.getElementById('alveo-preview-intro'),n=document.getElementById('alveo-preview-note'),p=document.getElementById('alveo-preview-prev'),nx=document.getElementById('alveo-preview-next'),c=document.getElementById('alveo-preview-counter');
 if(lang===DE){if(pages.dataset.lang!=='de'){pages.innerHTML=DE_PREVIEW;pages.dataset.lang='de';}if(h)h.textContent='10 Frühstücke aus dem Bienenstock · Vorschau';if(i)i.textContent='Fünf deutsche Demoseiten zeigen den Sprachwechsel vor dem Kauf.';if(n)n.textContent='Render-Sprachtest · die endgültige deutsche 37-Seiten-Ausgabe wird erst nach Freigabe erstellt.';if(p)p.textContent='← Zurück';if(nx)nx.textContent='Weiter →';if(c)c.textContent='1 / 5';}
 else{if(pages.dataset.lang==='de'){pages.innerHTML=italianPreviewHtml;delete pages.dataset.lang;}if(h)h.textContent='10 Colazioni dell’Alveare · Anteprima';if(p)p.textContent='← Indietro';if(nx)nx.textContent='Avanti →';}
}

function sync(){
 if(busy)return;busy=true;
 try{selector();if(lang===DE)walk(document.body);productFacts();purchase();preview();document.documentElement.lang=lang;if(document.title)document.title=T[document.title]||document.title;const s=document.getElementById('fda-language-select');if(s)s.value=lang;}finally{busy=false;}
}
function setLang(v){lang=v===DE?DE:IT;try{localStorage.setItem(KEY,lang);}catch(_){}if(lang===IT){restore();location.reload();return;}sync();}
function schedule(){clearTimeout(timer);timer=setTimeout(sync,50);}
function start(){let s='';try{s=localStorage.getItem(KEY)||'';}catch(_){}if(s!==IT&&s!==DE)s=(navigator.language||'').toLowerCase().startsWith('de')?DE:IT;lang=s;selector();sync();new MutationObserver(ms=>{if(busy)return;if(lang===DE)ms.forEach(m=>m.addedNodes&&m.addedNodes.forEach(n=>{if(n.nodeType===1||n.nodeType===3)walk(n.nodeType===1?n:n.parentNode);}));schedule();}).observe(document.body,{childList:true,subtree:true});document.addEventListener('click',()=>setTimeout(sync,80),true);}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();