import swaggerJsdoc from "swagger-jsdoc";
import env from "../config/env.js";

const host = env.IP; //configurar IP para o IP interno de ETHERNET da máquina

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tasks',
      version: '1.0.0',
      description: 'API de estudo para gerenciamento de tarefas'
    },
    servers: [{ url: `http://${host}:3000` }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer'
            }
        }
    }
  },
  apis: ['./src/routes/*.js'] 
};

export default swaggerJsdoc(options);