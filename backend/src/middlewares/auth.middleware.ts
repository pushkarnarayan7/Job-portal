import type{Request, Response, NextFunction} from "express";
import { verifyJwt } from "../utils/jwt.js";

export const requireAuth = (
    req: Request, res:Response, next: NextFunction): void =>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        res.status(401).json({
            massage: "No token provided"
        });
        return;
    }

    const parts = authHeader.split(" ");
    if(parts.length !==2 || parts[0] !== "Bearer"){
        res.status(401).json({massage: "Invalid token format!"});
        return;
    }

    const Token = parts[1];
    
    if (!Token) {
        res.status(401).json({ message: "Token missing" });
        return;
    }
    console.log("Token recieved", Token);

    try{
        const decoded = verifyJwt(Token) as {
            userId : string;
            role: string;
        };
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };
        next();
    }catch{
        res.status(401).json({message: "Invalid or expired token!"});
        return;
    }
};