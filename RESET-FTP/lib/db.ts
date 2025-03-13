import Database from "better-sqlite3"
import { join } from "path"

const db = new Database(join(process.cwd(), "reset-soft.db"), { verbose: console.log })

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER,
    price REAL,
    isSubtreatment BOOLEAN NOT NULL,
    parentId INTEGER,
    FOREIGN KEY (parentId) REFERENCES treatments(id)
  );

  CREATE TABLE IF NOT EXISTS availabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treatmentId INTEGER NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    box TEXT NOT NULL,
    FOREIGN KEY (treatmentId) REFERENCES treatments(id)
  );
`)

export default db

