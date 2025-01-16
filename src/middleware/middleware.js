import nc from 'next-connect';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const middleware = () => {
    return nc({
        onError: (err, req, res, next) => {
            console.error(err.stack);
            res.status(500).end('Internal Server Error');
        },
        onNoMatch: (req, res) => {
            res.status(404).end('Route not found');
        },
    })
        .use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }))
        .use(cookieParser())
        .options('*', cors());
};

export default middleware;