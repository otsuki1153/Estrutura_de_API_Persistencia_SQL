import{open} from 'sqlite';
import sqlite3 from 'sqlite3'; 
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db.sqlite');


const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
});
export default db;