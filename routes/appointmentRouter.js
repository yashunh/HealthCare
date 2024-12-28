import express from "express"
import { PrismaClient } from "@prisma/client"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { completeAppointmentSchema, createAppointmentSchema, doctorIdSchema } from "../zod/zod.js"

const router = express.Router()
const prisma = new PrismaClient()

const today = new Date("2024-03-03");
let startOfDay = new Date(today);
let endOfDay = new Date(today);
startOfDay.setUTCHours(0, 0, 0, 0);
endOfDay.setUTCHours(23, 59, 59, 999);
startOfDay.setUTCHours(startOfDay.getUTCHours() - 5, startOfDay.getUTCMinutes() - 30);
endOfDay.setUTCHours(endOfDay.getUTCHours() - 5, endOfDay.getUTCMinutes() - 30);


router.get('/today', authMiddleware, async (req, res)=>{
    const { success } = doctorIdSchema.safeParse(req.body.doctorId)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.findMany({
        orderBy:{
            DateTime: "asc"
        },
        where: {
            DoctorId: req.body.doctorId,
            DateTime: {
                gte: startOfDay,
                lte: endOfDay,
            }
        }
    })
    return res.json(result)
})

router.get('/upcoming', authMiddleware, async (req, res)=>{
    const { success } = doctorIdSchema.safeParse(req.body.doctorId)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.findMany({
        orderBy:{
            DateTime: "asc"
        },
        where: {
            DoctorId: req.body.doctorId,
            IsDone: false,
            DateTime: {
                gte: startOfDay,
                lte: endOfDay,
            }
        }
    })
    return res.json(result)
})

router.get('/current', authMiddleware, async (req, res)=>{
    const { success } = doctorIdSchema.safeParse(req.body.doctorId)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.findFirst({
        take:1,
        orderBy: {
            DateTime: "asc"
        },
        where: {
            DoctorId: req.body.doctorId,
            IsDone: false,
            DateTime: {
                gte: startOfDay,
                lte: endOfDay,
            }
        }
    })
    return res.json(result)
})

router.get('/done', authMiddleware, async (req, res)=>{
    const { success } = doctorIdSchema.safeParse(req.body.doctorId)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId",
        })
    }
    const result = await prisma.appointment.findMany({
        orderBy:{
            DateTime: "desc"
        },
        where: {
            DoctorId: req.body.doctorId,
            IsDone: true,
            DateTime: {
                gte: startOfDay,
                lte: endOfDay,
            }
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
    const [hours, minutes] = req.body.time.split(':')
    const [year, month, date] = req.body.date.split('-');
    let dateTime = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(date, 10),
        parseInt(hours, 10),
        parseInt(minutes, 10)
      );
    dateTime.setUTCHours(dateTime.getUTCHours() - 5, dateTime.getUTCMinutes() - 30);
    const result = await prisma.appointment.create({
        data: {
            DoctorId: req.body.doctorId,
            PatientId: req.body.patientId,
            DateTime: dateTime
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
            ID: req.body.appointmentId
        },
        data: {
            IsDone: true
        }
    })
    return res.json(result)
})

export const appointmentRouter = router