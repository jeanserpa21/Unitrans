-- =============================================
-- ADICIONAR COLUNAS FALTANTES
-- =============================================

-- 1. UNIVERSIDADES - Adicionar cidade e endereco
ALTER TABLE universidades 
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS endereco TEXT;

-- 2. MOTORISTAS - Adicionar telefone e data_nascimento
ALTER TABLE motoristas 
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 3. VEICULOS - Adicionar marca, ano, cor, capacidade, tipo
ALTER TABLE veiculos 
ADD COLUMN IF NOT EXISTS marca VARCHAR(100),
ADD COLUMN IF NOT EXISTS ano INTEGER,
ADD COLUMN IF NOT EXISTS cor VARCHAR(50),
ADD COLUMN IF NOT EXISTS capacidade INTEGER,
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50);

-- 4. LINHAS - Adicionar origem, destino, distancia_km, duracao_media, motorista_id
ALTER TABLE linhas 
ADD COLUMN IF NOT EXISTS origem VARCHAR(255),
ADD COLUMN IF NOT EXISTS destino VARCHAR(255),
ADD COLUMN IF NOT EXISTS distancia_km DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS duracao_media TIME,
ADD COLUMN IF NOT EXISTS motorista_id INTEGER REFERENCES motoristas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 5. PASSAGEIROS - Adicionar cpf, telefone, curso, dias_transporte, documentos
ALTER TABLE passageiros 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE,
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS curso VARCHAR(255),
ADD COLUMN IF NOT EXISTS dias_transporte JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS documento_identidade_url TEXT,
ADD COLUMN IF NOT EXISTS comprovante_matricula_url TEXT,
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 6. VIAGENS - Adicionar motorista_id, horario_ida, horario_volta, status, tipo
ALTER TABLE viagens 
ADD COLUMN IF NOT EXISTS motorista_id INTEGER REFERENCES motoristas(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS horario_ida TIME,
ADD COLUMN IF NOT EXISTS horario_volta TIME,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'AGENDADA',
ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'IDA_VOLTA',
ADD COLUMN IF NOT EXISTS iniciada_em TIMESTAMP,
ADD COLUMN IF NOT EXISTS finalizada_em TIMESTAMP;

-- 7. CRIAR TABELA viagens_passageiros (se não existir)
CREATE TABLE IF NOT EXISTS viagens_passageiros (
  id SERIAL PRIMARY KEY,
  viagem_id INTEGER NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  passageiro_id INTEGER NOT NULL REFERENCES passageiros(id) ON DELETE CASCADE,
  ponto_embarque_id INTEGER REFERENCES pontos(id) ON DELETE SET NULL,
  ponto_desembarque_id INTEGER REFERENCES pontos(id) ON DELETE SET NULL,
  embarcou BOOLEAN DEFAULT false,
  horario_embarque TIMESTAMP,
  desembarcou BOOLEAN DEFAULT false,
  horario_desembarque TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(viagem_id, passageiro_id)
);

-- 8. ADICIONAR CONSTRAINTS E CHECKS
ALTER TABLE veiculos 
ADD CONSTRAINT IF NOT EXISTS veiculos_tipo_check 
CHECK (tipo IN ('VAN', 'ONIBUS', 'MICRO-ONIBUS'));

ALTER TABLE viagens 
ADD CONSTRAINT IF NOT EXISTS viagens_status_check 
CHECK (status IN ('AGENDADA', 'ANDAMENTO', 'CONCLUIDA', 'CANCELADA'));

ALTER TABLE viagens 
ADD CONSTRAINT IF NOT EXISTS viagens_tipo_check 
CHECK (tipo IN ('IDA', 'VOLTA', 'IDA_VOLTA'));

-- 9. CRIAR INDICES (se não existirem)
CREATE INDEX IF NOT EXISTS idx_viagens_passageiros_viagem ON viagens_passageiros(viagem_id);
CREATE INDEX IF NOT EXISTS idx_viagens_passageiros_passageiro ON viagens_passageiros(passageiro_id);
CREATE INDEX IF NOT EXISTS idx_passageiros_cpf ON passageiros(cpf);
CREATE INDEX IF NOT EXISTS idx_viagens_data ON viagens(data);
CREATE INDEX IF NOT EXISTS idx_viagens_status ON viagens(status);

-- =============================================
-- VERIFICAR ESTRUTURA ATUALIZADA
-- =============================================

-- Ver colunas de passageiros
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'passageiros'
ORDER BY ordinal_position;

-- Ver colunas de viagens
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'viagens'
ORDER BY ordinal_position;

-- Ver se viagens_passageiros existe
SELECT tablename FROM pg_tables WHERE tablename = 'viagens_passageiros';