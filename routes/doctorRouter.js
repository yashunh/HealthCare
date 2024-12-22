import express from "express"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { signupBody, signinBody, uidSchema} from "../zod/zod.js"

const router = express.Router()
const prisma = new PrismaClient()

router.post("/signup", async (req,res)=>{
    const { success } = signupBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        })
    }

    const existingDoc = await prisma.doctor.findUnique({
        where: {
            UID: req.body.uid
        }
    })
    if (existingDoc) {
        return res.status(411).json({
            message: "User already exists"
        })
    }

    const newDoc = await prisma.doctor.create({
        data: {
            UID: req.body.uid,
            Password: req.body.password,
            Name: req.body.name
        }
    })
    if(newDoc){
        const counterData = await prisma.counter.findFirst({
            where: {
                ID: process.env.DOCTOR_COUNTER_ID
            }
        })
        await prisma.counter.update({
            where: {
                ID: process.env.DOCTOR_COUNTER_ID
            },
            data: {
                Count: ++counterData.Count
            }
        })
    }

    const token = jwt.sign({uid: newDoc.UID}, process.env.JWT_SECRET)
    return res.json({
        msg: "user created",
        uid: newDoc.UID,
        token
    })
})

router.get('/signin', async (req,res)=>{
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        })
    }

    const existingDoc = await prisma.doctor.findUnique({
        where: {
            UID: req.body.uid
        }
    })
    if (!existingDoc) {
        return res.status(411).json({
            message: "User does not exists"
        })
    }

    if(existingDoc.password !== req.body.password){
        return res.status(411).json({
            message: "Incorrect Password"
        })
    }

    const token = jwt.sign({uid: existingDoc.UID}, process.env.JWT_SECRET)
    return res.json({
        msg: "user logged in",
        uid: existingDoc.UID,
        token
    })
})

router.post('/newPatient', authMiddleware, async (req, res)=>{
    const { success } = uidSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect uid",
        })
    }

    const result = await prisma.patient.create({
        data:{
            
        }
    })
})

router.get('/latestPatient', authMiddleware ,async (req,res)=>{
    const { success } = uidSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect uid",
        })
    }

    const result = await prisma.appointment.findMany({
        take: 15,
        orderBy:{
            Date: 'desc'
        },
        where: {
            DoctorId: req.body.uid,
            IsDone: true
        }
    })

    return res.json(result)
})

export const docRouter = router