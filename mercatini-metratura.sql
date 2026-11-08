ALTER TABLE adesioni_mercatini ADD COLUMN metratura_banco_mq REAL CHECK (metratura_banco_mq > 0);
