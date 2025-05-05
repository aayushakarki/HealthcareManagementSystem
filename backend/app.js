import express from "express"
import { config } from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"
import { dbConnection } from "./database/dbConnection.js"
import { errorMiddleware } from "./middlewares/errorMiddleware.js"
import userRouter from "./router/userRouter.js"
import appointmentRouter from "./router/appointmentRouter.js"
import healthRecordRouter from "./router/healthRecordRouter.js"
import vitalsRouter from "./router/vitalsRouter.js"
import notificationRouter from "./router/notificationRouter.js"
import prescriptionRouter from "./router/prescriptionRouter.js"
import searchRouter from "./router/searchRouter.js"
import "./utils/reminderJobs.js"

const app = express()

config({ path: "./config/config.env" })

// Improved CORS configuration
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Improved file upload configuration
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    debug: process.env.NODE_ENV !== "production",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true,
    createParentPath: true,
  }),
)

// Increased body size limit for JSON and URL-encoded data
app.use(cookieParser())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Add request logging middleware for debugging
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
  })
}

app.use("/api/v1/user", userRouter)
app.use("/api/v1/appointment", appointmentRouter)
app.use("/api/v1/health-records", healthRecordRouter)
app.use("/api/v1/vitals", vitalsRouter)
app.use("/api/v1/notifications", notificationRouter)
app.use("/api/v1/prescriptions", prescriptionRouter)
app.use("/api/v1/search", searchRouter)

dbConnection()

app.use(errorMiddleware)
export default app
