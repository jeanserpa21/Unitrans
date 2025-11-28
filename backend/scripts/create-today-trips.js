require('dotenv').config();
const db = require('../config/database');

async function createTodayTrips() {
  console.log('\n🚌 Criando viagens de hoje...\n');

  try {
    const hoje = new Date().toISOString().split('T')[0];
    console.log('📅 Data de hoje:', hoje);

    // Deletar viagens antigas de hoje (se existirem)
    await db.query('DELETE FROM passageiros_viagem WHERE viagem_id IN (SELECT id FROM viagens WHERE data = CURRENT_DATE)');
    await db.query('DELETE FROM viagens WHERE data = CURRENT_DATE');
    console.log('🗑️  Viagens antigas removidas\n');

    // Buscar linhas ativas
    const linhasQuery = `
      SELECT l.id, l.nome, l.motorista_id
      FROM linhas l
      WHERE l.ativo = true AND l.motorista_id IS NOT NULL
    `;
    const linhas = await db.query(linhasQuery);
    
    console.log(`📋 Encontradas ${linhas.rows.length} linhas ativas\n`);

    for (const linha of linhas.rows) {
      console.log(`🚌 Criando viagem para: ${linha.nome}`);
      
      // Buscar passageiros desta linha
      const passageirosQuery = `
        SELECT p.id, p.ponto_padrao_id
        FROM passageiros p
        INNER JOIN pontos pt ON p.ponto_padrao_id = pt.id
        WHERE pt.linha_id = $1 AND p.aprovado = true
      `;
      const passageiros = await db.query(passageirosQuery, [linha.id]);
      
      console.log(`   👥 ${passageiros.rows.length} passageiros aprovados`);

      // Criar viagem
      const viagemQuery = `
        INSERT INTO viagens (linha_id, data, status, total_planejado, token_qr_hash)
        VALUES ($1, CURRENT_DATE, 'PLANEJADA', $2, md5(random()::text))
        RETURNING id
      `;
      const viagem = await db.query(viagemQuery, [linha.id, passageiros.rows.length]);
      const viagemId = viagem.rows[0].id;
      
      console.log(`   ✅ Viagem criada (ID: ${viagemId})`);

      // Vincular passageiros
      for (const passageiro of passageiros.rows) {
        await db.query(`
          INSERT INTO passageiros_viagem (viagem_id, passageiro_id, ponto_id, status)
          VALUES ($1, $2, $3, 'AGUARDANDO')
        `, [viagemId, passageiro.id, passageiro.ponto_padrao_id]);
      }
      
      console.log(`   ✅ ${passageiros.rows.length} passageiros vinculados\n`);
    }

    console.log('🎉 Viagens de hoje criadas com sucesso!\n');
    
    // Mostrar resumo
    const resumo = await db.query(`
      SELECT 
        l.nome as linha,
        v.status,
        v.total_planejado,
        COUNT(pv.id) as passageiros_vinculados
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
      LEFT JOIN passageiros_viagem pv ON v.id = pv.viagem_id
      WHERE v.data = CURRENT_DATE
      GROUP BY l.nome, v.status, v.total_planejado
    `);
    
    console.log('📊 RESUMO:');
    resumo.rows.forEach(row => {
      console.log(`   ${row.linha}: ${row.passageiros_vinculados} passageiros [${row.status}]`);
    });
    console.log();

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createTodayTrips();