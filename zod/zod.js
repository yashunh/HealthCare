import zod from "zod"

export const passwordSchema = zod.string().min(8).max(20).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/);

export const doctorIdSchema = zod.string()

export const patientIdSchema = zod.string()

export const appointmentIdSchema = zod.string()

export const prescriptionIdSchema = zod.string()

export const timeSchema = zod.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/)

export const dateSchema =  zod.string().regex(/^(202[4-9]|20[3-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/)

export const signupBody = zod.object({
    doctorId: doctorIdSchema,
    password: passwordSchema,
    name: zod.string()
})

export const signinBody = zod.object({
    doctorId: doctorIdSchema,
    password: passwordSchema
})

export const newPatientSchema = zod.object({
    doctorId: doctorIdSchema,
    password: passwordSchema,
    age: zod.number(),
    sex: zod.enum(['M','F']),
    name: zod.string(),
    bloodGroup: zod.enum(["A+","B+","O+","AB+","A-","B-","O-","AB-"]),
})

export const addPatientSchema = zod.object({
    doctorId: doctorIdSchema,
    patientId: patientIdSchema
})

export const createAppointmentSchema = zod.object({
    doctorId: doctorIdSchema,
    patientId: patientIdSchema,
    time: timeSchema,
    date: dateSchema
})

export const completeAppointmentSchema = zod.object({
    doctorId: doctorIdSchema,
    appointmentId: appointmentIdSchema
})

export const createPrescriptionSchema = zod.object({
    prescription: zod.object({
        appointmentId: appointmentIdSchema,
        currentCondition: zod.string(),
        diagnosis: zod.string(),
        treatment: zod.string(),
        advice: zod.string().optional()
    }),
    medication: zod.object({
        medicine: zod.object(),
        dose: zod.object()
    }),
    reportUrl: zod.array(zod.string().url()),
    vitals: zod.object(),
    patientId: patientIdSchema,
    doctorId: doctorIdSchema
})

export const getPrescriptionSchema = zod.object({
    doctorId: doctorIdSchema,
    patientId: patientIdSchema
})