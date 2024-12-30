import express from "express"
import { PrismaClient } from "@prisma/client"
import { patientSignupBody, patientSigninBody } from "../zod/zod"

const router = express.Router()
const prisma = new PrismaClient()

router.post("/signup", async (req,res)=>{
    const { success } = patientSignupBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        })
    }

    const existingPatient = await prisma.patient.findUnique({
        where: {
            UID: req.body.patientId
        }
    })
    if (existingPatient) {
        return res.status(411).json({
            message: "User already exists"
        })
    }

    const newPatient = await prisma.patient.create({
        data: {
            UID: req.body.patientId,
            Password: req.body.password,
            Name: req.body.name
        }
    })
    if(newPatient){
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
    }

    const token = jwt.sign({patientId: newPatient.UID}, process.env.JWT_SECRET)
    return res.json({
        newPatient,
        token
    })
})

router.get('/signin', async (req,res)=>{
    const { success } = patientSigninBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        })
    }

    const existingPatient = await prisma.patient.findUnique({
        where: {
            UID: req.body.patientId
        }
    })
    if (!existingPatient) {
        return res.status(411).json({
            message: "User does not exists"
        })
    }

    if(existingPatient.Password !== req.body.password){
        return res.status(411).json({
            message: "Incorrect Password"
        })
    }

    const token = jwt.sign({patientId: existingPatient.UID}, process.env.JWT_SECRET)
    return res.json({
        msg: "user logged in",
        patientId: existingPatient.UID,
        token
    })
})

router.get("/latetsPrescription", async (req, res)=>{
    
})
export const patientRouter = router