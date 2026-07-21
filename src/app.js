import express from 'express';
import TaskRoute from "./routes/TaskRoute.js";

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

import CorsOPTIONS from './config/cors.js';
import helmet from 'helmet';
import cors from 'cors';
import limitOptions from './config/rateLimit.js';  

import notFoundMiddleware from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
import loggerMiddleware from './middlewares/logger.middleware.js';

const app = express();


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(helmet());
app.use(cors(CorsOPTIONS));
app.use(express.json());
app.use(loggerMiddleware);
app.use(limitOptions);
app.use("/tasks",TaskRoute);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;