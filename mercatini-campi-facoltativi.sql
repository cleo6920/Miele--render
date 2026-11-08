CREATE TABLE IF NOT EXISTS adesioni_mercatini_v2 (
  id INTEGER PRIMARY KEY,
  evento TEXT NOT NULL,
  nome TEXT NOT NULL COLLATE NOCASE,
  cognome TEXT NOT NULL,
  merce TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  versione_consenso TEXT NOT NULL,
  ricevuta_il TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metratura_banco_mq REAL CHECK (metratura_banco_mq > 0),
  telefono_normalizzato TEXT NOT NULL,
  UNIQUE (evento, nome, telefono_normalizzato)
);
CREATE VIEW IF NOT EXISTS registro_adesioni_mercatini AS
  SELECT evento, nome, cognome, merce, telefono, email, metratura_banco_mq, ricevuta_il, versione_consenso FROM adesioni_mercatini
  UNION ALL
  SELECT evento, nome, cognome, merce, telefono, email, metratura_banco_mq, ricevuta_il, versione_consenso FROM adesioni_mercatini_v2;
