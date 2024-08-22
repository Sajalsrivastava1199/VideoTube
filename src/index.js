// require('dotenv').config() // using esm module type hence not workinh
import connectdb from "./db/index.js"; 
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env)

connectdb()





// dotenv.config(); // Load the environment variables from the .env file
// async function connectdb(){
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log(error)
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`APP is listening on Port ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.log("ERROR",error)
//         throw error
//     }
// }

// connectdb()