import "./config/instrument.mjs"
import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerk.js";
import * as Sentry from "@sentry/node"
import userRouter from "./routes/userRoutes.js";

const app = express();

app.use(cors())
app.use(express.json());
app.use(clerkMiddleware());
app.post("/api/clerk", express.raw({ type: 'application/json' }), clerkWebhooks);
app.use("/api/user", userRouter);


const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Running');
});

app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});