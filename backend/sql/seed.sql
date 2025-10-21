-- Limpar dados existentes (cuidado em produção!)
TRUNCATE TABLE logs, mensagens, solicitacoes_carona, passageiros_viagem, viagens, 
                pontos, passageiros, motoristas, linhas, veiculos, universidades, usuarios 
RESTART IDENTITY CASCADE;

-- 1. Admin
INSERT INTO usuarios (nome, email, senha_hash, papel, ativo) VALUES
('Admin Sistema', 'admin@unitrans.com', '$2b$10$rZ7Q4XqXhZ4XqXqXqXqXqOHRKGbMF4pYz.wN3vK6yZ.5yBz8nXqXq', 'ADM', true);

-- 2. Motoristas (senha: moto123 para ambos)
INSERT INTO usuarios (nome, email, senha_hash, papel, foto_url, ativo) VALUES
('João Silva', 'joao.motorista@unitrans.com', '$2b$10$rZ7Q4XqXhZ4XqXqXqXqXqOHRKGbMF4pYz.wN3vK6yZ.5yBz8nXqXq', 'MOTORISTA', 'https://i.pravatar.cc/150?img=12', true),
('Maria Santos', 'maria.motorista@unitrans.com', '$2b$10$rZ7Q4XqXhZ4XqXqXqXqXqOHRKGbMF4pYz.wN3vK6yZ.5yBz8nXqXq', 'MOTORISTA', 'https://i.pravatar.cc/150?img=5', true);

INSERT INTO motoristas (usuario_id, cnh, ativo) VALUES
(2, 'CNH123456789', true),
(3, 'CNH987654321', true);

-- 3. Universidade
INSERT INTO universidades (nome, ativo) VALUES
('FURB - Universidade Regional de Blumenau', true);

-- 4. Veículos
INSERT INTO veiculos (placa, modelo, capacidade, ativo) VALUES
('ABC-1234', 'Mercedes-Benz OF-1721', 44, true),
('XYZ-5678', 'Volkswagen 17.230', 40, true);

-- 5. Linhas
INSERT INTO linhas (nome, universidade_id, veiculo_id, motorista_id, ativo) VALUES
('Linha 1 - Centro/Campus', 1, 1, 1, true),
('Linha 2 - Velha/Campus', 1, 2, 2, true);

-- 6. Pontos (3 por linha em ordem)
-- Linha 1
INSERT INTO pontos (linha_id, nome, latitude, longitude, ordem, raio_m) VALUES
(1, 'Terminal Centro', -26.9194, -49.0661, 1, 100),
(1, 'Rua XV de Novembro', -26.9234, -49.0701, 2, 100),
(1, 'Campus FURB', -26.9044, -49.0661, 3, 120);

-- Linha 2
INSERT INTO pontos (linha_id, nome, latitude, longitude, ordem, raio_m) VALUES
(2, 'Bairro Velha', -26.9544, -49.0961, 1, 100),
(2, 'Shopping Neumarkt', -26.9244, -49.0661, 2, 100),
(2, 'Campus FURB', -26.9044, -49.0661, 3, 120);

-- 7. Passageiros (senha: pass123 para todos)
INSERT INTO usuarios (nome, email, senha_hash, papel, foto_url, ativo) VALUES
('Carlos Oliveira', 'carlos@estudante.com', '$2b$10$rZ7Q4XqXhZ4XqXqXqXqXqOHRKGbMF4pYz.wN3vK6yZ.5yBz8nXqXq', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=15', true),
('Ana Costa', 'ana@estudante.com', '$2b$10$rZ7Q4XqXhZ4XqXqXqXqXqOHRKGbMF4pYz.wN3vK6yZ.5yBz8nXqXq', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=20', true),
('Pedro Souza', 'pedro@estudante.com', '$2b$10$rZ7Q4XqXhZ4XqXqXqXqXqOHRKGbMF4pYz.wN3vK6yZ.5yBz8nXqXq', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=33', true),
('Julia Lima', 'julia@estudante.com', '$2b$10$rZ7Q4XqXhZ4XqXqXqXqXqOHRKGbMF4pYz.wN3vK6yZ.5yBz8nXqXq', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=25', true),
('Lucas Pereira', 'lucas@estudante.com', '$2b$10$rZ7Q4XqXhZ4XqXqXqXqXqOHRKGbMF4pYz.wN3vK6yZ.5yBz8nXqXq', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=51', true);

-- Passageiros aprovados (Linha 1: 3 passageiros, Linha 2: 2 passageiros)
INSERT INTO passageiros (usuario_id, universidade_id, ponto_padrao_id, aprovado, aprovado_em, aprovado_por) VALUES
(4, 1, 1, true, CURRENT_TIMESTAMP, 1),
(5, 1, 2, true, CURRENT_TIMESTAMP, 1),
(6, 1, 3, true, CURRENT_TIMESTAMP, 1),
(7, 1, 4, true, CURRENT_TIMESTAMP, 1),
(8, 1, 5, true, CURRENT_TIMESTAMP, 1);

-- 8. Criar viagem do dia para ambas as linhas
INSERT INTO viagens (linha_id, data, status, total_planejado, token_qr_hash) VALUES
(1, CURRENT_DATE, 'PLANEJADA', 3, md5(random()::text || clock_timestamp()::text)),
(2, CURRENT_DATE, 'PLANEJADA', 2, md5(random()::text || clock_timestamp()::text));

-- 9. Vincular passageiros à viagem de hoje
-- Linha 1
INSERT INTO passageiros_viagem (viagem_id, passageiro_id, ponto_id, status) VALUES
(1, 1, 1, 'AGUARDANDO'),
(1, 2, 2, 'AGUARDANDO'),
(1, 3, 3, 'AGUARDANDO');

-- Linha 2
INSERT INTO passageiros_viagem (viagem_id, passageiro_id, ponto_id, status) VALUES
(2, 4, 4, 'AGUARDANDO'),
(2, 5, 5, 'AGUARDANDO');

-- 10. Mensagens de exemplo
INSERT INTO mensagens (origem, remetente_id, linha_id, titulo, corpo) VALUES
('ADM', 1, 1, 'Bem-vindo ao UniTrans', 'Aproveite seu transporte universitário seguro e confortável!'),
('MOTORISTA', 2, 1, 'Aviso', 'Hoje sairemos no horário normal. Até logo!');

-- Resumo
SELECT 'Dados de teste inseridos com sucesso!' as resultado;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_passageiros FROM passageiros;
SELECT COUNT(*) as total_motoristas FROM motoristas;
SELECT COUNT(*) as total_linhas FROM linhas;
SELECT COUNT(*) as total_viagens FROM viagens;