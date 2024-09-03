// require('dotenv').config() // using esm module type hence not workinh
import dotenv from 'dotenv';
import connectdb from "./db/index.js"; 
import {app} from './app.js'


dotenv.config({
    path:"./.env"
});

// console.log(process.env)
// console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_SECRET_KEY);

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