// require('dotenv').config() // using esm module type hence not workinh
import connectdb from "./db/index.js"; 
import dotenv from 'dotenv';
import {app} from './app.js'

dotenv.config();

console.log(process.env)

connectdb()
.then(() => {
    // console.log("Connection Established Succesfully")

    app.on("error",(error)=>{
        console.log("Error while Listening To Port",error)
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Connection Established Succesfully at ${process.env.PORT}`)
    })
})
.catch((error) =>{console.log("Connection Failed",error)})
 





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