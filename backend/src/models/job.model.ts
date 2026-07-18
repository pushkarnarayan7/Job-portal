import mongoose, {Schema, Document} from "mongoose";

export interface JobDocument extends Document {
    title: string;
    company:string;
    createdBy: string;
    openings:number;
    eligibility: string;
}

const JobSchema = new Schema <JobDocument>(
{
    title:{
        type:String,
        required: true,
        trim: true,
    },
    company:{
        type:String,
        required:true,
        trim: true,
    },
    createdBy:{
        type: String,
        required:true,
    },
    openings:{
        type: Number,
        required:true,
        min: 1,
    },
    eligibility:{
        type:String,
    },
},
{
  timestamps: true,  
});

export const Job = mongoose.model<JobDocument>("Job", JobSchema);