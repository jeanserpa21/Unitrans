-- ==========================================
-- DADOS FICTÍCIOS EXTRAS PARA UNITRANS
-- ==========================================

-- 1. MAIS MOTORISTAS (3 novos)
INSERT INTO usuarios (nome, email, senha_hash, papel, foto_url, ativo) VALUES
('Roberto Lima', 'roberto.motorista@unitrans.com', 'temp', 'MOTORISTA', 'https://i.pravatar.cc/150?img=32', true),
('Fernanda Costa', 'fernanda.motorista@unitrans.com', 'temp', 'MOTORISTA', 'https://i.pravatar.cc/150?img=47', true),
('Paulo Santos', 'paulo.motorista@unitrans.com', 'temp', 'MOTORISTA', 'https://i.pravatar.cc/150?img=68', true);

-- Obter IDs dos novos motoristas (assumindo sequência)
INSERT INTO motoristas (usuario_id, cnh, ativo) VALUES
((SELECT id FROM usuarios WHERE email = 'roberto.motorista@unitrans.com'), 'CNH111222333', true),
((SELECT id FROM usuarios WHERE email = 'fernanda.motorista@unitrans.com'), 'CNH444555666', true),
((SELECT id FROM usuarios WHERE email = 'paulo.motorista@unitrans.com'), 'CNH777888999', true);

-- 2. MAIS VEÍCULOS (3 novos)
INSERT INTO veiculos (placa, modelo, capacidade, ativo) VALUES
('DEF-9012', 'Scania K270', 50, true),
('GHI-3456', 'Volvo B270F', 45, true),
('JKL-7890', 'Mercedes-Benz OF-1519', 42, true);

-- 3. MAIS LINHAS (3 novas)
INSERT INTO linhas (nome, universidade_id, veiculo_id, motorista_id, ativo) VALUES
('Linha 3 - Garcia/Campus', 1, 3, (SELECT id FROM motoristas WHERE cnh = 'CNH111222333'), true),
('Linha 4 - Itoupava/Campus', 1, 4, (SELECT id FROM motoristas WHERE cnh = 'CNH444555666'), true),
('Linha 5 - Progresso/Campus', 1, 5, (SELECT id FROM motoristas WHERE cnh = 'CNH777888999'), true);

-- 4. PONTOS PARA AS NOVAS LINHAS
-- Linha 3 - Garcia/Campus
INSERT INTO pontos (linha_id, nome, latitude, longitude, ordem, raio_m) VALUES
(3, 'Bairro Garcia', -26.8944, -49.0561, 1, 100),
(3, 'Shopping Alemão', -26.9044, -49.0461, 2, 100),
(3, 'Campus FURB', -26.9044, -49.0661, 3, 120);

-- Linha 4 - Itoupava/Campus
INSERT INTO pontos (linha_id, nome, latitude, longitude, ordem, raio_m) VALUES
(4, 'Itoupava Central', -26.9644, -49.1161, 1, 100),
(4, 'Shopping Norte', -26.9344, -49.0861, 2, 100),
(4, 'Campus FURB', -26.9044, -49.0661, 3, 120);

-- Linha 5 - Progresso/Campus
INSERT INTO pontos (linha_id, nome, latitude, longitude, ordem, raio_m) VALUES
(5, 'Bairro Progresso', -26.8744, -49.0361, 1, 100),
(5, 'Centro Empresarial', -26.8944, -49.0461, 2, 100),
(5, 'Campus FURB', -26.9044, -49.0661, 3, 120);

-- 5. MAIS PASSAGEIROS (15 novos estudantes)
INSERT INTO usuarios (nome, email, senha_hash, papel, foto_url, ativo) VALUES
('Mariana Silva', 'mariana@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=24', true),
('Rafael Mendes', 'rafael@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=13', true),
('Beatriz Alves', 'beatriz@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=45', true),
('Gabriel Costa', 'gabriel@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=58', true),
('Camila Rodrigues', 'camila@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=31', true),
('Felipe Santos', 'felipe@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=67', true),
('Larissa Oliveira', 'larissa@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=28', true),
('Bruno Ferreira', 'bruno@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=70', true),
('Amanda Souza', 'amanda@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=36', true),
('Diego Lima', 'diego@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=52', true),
('Patricia Santos', 'patricia@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=43', true),
('Rodrigo Martins', 'rodrigo@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=71', true),
('Isabela Pereira', 'isabela@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=29', true),
('Thiago Almeida', 'thiago@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=65', true),
('Carolina Costa', 'carolina@estudante.com', 'temp', 'PASSAGEIRO', 'https://i.pravatar.cc/150?img=38', true);

