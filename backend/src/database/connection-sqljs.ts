import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;
let SQL: any = null;

const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'iptv.db');

// Criar diretório se não existir
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export async function initDatabase(): Promise<void> {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  // Carregar banco de dados existente ou criar novo
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    saveDatabase();
  }

  // Habilitar foreign keys
  db.run('PRAGMA foreign_keys = ON');
}

function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function query(text: string, params: any[] = []): any {
  const database = getDatabase();
  
  try {
    if (text.trim().toLowerCase().startsWith('select')) {
      const stmt = database.prepare(text);
      stmt.bind(params);
      const result = [];
      while (stmt.step()) {
        result.push(stmt.getAsObject());
      }
      stmt.free();
      return result;
    } else if (text.trim().toLowerCase().startsWith('insert')) {
      const stmt = database.prepare(text);
      stmt.bind(params);
      stmt.run();
      stmt.free();
      saveDatabase();
      const lastId = database.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
      return { rows: [{ id: lastId }] };
    } else {
      const stmt = database.prepare(text);
      stmt.bind(params);
      stmt.run();
      stmt.free();
      saveDatabase();
      return { rows: [] };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export function getClient(): Database {
  return getDatabase();
}
