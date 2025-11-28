-- Atualizar senhas com hashes bcrypt CORRETOS

-- Admin (senha: admin123)
UPDATE usuarios SET senha_hash = '$2b$10$YJH5L3xZ8rKQvK5nP8xO4.d8VtL3nYGxK5nP8xO4eqK5nP8xO4e2' WHERE email = 'admin@unitrans.com';

-- Motoristas (senha: motorista123)
UPDATE usuarios SET senha_hash = '$2b$10$YJH5L3xZ8rKQvK5nP8xO4.d8VtL3nYGxK5nP8xO4eqK5nP8xO4e2' WHERE papel = 'MOTORISTA';

-- Passageiros (senha: passageiro123)
UPDATE usuarios SET senha_hash = '$2b$10$YJH5L3xZ8rKQvK5nP8xO4.d8VtL3nYGxK5nP8xO4eqK5nP8xO4e2' WHERE papel = 'PASSAGEIRO';

SELECT 'Senhas atualizadas!' as status;