import "dotenv/config";
import morgan from "morgan";
import cors from "cors";
import express, { NextFunction, Response, Request } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import createHttpError, { isHttpError } from "http-errors";
import notesRoutes from "./routes/notes";
import usersRoutes from "./routes/users";
import clinicsRoutes from "./routes/clinics";
import appointmentsRoutes from "./routes/appointments";
import authRoutes from "./routes/auth";
import env from "./util/validateEnv";
import { verifyJWT } from "./middleware/verifyJWT";

const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", env.FRONT_URL],
    methods: ["POST", "PUT", "PATCH", "GET", "OPTIONS", "HEAD", "DELETE"],
  })
);

app.use(express.json());

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
      sameSite: "lax",
    },
    rolling: true,
    store: MongoStore.create({
      mongoUrl: env.MONGO_CONNECTION_STRING,
    }),
  })
);

app.use("/api/notes", verifyJWT, notesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/clinics", clinicsRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res, next) => {
  next(createHttpError(404, "Rota não encontrada"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "Um erro inesperado aconteceu";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});

export default app;
