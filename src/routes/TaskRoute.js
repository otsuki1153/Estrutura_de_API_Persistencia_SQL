import {Router} from "express";
import TaskControll from "../controllers/TaskControll.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import validationMiddleware from "../middlewares/validation.middleware.js";

const route = Router();

route.get("/", TaskControll.handleGetAll.bind(TaskControll));

route.get("/:id", TaskControll.handleGetById.bind(TaskControll));

route.post("/",authMiddleware, validationMiddleware,TaskControll.handleCreate.bind(TaskControll));


route.put("/:id",authMiddleware, validationMiddleware, TaskControll.handleUpdate.bind(TaskControll));

route.delete("/:id",authMiddleware, TaskControll.handleDelete.bind(TaskControll));

export default route;