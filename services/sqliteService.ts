
// This service is DEPRECATED in favor of Server-Side SQLite (server.js) + API (gameService.ts)
// Keeping the file to prevent import errors if referenced, but functionality is stripped.

class SqliteService {
  async init() {
    console.log("[SQLite] Client-side DB disabled. Using Server API.");
  }
  
  run() {}
  exec() { return []; }
  getAsObject() { return null; }
  getAllObjects() { return []; }
  save() {}
  getDbSize() { return 0; }
}

export const sqliteService = new SqliteService();
