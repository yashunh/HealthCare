import express from "express"
import { PrismaClient } from "@prisma/client"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { createPrescriptionSchema, getPrescriptionSchema } from "../zod/zod.js"

const router = express.Router()
const prisma = new PrismaClient()

router.post('/create', authMiddleware, async (req, res)=>{
    const result = createPrescriptionSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(411).json({
            message: "Incorrect inputs",
            result: result
        })
    }
    const { patientId, doctorId } = req.body
    const { appointmentId, currentCondition, diagnosis, treatment} = req.body.prescription
    let dateTime = new Date()
    dateTime.setUTCHours(dateTime.getUTCHours()-5,dateTime.getUTCMinutes()-30)
    const prescription = await prisma.prescription.create({
        data: {
            DoctorId: doctorId,
            PatientId: patientId,
            AppointmentId: appointmentId,
            CurrentCondition: currentCondition,
            Diagnosis: diagnosis,
            Treatment: treatment,
            Advice: req.body.prescription.advice || "",
            DateTime: dateTime
        }
    })
    let vital,medication,report
    if(req.body.vitals){
        vital = await prisma.vital.create({
            data: {
                Vitals: req.body.vitals,
                PrescriptionID: prescription.ID,
                PatientId: patientId
            }
        })
    }
    if(req.body.medication){
        medication = await prisma.medication.create({
            data: {
                Medicine: req.body.medication,
                PrescriptionID: prescription.ID,
                PatientId: patientId
            }
        })
    }
    if(req.body.reportUrl){
        report = await prisma.report.create({
            data: {
                URL: req.body.reportUrl,
                PrescriptionID: prescription.ID,
                PatientId: patientId
            }
        })
    }

    return res.send({
        prescription,
        vital: vital || "",
        report: report || "",
        medication: medication || "",
    })
})

router.get('/last', authMiddleware, async (req, res)=>{
    const { success } = getPrescriptionSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        })
    }

    const prescription = await prisma.prescription.findMany({
        take: 1,
        orderBy: {
            DateTime: "desc"
        },
        where: {
            PatientId: req.body.patientId
        }
    })

    const vitals = await prisma.vital.findFirst({
        where: {
            PrescriptionID: prescription.ID
        }
    })
    const medication = await prisma.medication.findFirst({
        where: {
            PrescriptionID: prescription.ID
        }
    })
    const reports = await prisma.medication.findFirst({
        where: {
            PrescriptionID: prescription.ID
        }
    })

    return res.send({
        prescription,
        vitals,
        medication,
        reports
    })
})

router.get('/history', authMiddleware, async (req, res)=>{
    const { success } = getPrescriptionSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        })
    }

    const result = await prisma.prescription.findMany({
        orderBy: {
            Date: "desc"
        },
        where: {
            PatientId: req.body.patientId
        },
        select: {
            Diagnosis: true,
            Date: true
        }
    })
    return res.json(result)
})

router.get('/:id', authMiddleware, async (req, res)=>{
    try{
        const prescription = await prisma.prescription.findFirst({
            where: {
                ID: req.params.id
            }
        })
        if(!prescription){
            return res.status(411).json({
                message: "Incorrect prescription id",
            })
        }

        const vitals = await prisma.vital.findFirst({
            where: {
                PrescriptionID: prescription.ID
            }
        })
        const medication = await prisma.medication.findFirst({
            where: {
                PrescriptionID: prescription.ID
            }
        })
        const reports = await prisma.report.findFirst({
            where: {
                PrescriptionID: prescription.ID
            }
        })

        return res.send({
            prescription,
            vitals,
            medication,
            reports
        })
    } catch(err){
        res.send({
            msg: "error",
            error: err
        })
    }
})

export const prescriptionRouter = router