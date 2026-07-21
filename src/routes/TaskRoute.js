import {Router} from "express";
import TaskControll from "../controllers/TaskControll.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import validationMiddleware from "../middlewares/validation.middleware.js";

const route = Router();

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Lista todas as tarefas
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
route.get("/", TaskControll.handleGetAll.bind(TaskControll));

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Lista a tarefa especificada com um id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Quando a Lista retorna com sucesso
 *       400:
 *          description: Erro quando o id é inválido
 *       404:
 *          description: Erro quando a Tarefa não é encontrada no banco de dados
 */
route.get("/:id", TaskControll.handleGetById.bind(TaskControll));

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Cria uma tarefa no banco de dados
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *              required:
 *                - title
 *     responses:
 *       201:
 *         description: Quando a tarefa é criada com sucesso
 *       400:
 *         description: Erro de validação (título ausente ou vazio)
 *       401:
 *         description: Erro quando o token não é enviado ou está inválido
 */
route.post("/",authMiddleware, validationMiddleware,TaskControll.handleCreate.bind(TaskControll));

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Atualiza uma tarefa especificada com id no banco de dados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa 
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *              required:
 *                - title
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *       400:
 *         description: Erro quando o id é inválido
 *       401:
 *         description: Erro quando o token não é enviado ou está inválido
 *       404:
 *         description: Erro quando a Tarefa não é encontrada no banco de dados
 */
route.put("/:id",authMiddleware, validationMiddleware, TaskControll.handleUpdate.bind(TaskControll));

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Remove uma tarefa especificada com id no banco de dados 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     responses:
 *       204:
 *         description: Tarefa removida com sucesso
 *       400:
 *         description: Erro quando o id é inválido
 *       401:
 *         description: Erro quando o token não é enviado ou está inválido
 *       404:
 *         description: Erro quando a Tarefa não é encontrada no banco de dados
 */
route.delete("/:id",authMiddleware, TaskControll.handleDelete.bind(TaskControll));

export default route;