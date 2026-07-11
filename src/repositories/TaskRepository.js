import db from '../database/connection.js';

class TaskRepository{
    async findAll(){
        const tasks = await db.all('SELECT * FROM tasks');
        return tasks;
    }

    async findById(id){
        const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
        return task || null;
    }

    async create(title){
        const result = await db.run('INSERT INTO tasks (title) VALUES (?)', [title]);
        return this.findById(result.lastID);
    }

    async update(data, id){
        const result = await db.run('UPDATE tasks SET title = ? WHERE id = ?', [data.title, id]);
        return this.findById(id);
    }

    async delete(id){
        const result = await db.run('DELETE FROM tasks WHERE id = ?', [id]);
        return result.changes > 0? true : false;
    }
}

export default new TaskRepository();