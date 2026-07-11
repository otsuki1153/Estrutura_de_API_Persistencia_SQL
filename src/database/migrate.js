import db from '../database/connection.js';

export default async function migrate() {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            title TEXT NOT NULL
        )
    `);
    console.log("Tabela 'tasks' criada com sucesso!");
}
