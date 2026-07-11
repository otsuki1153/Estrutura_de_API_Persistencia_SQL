export default function authMiddleware(req, res, next){
    const header = req.headers.authorization;

    if(!header){
        return res.status(401).json({
            error:"Token não enviado"
        });
    }

    const parts = header.split(" ");

    if(parts.length !== 2){
        return res.status(401).json({
            error:"Formato do token invalido"
        });
    }

    const [scheme, token] = parts;

    if(scheme.toLowerCase() !== "bearer"){
        return res.status(401).json({
            error: "Tipo de autenticação inválido"
        });
    }

    if(!token || token.trim() === ""){
        return res.status(401).json({
            error:"Token inválido"
        });
    }

    next();
}
