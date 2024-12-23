import zod from "zod"

export const passwordSchema = zod.string().min(8).max(20).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/);

export const doctorIdSchema = zod.string()

export const patientIdSchema = zod.string()

export const appointmentIdSchema = zod.string();

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
    patientId: patientIdSchema,
    password: passwordSchema,
    age: zod.number(),
    sex: zod.enum(['M','F']),
    name: zod.string(),
    bloodGroup: zod.enum(["A+","B+","O+","AB+","A-","B-","O-","AB-"]),
})

export const createAppointmentSchema = zod.object({
    doctorId: doctorIdSchema,
    patientId: patientIdSchema,
    time: zod.string().regex(`^(0[0-9]|1[0-9]|2[0-4])\.(0[0-9]|[1-5][0-9])-(0[0-9]|1[0-9]|2[0-4])\.(0[0-9]|[1-5][0-9])$`),
    date: zod.string().regex(`^(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])\/(202[4-9]|20[3-9][0-9])$`)
})

export const completeAppointmentSchema = zod.object({
    doctorId: doctorIdSchema,
    appointmentId: appointmentIdSchema
})

export const createPrescriptionSchema = zod.object({
    doctorID: doctorIdSchema,
    patientId: patientIdSchema,
    appointmentId: appointmentIdSchema,
    currentCondition: zod.string(),
    diagnosis: zod.string(),
    treatment: zod.string(),
    advice: zod.string().optional()
})