import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'iptv.db');

// Criar diretório se não existir
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

export default db;

export const query = (text: string, params: any[] = []) => {
  try {
    const stmt = db.prepare(text);
    if (text.trim().toLowerCase().startsWith('select')) {
      return stmt.all(...params);
    } else if (text.trim().toLowerCase().startsWith('insert')) {
      const result = stmt.run(...params);
      return { rows: [{ id: result.lastInsertRowid }] };
    } else {
      stmt.run(...params);
      return { rows: [] };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = () => {
  return db;
};
