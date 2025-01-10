import express from "express"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { signupBody, signinBody, doctorIdSchema, newPatientSchema, addPatientSchema} from "../zod/zod.js"

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
            UID: req.body.doctorId
        }
    })
    if (existingDoc) {
        return res.status(411).json({
            message: "User already exists"
        })
    }

    const newDoc = await prisma.doctor.create({
        data: {
            UID: req.body.doctorId,
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

    const token = jwt.sign({doctorId: newDoc.UID}, process.env.JWT_SECRET)
    return res.json({
        newDoc,
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
            UID: req.body.doctorId
        }
    })
    if (!existingDoc) {
        return res.status(411).json({
            message: "User does not exists"
        })
    }

    if(existingDoc.Password !== req.body.password){
        return res.status(411).json({
            message: "Incorrect Password"
        })
    }

    const token = jwt.sign({doctorId: existingDoc.UID}, process.env.JWT_SECRET)
    return res.json({
        msg: "user logged in",
        doctorId: existingDoc.UID,
        token
    })
})

router.post('/newPatient', authMiddleware, async (req, res)=>{
    const { success } = newPatientSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
            body: req.body
        })
    }

    const { doctorId, password, sex, age, name, bloodGroup } = req.body
    const patientId = Math.ceil(Math.random()*100) + ""
    const result = await prisma.patient.create({
        data:{
            UID: patientId,
            Name: name,
            Password: password,
            Sex: sex,
            Age: age,
            BloodGroup: bloodGroup
        }
    })

    if(!result){
        return res.status(411).json({
            message: "Error creating new Patient",
        })
    }
    const counterData = await prisma.counter.findFirst({
        where: {
            ID: process.env.PAITENT_COUNTER_ID
        }
    })
    await prisma.counter.update({
        where: {
            ID: process.env.PAITENT_COUNTER_ID
        },
        data: {
            Count: ++counterData.Count
        }
    })
    
    const doc = await prisma.doctor.findFirst({
        where:{
            UID: doctorId
        }
    })
    doc.PatientId.push(result.UID)
    await prisma.doctor.update({
        where: {
            UID: doctorId
        },
        data:{
            PatientId: doc.PatientId
        }
    })
    return res.json(result)
})

router.get('/latestPatient', authMiddleware ,async (req,res)=>{
    const { success } = doctorIdSchema.safeParse(req.body.doctorId)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId"
        })
    }

    const result = await prisma.appointment.findMany({
        take: 5,
        orderBy:{
            DateTime: 'desc'
        },
        where: {
            DoctorId: req.body.doctorId,
            IsDone: true
        }
    })

    return res.json(result)
})

router.post('/addPaitent',  authMiddleware ,async (req,res)=>{
    const { success } = addPatientSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect doctorId or patientId",
        })
    }
    const {doctorId, patientId} = req.body
    const doc = await prisma.doctor.findFirst({
        where:{
            UID: doctorId
        }
    })
    const patient = await prisma.patient.findFirst({
        where: {
            UID: patientId
        }
    })
    doc.PatientId.push(patient.UID)
    const result = await prisma.doctor.update({
        where: {
            UID: doctorId
        },
        data:{
            PatientId: doc.PatientId
        }
    })
    return res.json(result)
})

export const docRouter = router