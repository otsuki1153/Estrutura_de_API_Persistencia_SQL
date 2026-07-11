import {z} from 'zod';

const TaskSchema = z.object({
    title : z.string().trim().min(1, "O título é Obrigatório")
});

export default TaskSchema;