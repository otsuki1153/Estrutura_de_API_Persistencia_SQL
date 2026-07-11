import TaskRepository from '../repositories/TaskRepository.js';

class TaskService{

    async getAll(){
        return await TaskRepository.findAll();
    }   

    async getById(ParamId){
        return await TaskRepository.findById(ParamId);
    }

    async create(title){
        return await TaskRepository.create(title);
    }

    async update(OBJ, ParamId){
        return await TaskRepository.update(OBJ,ParamId);
    }

    async delete(ParamId){
        return TaskRepository.delete(ParamId);
    }
}

export default new TaskService();