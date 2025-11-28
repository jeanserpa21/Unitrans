-- =============================================
-- SCRIPT DE DADOS DE TESTE - UNITRANS
-- =============================================

-- 1. INSERIR UNIVERSIDADES
INSERT INTO universidades (nome, cidade, endereco) VALUES
('FURB - Universidade Regional de Blumenau', 'Blumenau', 'Rua Antônio da Veiga, 140'),
('UNIVALI - Universidade do Vale do Itajaí', 'Itajaí', 'Rua Uruguai, 458')
ON CONFLICT DO NOTHING;

-- 2. INSERIR USUÁRIOS (Admin, Motorista, Passageiro)
-- Senha de todos: "senha123" (hash gerado)
INSERT INTO usuarios (nome, email, senha_hash, papel, ativo) VALUES
('Admin Unitrans', 'admin@unitrans.com', '$2b$10$OU.Gs66W74NecF1012P6OuXIzMuyCVhr/KQUalegjqPikrA.DWIKK', 'ADM', true),
('João Motorista', 'joao.motorista@unitrans.com', '$2b$10$OU.Gs66W74NecF1012P6OuXIzMuyCVhr/KQUalegjqPikrA.DWIKK', 'MOTORISTA', true),
('Carlos Estudante', 'carlos@estudante.com', '$2b$10$OU.Gs66W74NecF1012P6OuXIzMuyCVhr/KQUalegjqPikrA.DWIKK', 'PASSAGEIRO', true),
('Maria Silva', 'maria@estudante.com', '$2b$10$OU.Gs66W74NecF1012P6OuXIzMuyCVhr/KQUalegjqPikrA.DWIKK', 'PASSAGEIRO', true)
ON CONFLICT (email) DO NOTHING;

-- 3. INSERIR MOTORISTA
INSERT INTO motoristas (usuario_id, cnh, telefone, data_nascimento)
SELECT u.id, '12345678900', '(47) 99999-9999', '1985-05-15'
FROM usuarios u WHERE u.email = 'joao.motorista@unitrans.com'
ON CONFLICT DO NOTHING;

-- 4. INSERIR VEÍCULOS
INSERT INTO veiculos (modelo, marca, placa, ano, cor, capacidade, tipo) VALUES
('Sprinter', 'Mercedes-Benz', 'ABC-1234', 2022, 'Branco', 20, 'VAN'),
('Boxer', 'Peugeot', 'DEF-5678', 2021, 'Prata', 16, 'VAN')
ON CONFLICT (placa) DO NOTHING;

-- 5. INSERIR LINHAS
INSERT INTO linhas (nome, origem, destino, distancia_km, duracao_media) VALUES
('Linha 1 - Centro/FURB', 'Centro de Blumenau', 'Campus FURB', 8.5, '00:25:00'),
('Linha 2 - Garcia/FURB', 'Bairro Garcia', 'Campus FURB', 12.0, '00:35:00')
ON CONFLICT (nome) DO NOTHING;

-- 6. INSERIR PONTOS DE EMBARQUE
INSERT INTO pontos (linha_id, nome, ordem, latitude, longitude) 
SELECT l.id, 'Centro - Praça Hercílio Luz', 1, -26.9194, -49.0661
FROM linhas l WHERE l.nome = 'Linha 1 - Centro/FURB'
ON CONFLICT DO NOTHING;

INSERT INTO pontos (linha_id, nome, ordem, latitude, longitude)
SELECT l.id, 'Rua 7 de Setembro', 2, -26.9150, -49.0680
FROM linhas l WHERE l.nome = 'Linha 1 - Centro/FURB'
ON CONFLICT DO NOTHING;

INSERT INTO pontos (linha_id, nome, ordem, latitude, longitude)
SELECT l.id, 'Campus FURB - Portaria Principal', 3, -26.9051, -49.0668
FROM linhas l WHERE l.nome = 'Linha 1 - Centro/FURB'
ON CONFLICT DO NOTHING;

-- 7. INSERIR PASSAGEIROS
INSERT INTO passageiros (
  usuario_id, 
  cpf, 
  telefone, 
  universidade_id, 
  curso, 
  dias_transporte,
  aprovado,
  ponto_padrao_id
)
SELECT 
  u.id,
  '12345678901',
  '(47) 98888-8888',
  uni.id,
  'Engenharia de Software',
  '["SEG", "TER", "QUA", "QUI", "SEX"]'::jsonb,
  true,
  p.id
