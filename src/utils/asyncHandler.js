const asyncHandler = (requestHandler) => (req,res,next) => {

    Promise.resolve(requestHandler(req,res,next)).
    then(()=>{
        
    })
    .catch((error) => {
        console.log(error)
        next(error)
    })

}

export {asyncHandler}


// const asyncHandler = (f0) => async (req,res,next) =>{
//     try{
//         await f0(req,res,next)
//     }
//     catch(error){
//         res.status(err.code||500).json({
//             "sucess":false,
//             "message":err.message
//         })
//     }
    
// }