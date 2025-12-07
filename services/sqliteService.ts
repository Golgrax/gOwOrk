
import initSqlJs, { Database, QueryExecResult } from 'sql.js';

class SqliteService {
  db: Database | null = null;
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        // Manually fetch WASM to avoid environment detection issues (e.g. unenv polyfilling fs)
        // This prevents the library from trying to use fs.readFileSync
        const wasmUrl = 'https://sql.js.org/dist/sql-wasm.wasm';
        const wasmResponse = await fetch(wasmUrl);
        if (!wasmResponse.ok) throw new Error(`Failed to load WASM: ${wasmResponse.statusText}`);
        const wasmBinary = await wasmResponse.arrayBuffer();

        const SQL = await initSqlJs({
          wasmBinary
        });

        const savedDb = localStorage.getItem('gowork_sqlite_db');
        if (savedDb) {
           const binary = this.base64ToUint8Array(savedDb);
           this.db = new SQL.Database(binary);
        } else {
           this.db = new SQL.Database();
        }
        
        // Always run migrations to ensure new tables exist
        this.runMigrations();
        
        resolve();
      } catch (e) {
        console.error("Failed to init SQLite", e);
        reject(e);
      }
    });
    return this.initPromise;
  }

  private runMigrations() {
      if (!this.db) return;
      
      const schema = `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            password_hash TEXT,
            name TEXT,
            role TEXT,
            level INTEGER DEFAULT 1,
            current_xp INTEGER DEFAULT 0,
            current_gold INTEGER DEFAULT 0,
            current_hp INTEGER DEFAULT 100,
            total_hp INTEGER DEFAULT 100,
            streak INTEGER DEFAULT 0,
            last_login_date TEXT,
            last_spin_date TEXT,
            last_mystery_box_date TEXT,
            last_arcade_play_time INTEGER,
            skill_points INTEGER DEFAULT 0,
            kudos_received INTEGER DEFAULT 0,
            is_banned BOOLEAN DEFAULT 0,
            avatar_json TEXT,
            inventory TEXT,
            achievements TEXT,
            unlocked_skills TEXT,
            pet_json TEXT
        );

        CREATE TABLE IF NOT EXISTS attendance_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            date TEXT,
            time_in TEXT,
            time_out TEXT,
            status TEXT,
            xp_earned INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
        
        -- New Audit Logs for Admin
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            action_type TEXT, -- 'SPIN', 'SHOP', 'QUEST', 'ADMIN', 'ARCADE'
            details TEXT,
            timestamp INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS active_quests (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            reward_gold INTEGER,
            reward_xp INTEGER,
            type TEXT,
            expires_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS completed_quests (
            user_id TEXT,
            quest_id TEXT,
            status TEXT DEFAULT 'pending', -- 'pending' | 'approved'
            PRIMARY KEY (user_id, quest_id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
        
        -- Global Settings KV Store
        CREATE TABLE IF NOT EXISTS game_globals (
            key TEXT PRIMARY KEY,
            value TEXT
        );
      `;
      this.db.run(schema);

      // Manual Migration for existing databases to add status column
      try {
          this.db.exec("ALTER TABLE completed_quests ADD COLUMN status TEXT DEFAULT 'approved'");
      } catch (e) {
          // Column likely exists or table just created
      }

      this.save();
  }

  exec(sql: string, params?: any[]): QueryExecResult[] {
    if (!this.db) throw new Error("DB not initialized");
    return this.db.exec(sql, params);
  }

  // Helper for single row queries
  getAsObject(sql: string, params?: any[]): any | null {
      if (!this.db) throw new Error("DB not initialized");
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
          const res = stmt.getAsObject();
          stmt.free();
          return res;
      }
      stmt.free();
      return null;
  }

  // Helper for multi row queries
  getAllObjects(sql: string, params?: any[]): any[] {
      if (!this.db) throw new Error("DB not initialized");
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      const results = [];
      while(stmt.step()) {
          results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
  }

  run(sql: string, params?: any[]) {
      if (!this.db) throw new Error("DB not initialized");
      this.db.run(sql, params);
      this.save();
  }

  save() {
      if (!this.db) return;
      const data = this.db.export();
      const base64 = this.uint8ArrayToBase64(data);
      localStorage.setItem('gowork_sqlite_db', base64);
  }

  // Utils for persistence
  private uint8ArrayToBase64(u8: Uint8Array): string {
    let binary = '';
    const len = u8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(u8[i]);
    }
    return window.btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
  }
}

export const sqliteService = new SqliteService();
