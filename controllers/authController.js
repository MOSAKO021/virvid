import { StatusCodes } from "http-status-codes";
import User from "../models/UserModel.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import { UnauthenticatedError } from "../errors/customErrors.js";
import { createJWT } from "../utils/tokenUtils.js";

export const register = async(req, res) => {

    const hashedPassword = await hashPassword(req.body.password)
    req.body.password = hashedPassword

    const user = await User.create(req.body)
    res.status(StatusCodes.CREATED).json({msg : "user created"})
}
export const login = async(req, res) => {
    console.log("mail:::", req.body.email);
    const user = await User.findOne({email:req.body.email})
    console.log("USER:", user);
    console.log(req.body.password, "REQ PWD");
    console.log(user.password, "USER PWD");
    const isValidUser = user && await comparePassword(req.body.password, user.password)
    if (!isValidUser) throw new UnauthenticatedError('invalid credentials')

    const token = createJWT({userId: user._id, role: user.role, standard: user.standard})

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        secure: process.env.NODE_ENV === 'production'
        });
    res.status(StatusCodes.OK).json({msg: "user logged in"})
}

export const logout = (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    })
    res.status(StatusCodes.OK).json({msg: 'user logged out'})
}