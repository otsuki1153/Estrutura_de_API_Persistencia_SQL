import rateLimit from 'express-rate-limit';

const limitOptions = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
});

export default limitOptions;