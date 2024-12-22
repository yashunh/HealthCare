import express from "express"
import { PrismaClient  } from "@prisma/client";
import { docRouter } from "./routes/doctorRouter.js";
import { appointmentRouter } from "./routes/appointmentRouter.js"

const prisma = new PrismaClient();
const  app = express()
app.use(express.json())

app.use('/doctor',docRouter)
app.use('/appointment',appointmentRouter)


app.listen(3000, ()=>{
    console.log('server is running at 3000')
})