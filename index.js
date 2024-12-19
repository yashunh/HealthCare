import { PrismaClient  } from "@prisma/client";
const prisma = new PrismaClient();

async function ab(){
   const res = await prisma.doctor.create({
    data: {
        Name: "sgfcsg",
        
    }
   }) 
   console.log(res)
}
//ab()