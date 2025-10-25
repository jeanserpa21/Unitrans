-- =============================================
-- CRIAR VIAGEM PARA HOJE
-- =============================================

-- 1. LIMPAR VIAGENS ANTIGAS (OPCIONAL)
-- DELETE FROM viagens_passageiros;
-- DELETE FROM viagens;

-- 2. VERIFICAR SE JÁ EXISTE LINHA
DO $$
DECLARE
  v_linha_id INTEGER;
  v_motorista_id INTEGER;
  v_veiculo_id INTEGER;
  v_viagem_id INTEGER;
  v_passageiro_carlos_id INTEGER;
  v_passageiro_maria_id INTEGER;
  v_ponto_embarque_id INTEGER;
  v_ponto_desembarque_id INTEGER;
BEGIN

  -- Buscar IDs necessários
  SELECT id INTO v_linha_id FROM linhas WHERE nome LIKE '%Centro%' OR nome LIKE '%FURB%' OR nome LIKE '%Linha 1%' LIMIT 1;
  SELECT id INTO v_motorista_id FROM motoristas LIMIT 1;
  SELECT id INTO v_veiculo_id FROM veiculos LIMIT 1;
  
  -- Buscar passageiros
  SELECT p.id INTO v_passageiro_carlos_id 
  FROM passageiros p 
  INNER JOIN usuarios u ON p.usuario_id = u.id 
  WHERE u.email = 'carlos@estudante.com';
  
  SELECT p.id INTO v_passageiro_maria_id 
  FROM passageiros p 
  INNER JOIN usuarios u ON p.usuario_id = u.id 
  WHERE u.email = 'maria@estudante.com';
  
  -- Buscar pontos
  SELECT id INTO v_ponto_embarque_id FROM pontos ORDER BY id LIMIT 1;
  SELECT id INTO v_ponto_desembarque_id FROM pontos ORDER BY id DESC LIMIT 1;

  -- Verificar se temos os dados necessários
  IF v_linha_id IS NULL THEN
    RAISE NOTICE 'AVISO: Nenhuma linha encontrada. Criando linha padrão...';
    
    -- Criar linha padrão
    INSERT INTO linhas (nome, origem, destino, distancia_km, duracao_media, motorista_id, veiculo_id, ativo)
    VALUES (
      'Linha 1 - Centro/Campus',
      'Centro de Blumenau',
      'Campus Universitário',
      10.5,
      '00:30:00',
      v_motorista_id,
      v_veiculo_id,
      true
    )
    RETURNING id INTO v_linha_id;
    
    RAISE NOTICE 'Linha criada com ID: %', v_linha_id;
  END IF;

  -- Criar pontos se não existirem
  IF v_ponto_embarque_id IS NULL THEN
    INSERT INTO pontos (linha_id, nome, ordem, latitude, longitude)
    VALUES 
      (v_linha_id, 'Centro - Praça Principal', 1, -26.9194, -49.0661),
      (v_linha_id, 'Bairro Garcia', 2, -26.9150, -49.0680),
      (v_linha_id, 'Campus - Portaria', 3, -26.9051, -49.0668);
    
    SELECT id INTO v_ponto_embarque_id FROM pontos WHERE linha_id = v_linha_id ORDER BY ordem LIMIT 1;
    SELECT id INTO v_ponto_desembarque_id FROM pontos WHERE linha_id = v_linha_id ORDER BY ordem DESC LIMIT 1;
  END IF;

  -- 3. CRIAR VIAGEM DE HOJE
  RAISE NOTICE 'Criando viagem para hoje...';
  
  INSERT INTO viagens (
    linha_id,
    motorista_id,
    veiculo_id,
    data,
    horario_ida,
    horario_volta,
    status,
    tipo,
    criado_em
  )
  VALUES (
    v_linha_id,
    v_motorista_id,
    v_veiculo_id,
    CURRENT_DATE,
    '07:00:00',
    '18:00:00',
    'ANDAMENTO',  -- Status em andamento para poder fazer check-in
    'IDA_VOLTA',
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (linha_id, data, tipo) DO UPDATE
  SET status = 'ANDAMENTO',
      motorista_id = EXCLUDED.motorista_id,
      veiculo_id = EXCLUDED.veiculo_id
  RETURNING id INTO v_viagem_id;
  
  RAISE NOTICE 'Viagem criada/atualizada com ID: %', v_viagem_id;

  -- 4. VINCULAR PASSAGEIROS À VIAGEM
  IF v_passageiro_carlos_id IS NOT NULL THEN
    INSERT INTO viagens_passageiros (
      viagem_id,
      passageiro_id,
      ponto_embarque_id,
      ponto_desembarque_id,
      embarcou,
      desembarcou
    )
    VALUES (
      v_viagem_id,
      v_passageiro_carlos_id,
      v_ponto_embarque_id,
      v_ponto_desembarque_id,
      false,
      false
    )
    ON CONFLICT (viagem_id, passageiro_id) DO UPDATE
    SET embarcou = false, desembarcou = false;
    
    RAISE NOTICE 'Passageiro Carlos vinculado à viagem';
  END IF;

  IF v_passageiro_maria_id IS NOT NULL THEN
    INSERT INTO viagens_passageiros (
      viagem_id,
      passageiro_id,
      ponto_embarque_id,
      ponto_desembarque_id,
      embarcou,
      desembarcou
    )
    VALUES (
      v_viagem_id,
      v_passageiro_maria_id,
      v_ponto_embarque_id,
      v_ponto_desembarque_id,
      false,
      false
    )
    ON CONFLICT (viagem_id, passageiro_id) DO UPDATE
    SET embarcou = false, desembarcou = false;
    
    RAISE NOTICE 'Passageiro Maria vinculado à viagem';
  END IF;

END $$;

-- =============================================
-- VERIFICAR RESULTADOS
-- =============================================

SELECT '========================================' as separador;
SELECT 'VIAGEM DE HOJE CRIADA COM SUCESSO!' as resultado;
SELECT '========================================' as separador;

-- Ver viagem criada
SELECT 
  v.id as viagem_id,
  v.data,
  v.horario_ida,
  v.horario_volta,
  v.status,
  l.nome as linha,
  u.nome as motorista
FROM viagens v
INNER JOIN linhas l ON v.linha_id = l.id
LEFT JOIN motoristas m ON v.motorista_id = m.id
LEFT JOIN usuarios u ON m.usuario_id = u.id
WHERE v.data = CURRENT_DATE;

-- Ver passageiros vinculados
SELECT 
  vp.id,
  u.nome as passageiro,
  u.email,
  vp.embarcou,
  vp.desembarcou,
  pe.nome as ponto_embarque,
  pd.nome as ponto_desembarque
FROM viagens_passageiros vp
INNER JOIN viagens v ON vp.viagem_id = v.id
INNER JOIN passageiros p ON vp.passageiro_id = p.id
INNER JOIN usuarios u ON p.usuario_id = u.id
LEFT JOIN pontos pe ON vp.ponto_embarque_id = pe.id
LEFT JOIN pontos pd ON vp.ponto_desembarque_id = pd.id
WHERE v.data = CURRENT_DATE;