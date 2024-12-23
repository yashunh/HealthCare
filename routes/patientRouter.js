import express from "express"
import { PrismaClient } from "@prisma/client"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { doctorIdSchema } from "../zod/zod.js"

const router = express.Router()
const prisma = new PrismaClient()

export const patientRouter = router