import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

// console.log("HELLO",process.env.MONGODB_URL,process.env.CLOUDINARY_CLOUD_NAME)


const uploadOnCloudinary = async (localFilePath) =>{
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_SECRET_KEY,
        secure: true
    });
    // Config Needs to be inside
    try{
        if(!localFilePath) return null
        // Upload file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // console.log("File Uploaded Successfully", cloudinary.config().cloud_name,response,response.url)
        fs.unlinkSync(localFilePath) // remove the file from local path
        return response
    }
    catch(error){
        fs.unlinkSync(localFilePath) // remove the file from local path
        console.log("why", cloudinary.config().cloud_name,error)
        return null
    }
}

const deleteFromCloudinary = async(publicUrl) =>{
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_SECRET_KEY,
        secure: true
    });
    // Config Needs to be inside
    try {
        if(!publicUrl){
            return null
        }
        resposne = await cloudinary.uploader.destroy(publicUrl, function() { console.log("Done") })
        return response
    } catch (error) {
        console.log("Issue while deleting old Image from Cloudinary Storage",error)
        return null;
        
    }

}

export {
    uploadOnCloudinary,
    deleteFromCloudinary,
} 

// Upload an image
// const uploadResult = await cloudinary.uploader
// .upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//         public_id: 'shoes',
//     }
// )
// .catch((error) => {
//     console.log(error);
// });