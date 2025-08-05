import 'express-async-errors';
import Job from '../models/JobModel.js';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';


const checkForExplicitContent = async (text) => {
  const moderationPrompt = `
You are a strict content filter. Review the following text carefully for any explicit, sexual, violent, abusive, or inappropriate language.

If the content is completely clean and appropriate, respond with exactly: true

If the content is inappropriate, respond with a very short reason like: "offensive language" or "contains sexual content". No extra explanation.

Text:
"""${text}"""
`;

  try {
    const response = await fetch('http:localhost:5200/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: moderationPrompt }
        ]
      })
    });

    const data = await response.json();
    const aiReply = (data.response || '').trim().toLowerCase();

    const isClean = aiReply === 'true';
    return { isClean, reason: isClean ? null : aiReply };
  } catch (error) {
    console.error('Moderation check failed:', error);
    return { isClean: false, reason: 'AI moderation error' };
  }
};
export default checkForExplicitContent;

export const addJob = async (req, res) => {
    try {
        const createdBy = req.user.userId;
        const verified = req.user.role === 'legend';

        const { topicName, subjectName, standard, video } = req.body;
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
        const temp_file = job2.file;
        const file = 'http://localhost:5200/' + temp_file.replace(/\s/g, '%20');
        const response = await fetch(file);
        const pdfData = await response.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }
        const moderationResult = await checkForExplicitContent(fullText);
        if (!moderationResult.isClean) {
            await Job.findByIdAndDelete(job2._id); 
            return res.status(400).json({ msg: `Content rejected: ${moderationResult.reason}` });
        }
        job2.summary = fullText;
        job2.verified = true;
        await job2.save();
        res.status(201).json(job2);
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Error occurred while adding job. Please try again later." });
    }
}

export const addSummary = async (req, res) => {
    try {

        const { identifier } = req.body;

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


export const fileups = async (req, res) => {
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
        if (verified && verified !== 'all') {
            queryObject.verified = verified;
        }
        const sortOptions = {
            newest: '-createdAt',
            oldest: 'createdAt',
        }
        const sortKey = sortOptions[sort] || { verified: false };
        jobs = await Job.find(queryObject).sort(sortKey);
        res.status(StatusCodes.OK).json({ jobs })
    } else {
        if (req.user.role === 'admin') {
            const { verified, sort } = req.query;
            const queryObject = { createdBy: req.user.userId };
            if (verified && verified !== 'all') {
                queryObject.verified = verified;
            }
            const sortOptions = {
                newest: '-createdAt',
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
    try {
        const createdBy = req.user.userId;
        const verified = req.user.role === 'legend';
        const tname = req.body.topicName;
        const sname = req.body.subjectName;
        const vid = req.body.video;
        const stan = req.body.standard;

        const job = new Job({
            tname,
            sname,
            vid,
            stan,
            createdBy,
            verified
        });

        await job.save();

        res.status(201).json(job._id);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};




export const getJob = async (req, res) => {
    // console.log(req.params);
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
