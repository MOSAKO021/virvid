import { StatusCodes } from "http-status-codes";
import User from "../models/UserModel.js";
import Job from "../models/JobModel.js";
import { hashPassword } from "../utils/passwordUtils.js";

export const getCurrentUser = async (req, res, id) => {
    id = req.user.userId
    const user = await User.findOne({_id:id})
    const userWithoutPassword = user.toJSON()
    res.status(StatusCodes.OK).json({user: userWithoutPassword})
}

export const getTeacher = async (req, res) => {
    const uid = req.params.id
    const teacher = await User.findById(uid);
    res.status(StatusCodes.OK).json({name:teacher.name})
}

export const getApplicationStats = async (req, res) => {
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const verifiedJobs = await Job.countDocuments({ verified: true });
    const unverifiedJobs = await Job.countDocuments({ verified: false });

    res.status(StatusCodes.OK).json({
        adminUsers,
        regularUsers,
        verifiedJobs,
        unverifiedJobs,
});
}
export const updateUser = async (req, res) => {
    const newPassword = req.body.password;
    const user = await User.findById(req.user.userId);
    const hashedPassword = await hashPassword(newPassword);
    if (newPassword) {
      user.password = hashedPassword;
      await user.save();
    }
    res.status(StatusCodes.OK).json({ msg: 'User updated successfully' });
}
