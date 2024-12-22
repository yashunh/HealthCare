import express from "express"
import { PrismaClient } from "@prisma/client"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { uidSchema } from "../zod/zod.js"

const router = express.Router()
const prisma = new PrismaClient()

router.get('/today', authMiddleware, async (req, res)=>{
    const { success } = uidSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect uid",
        })
    }
    const result = await prisma.appointment.findMany({
        orderBy:{
            Time: "asc"
        },
        where: {
            DoctorId: req.body.uid,
            Date: new Date().toLocaleDateString()
        }
    })
    return res.json(result)
})

router.get('/upcoming', authMiddleware, async (req, res)=>{
    const { success } = uidSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect uid",
        })
    }
    const result = await prisma.appointment.findMany({
        orderBy:{
            Time: "asc"
        },
        where: {
            DoctorId: req.body.uid,
            IsDone: false,
            Date: new Date().toLocaleDateString()
        }
    })
    return res.json(result)
})

router.get('/completed', authMiddleware, async (req, res)=>{
    const { success } = uidSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect uid",
        })
    }
    const result = await prisma.appointment.findMany({
        orderBy:{
            Time: "desc"
        },
        where: {
            DoctorId: req.body.uid,
            IsDone: true,
            Date: new Date().toLocaleDateString()
        }
    })
    return res.json(result)
})
export const appointmentRouter = router