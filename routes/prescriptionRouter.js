import express from "express"
import { PrismaClient } from "@prisma/client"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { createPrescriptionSchema } from "../zod/zod.js"

const router = express.Router()
const prisma = new PrismaClient()

router.post('/create', authMiddleware, async (req, res)=>{
    const { success } = createPrescriptionSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        })
    }
    
    const { doctorID, patientId, appointmentId, currentCondition, diagnosis, treatment, advice} = req.body
    const result = await prisma.prescription.create({
        data: {
            DoctorId: doctorID,
            PatientId: patientId,
            AppointmentId: appointmentId,
            CurrentCondition: currentCondition,
            Diagnosis: diagnosis,
            Treatment: treatment,
            Advice: advice || ""
        }
    })
    return res.json(result)
})

export const prescriptionRouter = router