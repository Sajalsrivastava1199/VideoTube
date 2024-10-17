import { asyncHandler } from "../utils/asyncHandler.js";
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../db/redisindex.js'
import e, { response } from "express";


const limiter =  asyncHandler(async(req,res,next,err) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // console.log(ip)
  const requests = await redisClient.incr(ip)
  let ttl
  if(requests == 1){
    await redisClient.expire(ip,60)
    ttl = 60
  }else{
    ttl = await redisClient.ttl(ip)
  }

  if(requests>10){
    return res.status(503).json({
      response:"error",
      callsMade:requests,
      ttl      
    })
  }
  else{next()} 
})


  export default limiter;