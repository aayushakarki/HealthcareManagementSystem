import express from "express"
import { config } from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"
import { dbConnection } from "./database/dbConnection.js"
import messageRouter from "./router/messageRouter.js"
import { errorMiddleware } from "./middlewares/errorMiddleware.js"
import userRouter from "./router/userRouter.js"
import appointmentRouter from "./router/appointmentRouter.js"
import healthRecordRouter from "./router/healthRecordRouter.js"
import vitalsRouter from "./router/vitalsRouter.js"
import notificationRouter from "./router/notificationRouter.js"

const app = express()

config({ path: "./config/config.env" })

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
)
app.use(
  fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: true // Add this for debugging
  })
);

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/message", messageRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/appointment", appointmentRouter)
app.use("/api/v1/health-records", healthRecordRouter)
app.use("/api/v1/vitals", vitalsRouter)
app.use("/api/v1/notifications", notificationRouter)

dbConnection()

app.use(errorMiddleware)
export default app
