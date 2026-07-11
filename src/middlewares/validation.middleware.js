import TaskSchema from "../schemas/TaskSchema.js"

export default function validationMiddleware(req, res,next) {

    const result = TaskSchema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json({
            errors: result.error.issues.map(issue =>({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }
    req.body = result.data;
    next();
};
