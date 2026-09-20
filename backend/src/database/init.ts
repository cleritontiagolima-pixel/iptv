import fs from 'fs';
import path from 'path';
import { initDatabase, query } from './connection-sqljs';

export async function initializeDatabase() {
  try {
    await initDatabase();
    
    const schemaPath = path.join(__dirname, 'schema-sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Executar o schema linha por linha
    const statements = schema.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        query(statement);
      }
    }
    
    console.log('Banco de dados SQL.js inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Criar usuário admin padrão
export async function createDefaultAdmin() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Verificar se admin já existe
    const existingAdmin = query('SELECT * FROM users WHERE email = ?', ['admin@iptv.com']);
    
    if (!existingAdmin || existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      query(
        `INSERT INTO users (name, email, password, role, credits)
         VALUES (?, ?, ?, ?, ?)`,
        ['Admin', 'admin@iptv.com', hashedPassword, 'admin', 10000]
      );
      
      console.log('Usuário admin criado: admin@iptv.com / admin123');
    } else {
      console.log('Usuário admin já existe');
    }
  } catch (error) {
    console.error('Erro ao criar admin padrão:', error);
  }
}
