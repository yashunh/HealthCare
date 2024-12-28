import express from "express"
import { docRouter } from "./routes/doctorRouter.js";
import { appointmentRouter } from "./routes/appointmentRouter.js"
import { patientRouter } from "./routes/patientRouter.js"
import { prescriptionRouter } from "./routes/prescriptionRouter.js"

const  app = express()
app.use(express.json())

app.use('/doctor',docRouter)
app.use('/appointment',appointmentRouter)
app.use('/patient', patientRouter)
app.use('/prescription', prescriptionRouter)
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send({error:err})
})
  
app.listen(3000, ()=>{
    console.log('server is running at 3000')
})