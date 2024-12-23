import express from "express"
import { PrismaClient } from "@prisma/client"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { completeAppointmentSchema, createAppointmentSchema, doctorIdSchema } from "../zod/zod.js"

const router = express.Router()
const prisma = new PrismaClient()

router.get('/today', authMiddleware, async (req, res)=>{
    const { success } = doctorIdSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.findMany({
        orderBy:{
            Time: "asc"
        },
        where: {
            DoctorId: req.body.doctorId,
            Date: new Date().toLocaleDateString()
        }
    })
    return res.json(result)
})

router.get('/upcoming', authMiddleware, async (req, res)=>{
    const { success } = doctorIdSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.findMany({
        orderBy:{
            Time: "asc"
        },
        where: {
            DoctorId: req.body.doctorId,
            IsDone: false,
            Date: new Date().toLocaleDateString()
        }
    })
    return res.json(result)
})

router.get('/current', authMiddleware, async (req, res)=>{
    const { success } = doctorIdSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.findFirst({
        orderBy: {
            Time: "asc"
        },
        where: {
            DoctorId: req.body.doctorId,
            IsDone: false,
            Date: new Date().toLocaleDateString(),
        }
    })
    return res.json(result)
})

router.get('/done', authMiddleware, async (req, res)=>{
    const { success } = doctorIdSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.findMany({
        orderBy:{
            Time: "desc"
        },
        where: {
            DoctorId: req.body.doctorId,
            IsDone: true,
            Date: new Date().toLocaleDateString()
        }
    })
    return res.json(result)
})

router.post('/create', authMiddleware, async(req, res)=>{
    const { success } = createAppointmentSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.create({
        data: {
            DoctorId: req.body.doctorId,
            PatientId: req.body.patientId,
            Date: req.body.date,
            Time: req.body.time
        }
    })
    return res.json(result)
})

router.put('/complete',  authMiddleware, async (req,res)=>{
    const { success } = completeAppointmentSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.update({
        where: {
            DoctorId: req.body.doctorId,
            ID: req.body.appointmentId
        },
        data: {
            IsDone: true
        }
    })
    return res.json(result)
})

export const appointmentRouter = router