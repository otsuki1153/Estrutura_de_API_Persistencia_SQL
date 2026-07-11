import app from './app.js';
import migrate from './database/migrate.js';
import env from './config/env.js';

async function startServer() {
    try {
        await migrate();
        app.listen(env.PORT, ()=>{
            console.log(`Servidor rodando no seguinte link http://localhost:${env.PORT}/`);
        })
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }   
}

startServer();