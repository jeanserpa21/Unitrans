-- Extensão para geolocalização (opcional)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(20) NOT NULL CHECK (papel IN ('ADM', 'MOTORISTA', 'PASSAGEIRO')),
    foto_url VARCHAR(500),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Universidades
CREATE TABLE universidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Veículos
CREATE TABLE veiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(100),
    capacidade INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Motoristas
CREATE TABLE motoristas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cnh VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Linhas
CREATE TABLE linhas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    universidade_id INTEGER REFERENCES universidades(id),
    veiculo_id INTEGER REFERENCES veiculos(id),
    motorista_id INTEGER REFERENCES motoristas(id),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pontos
CREATE TABLE pontos (
    id SERIAL PRIMARY KEY,
    linha_id INTEGER NOT NULL REFERENCES linhas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    ordem INTEGER NOT NULL,
    raio_m INTEGER DEFAULT 100,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(linha_id, ordem)
);

-- Passageiros
CREATE TABLE passageiros (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    universidade_id INTEGER REFERENCES universidades(id),
    ponto_padrao_id INTEGER REFERENCES pontos(id),
    aprovado BOOLEAN DEFAULT false,
    docs_url TEXT[],
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aprovado_em TIMESTAMP,
    aprovado_por INTEGER REFERENCES usuarios(id)
);

-- Viagens
CREATE TABLE viagens (
    id SERIAL PRIMARY KEY,
    linha_id INTEGER NOT NULL REFERENCES linhas(id),
    data DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANEJADA' CHECK (status IN ('PLANEJADA', 'EM_ANDAMENTO', 'FINALIZADA')),
    total_planejado INTEGER DEFAULT 0,
    total_embarcados INTEGER DEFAULT 0,
    total_desembarcados INTEGER DEFAULT 0,
    token_qr_hash VARCHAR(255),
    iniciada_em TIMESTAMP,
    finalizada_em TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(linha_id, data)
);

-- Passageiros na viagem
CREATE TABLE passageiros_viagem (
    id SERIAL PRIMARY KEY,
    viagem_id INTEGER NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
    passageiro_id INTEGER NOT NULL REFERENCES passageiros(id),
    ponto_id INTEGER REFERENCES pontos(id),
    status VARCHAR(20) DEFAULT 'AGUARDANDO' CHECK (status IN ('AGUARDANDO', 'EMBARCADO', 'DESEMBARCADO', 'FALTOU')),
    checkin_em TIMESTAMP,
    checkout_em TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(viagem_id, passageiro_id)
);

-- Solicitações de carona
CREATE TABLE solicitacoes_carona (
    id SERIAL PRIMARY KEY,
    passageiro_id INTEGER NOT NULL REFERENCES passageiros(id),
    linha_id INTEGER NOT NULL REFERENCES linhas(id),
    data DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADA', 'NEGADA', 'CANCELADA')),
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processado_em TIMESTAMP,
    processado_por INTEGER REFERENCES usuarios(id)
);

-- Mensagens
CREATE TABLE mensagens (
    id SERIAL PRIMARY KEY,
    origem VARCHAR(20) NOT NULL CHECK (origem IN ('ADM', 'MOTORISTA')),
    remetente_id INTEGER NOT NULL REFERENCES usuarios(id),
    linha_id INTEGER REFERENCES linhas(id),
    viagem_id INTEGER REFERENCES viagens(id),
    titulo VARCHAR(255) NOT NULL,
    corpo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_usuarios_papel ON usuarios(papel);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_viagens_data ON viagens(data);
CREATE INDEX idx_viagens_linha_data ON viagens(linha_id, data);
CREATE INDEX idx_passageiros_viagem_status ON passageiros_viagem(status);
CREATE INDEX idx_mensagens_linha ON mensagens(linha_id);
CREATE INDEX idx_logs_usuario ON logs(usuario_id);
CREATE INDEX idx_pontos_coords ON pontos(latitude, longitude);

-- Mensagem de sucesso
SELECT 'Tabelas criadas com sucesso!' as resultado;