FROM usuarios u
CROSS JOIN universidades uni
CROSS JOIN pontos p
WHERE u.email = 'carlos@estudante.com'
  AND uni.nome LIKE '%FURB%'
  AND p.nome = 'Centro - Praça Hercílio Luz'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO passageiros (
  usuario_id,
  cpf,
  telefone,
  universidade_id,
  curso,
  dias_transporte,
  aprovado,
  ponto_padrao_id
)
SELECT 
  u.id,
  '98765432100',
  '(47) 97777-7777',
  uni.id,
  'Ciência da Computação',
  '["SEG", "QUA", "SEX"]'::jsonb,
  true,
  p.id
FROM usuarios u
CROSS JOIN universidades uni
CROSS JOIN pontos p
WHERE u.email = 'maria@estudante.com'
  AND uni.nome LIKE '%FURB%'
  AND p.nome = 'Rua 7 de Setembro'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 8. ATRIBUIR MOTORISTA E VEÍCULO À LINHA
UPDATE linhas 
SET 
  motorista_id = (SELECT id FROM motoristas WHERE cnh = '12345678900' LIMIT 1),
  veiculo_id = (SELECT id FROM veiculos WHERE placa = 'ABC-1234' LIMIT 1)
WHERE nome = 'Linha 1 - Centro/FURB';

-- 9. CRIAR VIAGEM DE HOJE
INSERT INTO viagens (
  linha_id,
  motorista_id,
  veiculo_id,
  data,
  horario_ida,
  horario_volta,
  status,
  tipo
)
SELECT 
  l.id,
  m.id,
  v.id,
  CURRENT_DATE,
  '07:00:00',
  '18:00:00',
  'ANDAMENTO',
  'IDA_VOLTA'
FROM linhas l
CROSS JOIN motoristas m
CROSS JOIN veiculos v
WHERE l.nome = 'Linha 1 - Centro/FURB'
  AND m.cnh = '12345678900'
  AND v.placa = 'ABC-1234'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 10. VINCULAR PASSAGEIROS À VIAGEM DE HOJE
INSERT INTO viagens_passageiros (viagem_id, passageiro_id, ponto_embarque_id, ponto_desembarque_id)
SELECT 
  v.id,
  p.id,
  p.ponto_padrao_id,
  (SELECT id FROM pontos WHERE nome = 'Campus FURB - Portaria Principal' LIMIT 1)
FROM viagens v
CROSS JOIN passageiros p
CROSS JOIN usuarios u
WHERE v.data = CURRENT_DATE
  AND u.id = p.usuario_id
  AND u.email IN ('carlos@estudante.com', 'maria@estudante.com')
ON CONFLICT DO NOTHING;

-- =============================================
-- VERIFICAR DADOS INSERIDOS
-- =============================================

-- Verificar usuários
SELECT id, nome, email, papel FROM usuarios;

-- Verificar viagem de hoje
SELECT 
  v.id,
  v.data,
  v.status,
  l.nome as linha,
  u.nome as motorista
FROM viagens v
INNER JOIN linhas l ON v.linha_id = l.id
INNER JOIN motoristas m ON v.motorista_id = m.id
INNER JOIN usuarios u ON m.usuario_id = u.id
WHERE v.data = CURRENT_DATE;

-- Verificar passageiros vinculados
SELECT 
  u.nome,
  u.email,
  p.aprovado,
  p.curso
FROM passageiros p
INNER JOIN usuarios u ON p.usuario_id = u.id;

-- Verificar vinculo viagem-passageiro
SELECT 
  u.nome as passageiro,
  v.data,
  v.status,
  l.nome as linha
FROM viagens_passageiros vp
INNER JOIN viagens v ON vp.viagem_id = v.id
INNER JOIN passageiros p ON vp.passageiro_id = p.id
INNER JOIN usuarios u ON p.usuario_id = u.id
INNER JOIN linhas l ON v.linha_id = l.id
WHERE v.data = CURRENT_DATE;