import 'express-async-errors';
import Job from '../models/JobModel.js';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

export const textualDatas = async(req, res) => {
    try{
        const createdBy = req.user.userId;
        const verified = req.user.role === 'legend';

        const {topicName, subjectName, standard, video} = req.body;

        const job = new Job({
            topicName,
            subjectName,
            standard,
            video,
            createdBy,
            verified
        })
        await job.save();
        req.body.identifier = job._id;
        const job2 = await fileups(req, res);
        res.status(201).json(job2 );
    } catch (e){
        console.error(e);
        res.status(500).json({msg:"Edo dobindi"});
    }
}

export const addSummary = async (req, res) => {
  try {

    const { summary, identifier } = req.body;

    if (!summary || !identifier) {
      return res.status(400).json({ msg: 'Please provide summary and identifier' });
    }

    const job = await Job.findById(identifier);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    job.summary = summary;
    await job.save();

    res.status(StatusCodes.OK).json({ msg: 'Summary added successfully', job });
  } catch (error) {
    console.error('Error in addSummary:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Something went wrong', error: error.message });
  }
};


export const fileups = async(req, res) => {
    // var res2 = await textualDatas(req, res);
    // console.log("res2: ", res2);
    const flie = req.file;
    const identifier = req.body.identifier;
    // if (!flie){
    //     return res.status(400).json({message: "No file uploaded"})
    // }
    const job = await Job.findById(identifier)
    job.file = flie.path;
    await job.save();
    return job
    // res.status(201).json({job});
}

export const getAllJobs = async (req, res) => {
    let jobs;
    if (req.user.role === 'legend') {
        const { verified, sort } = req.query
        const queryObject = {
        };
        if (verified && verified !== 'all'){
            queryObject.verified = verified;
        }
        const sortOptions = {
            newest: '-createdAt',
            oldest: 'createdAt',
        }
        const sortKey = sortOptions[sort] || {verified: false};
        jobs = await Job.find(queryObject).sort(sortKey);
        res.status(StatusCodes.OK).json({ jobs })
    } else {
        if (req.user.role === 'admin') {
            const {verified, sort} = req.query;
            const queryObject = { createdBy: req.user.userId };
            if (verified && verified !== 'all') {
                queryObject.verified = verified;
            }
            const sortOptions = {
                newest : '-createdAt',
                oldest: 'createdAt',
            }
            const sortKey = sortOptions[sort] || sortOptions.newest;
            const jobs = await Job.find(queryObject).sort(sortKey);
            res.status(StatusCodes.OK).json({ jobs })

        } else {
            const jobs = await Job.find({ standard: req.user.standard, verified: true })
            res.status(StatusCodes.OK).json({ jobs })
        }
    }
};



export const createJob = async (req, res) => {
    console.log("file log be: ",req.file);
    console.log("req___________________________________________________: ",req);
    try {
        const createdBy = req.user.userId;
        const verified = req.user.role === 'legend';
        // const filePath = req.file.path; 
        const tname = req.body.topicName;
        console.log("tnmae: ", tname);
        const sname = req.body.subjectName;
        console.log("sname: ", sname);
        const vid = req.body.video;
        console.log("vid: ", vid);
        const stan = req.body.standard;        
        console.log("stan: ", stan);


        const job = new Job({
            tname,
            sname,
            // file: filePath,
            vid,
            stan,
            createdBy,
            verified
        });

        // Save the job to the database
        await job.save();

        // Respond with success message
        res.status(201).json( job._id);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};




export const getJob = async (req, res) => {
    console.log(req.params);
    const job = await Job.findById(req.params.id)
    res.status(StatusCodes.OK).json({ job });
}

export const deleteJob = async (req, res) => {
    const removedJob = await Job.findByIdAndDelete(req.params.id)
    res.status(StatusCodes.OK).json({ msg: 'job deleted', job: removedJob });
}

export const updateJob = async (req, res) => {
    if (req.user.role === 'legend') {
        const verifiedJob = await Job.findByIdAndUpdate(req.params.id, { $set: { verified: true } }, { new: true });
        res.status(StatusCodes.OK).json({ msg: 'Job verified successfully', job: verifiedJob });
    } else {
        throw new UnauthorizedError('Only legends can verify jobs.');
    }
};


export const showStats = async (req, res) => {
    let stats = await Job.aggregate([
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(req.user.userId),
            },
        },
        {
            $group: {
                _id: '$verified',
                count: { $sum: 1 },
            },
        },
    ]);

    stats = stats.reduce((acc, curr) => {
        const { _id: verified, count } = curr;
        if (verified === true) {
            acc.verified = count;
        } else {
            acc.unverified = count;
        }
        return acc;
    }, {});

    const defaultStats = {
        verified: stats.verified || 0,
        unverified: stats.unverified || 0,
    };

    res.status(StatusCodes.OK).json({ defaultStats });
};
