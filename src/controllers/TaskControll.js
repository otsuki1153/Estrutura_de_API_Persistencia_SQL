import TaskService from "../services/TaskService.js";
import AppError from "../utils/AppError.js";

class TaskControll{

    async handleGetAll(req, res, next){
        try {
            const Objlist = await TaskService.getAll();
            res.json(Objlist); 
        } catch (error) {
            next(error);
        }
        
    }

    async handleGetById(req, res, next){
        try {
            const ParamId = parseInt(req.params.id);

            if (isNaN(ParamId)) {
                throw new AppError("ID inválido", 400);
            }

            const Objlist = await TaskService.getById(ParamId);

            if(Objlist === null){
                throw new AppError("Tarefa não encontrada", 404);
            } else{
                res.json(Objlist); 
            }
        } catch (error) {
            next(error);
        }
    }
	

    async handleCreate(req, res, next){
        try {
            const {title} = req.body;
            const PostedOBJ = await TaskService.create(title);
            res.status(201).json(PostedOBJ);
        } catch (error) {
            next(error);
        }
    }

    async handleUpdate(req, res, next){
        try {
            const ParamId = parseInt(req.params.id);
            if (isNaN(ParamId)) {
                throw new AppError("ID inválido", 400);
            }
            const JSONbody = req.body;
            const AlteredOBJ = await TaskService.update(JSONbody, ParamId);

            if(AlteredOBJ === null){
                throw new AppError("Tarefa não encontrada", 404);
            }else{
                res.json(AlteredOBJ);
            }

        } catch (error) {
            next(error);
        }
    }


    async handleDelete(req, res, next){
        try{

            const ParamId = parseInt(req.params.id);
            if (isNaN(ParamId)) {
                throw new AppError("ID inválido", 400);
            }
            const ItemDeleted = await TaskService.delete(ParamId);
    
            if(!ItemDeleted){
                throw new AppError("Tarefa não encontrada", 404);
            } else{
                res.status(204).send();
            }
        } catch (error) {
            next(error);
        }
    }
}

export default new TaskControll();