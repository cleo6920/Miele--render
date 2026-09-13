# Baseline sito – La Fabbrica delle Api

Questo file è la fonte di riferimento per evitare di ripescare vecchi layout o patch non più approvati.

## Regola operativa

- Non ripristinare automaticamente commit o file solo perché in passato risultavano “stabili”.
- Prima di riutilizzare un vecchio intervento, verificare che corrisponda all’ultimo layout approvato dall’utente.
- I commit elencati sotto sono da considerare **NON APPROVATI / NON RIPRISTINARE**.
- Tutta la cronologia precedente alla pulizia resta conservata nel branch `backup/pre-cleanup-2026-09-13`.
- `main` deve contenere solo la catena attiva e gli interventi approvati.

## Commit hero/home da NON ripristinare

- `2a51dec0ecd3ba89c4ac88a14821a7dd640a294b` – sposta alveari al centro e Fabbrica a destra: layout non desiderato.
- `0fb14b9326c1adf9f88b68ea941509a60828abec` – ripristino layout che ha reintrodotto problemi nella parte alta.
- `15877544768659764c0d1b9a507d3a4ad525d80e` – tentativo di ripristino home non corretto.
- `03d6b46b28e94fc4e0c68df48a5daaa095206539` – override finale home non corretto.
- `dc0c9f80bbd338344e91bed3a6cbc046a1fd571b` – tentativo layout alto home non corretto.
- `409111c9f765f9215181a862d284b6f9eddb1d35` – struttura statica home non corretta.
- `93e3c00cb5b8162a3b99f188b3cc48758c1d30b4` – posizionamento home non corretto.
- `a800c86432cbd57e2c051d7371bdb6d1722a2405` – ripristino precedente non corretto.
- `ee6cfa8f71f714e91be929d512cde2a851e38112` – ricostruzione hero non corretta.
- `f3c25725d8370d704543675f9e039a7ac43b4ff9` – geometria hero da vecchio commit non corrispondente all’ultima versione approvata.

## Commit tris da NON riattivare

Tutte le vecchie implementazioni delle offerte tris sono archiviate e non devono essere richiamate nella catena di startup. La vendita attiva deve restare sui singoli prodotti finché l’utente non richiede diversamente.

## Stato approvato da preservare

- Vendita: solo prodotti singoli, nessuna combinazione tris.
- Barra spedizioni: `Consegna prevista entro 5–6 giorni • Spedizione gratuita per ordini da €200 in su`.
- Soglia reale spedizione gratuita: €200.
- Le linee e le schede prodotto attuali non vanno regredite durante il ripristino della home.
- Le descrizioni prodotto arricchite e autoritative non vanno sostituite da vecchi dati Firestore.

## Prossimo passaggio

Ricostruire una sola baseline autoritativa per la parte alta dello shop e, successivamente, fare la stessa pulizia per ogni sezione del sito. I vecchi prestart/patch non più necessari devono essere rimossi dalla catena attiva e conservati solo nel branch di backup.