-- 6. APROVAR NOVOS PASSAGEIROS
-- Distribuindo entre as linhas (pontos 7-21)
INSERT INTO passageiros (usuario_id, universidade_id, ponto_padrao_id, aprovado, aprovado_em, aprovado_por) 
SELECT 
    u.id,
    1,
    (SELECT id FROM pontos OFFSET (u.id % 15) LIMIT 1),
    true,
    CURRENT_TIMESTAMP,
    1
FROM usuarios u
WHERE u.papel = 'PASSAGEIRO' AND u.id > 8;

-- 7. CRIAR VIAGENS PARA OS PRÓXIMOS 5 DIAS
-- Amanhã
INSERT INTO viagens (linha_id, data, status, total_planejado, token_qr_hash) VALUES
(1, CURRENT_DATE + INTERVAL '1 day', 'PLANEJADA', 4, md5(random()::text)),
(2, CURRENT_DATE + INTERVAL '1 day', 'PLANEJADA', 3, md5(random()::text)),
(3, CURRENT_DATE + INTERVAL '1 day', 'PLANEJADA', 3, md5(random()::text)),
(4, CURRENT_DATE + INTERVAL '1 day', 'PLANEJADA', 3, md5(random()::text)),
(5, CURRENT_DATE + INTERVAL '1 day', 'PLANEJADA', 2, md5(random()::text));

-- Depois de amanhã
INSERT INTO viagens (linha_id, data, status, total_planejado, token_qr_hash) VALUES
(1, CURRENT_DATE + INTERVAL '2 days', 'PLANEJADA', 4, md5(random()::text)),
(2, CURRENT_DATE + INTERVAL '2 days', 'PLANEJADA', 3, md5(random()::text)),
(3, CURRENT_DATE + INTERVAL '2 days', 'PLANEJADA', 3, md5(random()::text)),
(4, CURRENT_DATE + INTERVAL '2 days', 'PLANEJADA', 3, md5(random()::text)),
(5, CURRENT_DATE + INTERVAL '2 days', 'PLANEJADA', 2, md5(random()::text));

-- Daqui a 3 dias
INSERT INTO viagens (linha_id, data, status, total_planejado, token_qr_hash) VALUES
(1, CURRENT_DATE + INTERVAL '3 days', 'PLANEJADA', 4, md5(random()::text)),
(2, CURRENT_DATE + INTERVAL '3 days', 'PLANEJADA', 3, md5(random()::text)),
(3, CURRENT_DATE + INTERVAL '3 days', 'PLANEJADA', 3, md5(random()::text)),
(4, CURRENT_DATE + INTERVAL '3 days', 'PLANEJADA', 3, md5(random()::text)),
(5, CURRENT_DATE + INTERVAL '3 days', 'PLANEJADA', 2, md5(random()::text));

-- 8. HISTÓRICO - Viagens passadas (ontem e anteontem)
INSERT INTO viagens (linha_id, data, status, total_planejado, total_embarcados, total_desembarcados, token_qr_hash, iniciada_em, finalizada_em) VALUES
-- Ontem
(1, CURRENT_DATE - INTERVAL '1 day', 'FINALIZADA', 4, 4, 4, md5(random()::text), CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 1 hour'),
(2, CURRENT_DATE - INTERVAL '1 day', 'FINALIZADA', 3, 3, 3, md5(random()::text), CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 1 hour'),
-- Anteontem
(1, CURRENT_DATE - INTERVAL '2 days', 'FINALIZADA', 4, 4, 4, md5(random()::text), CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours', CURRENT_TIMESTAMP - INTERVAL '2 days 1 hour'),
(2, CURRENT_DATE - INTERVAL '2 days', 'FINALIZADA', 3, 2, 2, md5(random()::text), CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours', CURRENT_TIMESTAMP - INTERVAL '2 days 1 hour');

-- 9. MAIS MENSAGENS
INSERT INTO mensagens (origem, remetente_id, linha_id, titulo, corpo) VALUES
('ADM', 1, NULL, 'Manutenção Preventiva', 'No próximo sábado faremos manutenção nos veículos. Não haverá viagens.'),
('MOTORISTA', 2, 1, 'Mudança de Rota', 'Devido a obras na Rua XV, faremos desvio temporário.'),
('ADM', 1, 3, 'Nova Linha Inaugurada', 'A Linha 3 - Garcia/Campus está operacional!'),
('MOTORISTA', 3, 2, 'Horário Especial', 'Amanhã sairemos 10 minutos mais cedo devido ao evento na universidade.');

-- RESUMO FINAL
SELECT 'Dados extras inseridos com sucesso!' as resultado;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_passageiros FROM passageiros;
SELECT COUNT(*) as total_motoristas FROM motoristas;
SELECT COUNT(*) as total_linhas FROM linhas;
SELECT COUNT(*) as total_viagens FROM viagens;
SELECT COUNT(*) as total_mensagens FROM mensagens;