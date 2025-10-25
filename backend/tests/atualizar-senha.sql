UPDATE usuarios 
SET senha_hash = '$2b$10$OU.Gs66W74NecF1012P6OuXIzMuyCVhr/KQUalegjqPikrA.DWIKK'
WHERE email = 'carlos@estudante.com';

-- Verificar
SELECT email, substring(senha_hash, 1, 20) as hash_inicio 
FROM usuarios 
WHERE email = 'carlos@estudante.com';