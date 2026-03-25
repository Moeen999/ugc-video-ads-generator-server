import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerk.js";

const app = express();

app.use(cors())
app.post("/api/clerk", express.raw({ type: 'application/json' }), clerkWebhooks)

app.use(express.json());
app.use(clerkMiddleware());


const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Running');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});