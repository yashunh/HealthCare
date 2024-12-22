import zod from "zod"

export const passwordSchema = zod.string().min(8).max(20).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/);

export const uidSchema = zod.string()

export const signupBody = zod.object({
    uid: uidSchema,
    password: passwordSchema,
    name: zod.string()
})

export const signinBody = zod.object({
    uid: uidSchema,
    password: passwordSchema
})

export const newPatientSchema = zod.object({
    
})