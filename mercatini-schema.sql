CREATE TABLE IF NOT EXISTS adesioni_mercatini (
  id INTEGER PRIMARY KEY,
  evento TEXT NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  merce TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  versione_consenso TEXT NOT NULL,
  ricevuta_il TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (evento, email, nome COLLATE NOCASE, cognome COLLATE NOCASE)
);
