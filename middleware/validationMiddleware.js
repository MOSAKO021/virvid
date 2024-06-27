import {body, param, validationResult} from 'express-validator'
import { BadRequestError, NotFoundError, UnauthenticatedError, UnauthorizedError } from '../errors/customErrors.js'
import mongoose from 'mongoose'
import Job from '../models/JobModel.js'
import User from '../models/UserModel.js'

const withValidationErrors = (validateValues) => {
    return [
        validateValues,
        (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          const errorMessages = errors.array().map((error) => error.msg)
          // console.log(errors)
          if(errorMessages[0].startsWith('no job') || errorMessages[0].startsWith('id is')) {
            throw new NotFoundError(errorMessages)
          }
          if (errorMessages[0].startsWith('not authorized')) {
            throw new UnauthorizedError('not authorized to access this route')
          }
          throw new BadRequestError(errorMessages)
        }
        next()
      },
    ]
}

export const validateJobInput = withValidationErrors([
    body('topicName').notEmpty().withMessage('topic is required'),
    body('subjectName').notEmpty().withMessage('subject is required'),
    // body('file').notEmpty().withMessage('file is required'),
])

export const validateIdParam = withValidationErrors([
  param('id')
    .custom(async (value, {req})=> {
      console.log(value);
      const isValidId = mongoose.Types.ObjectId.isValid(value)
      if (!isValidId) throw new BadRequestError('invalid MongoDB id')
      const job = await Job.findById(value)

      if(!job) throw new NotFoundError(`no job with id ${id}`)

      const isAdmin = (req.user.role === 'admin' || req.user.role === 'legend')
      const isOwner = req.user.userId === job.createdBy.toString()
      if (!isAdmin && !isOwner) 
        throw new UnauthorizedError('not authorized to access this route')

    })
])



export const validateRegisterInput = withValidationErrors([
  body('name').notEmpty().withMessage("Name is required"),
  body('email').notEmpty().withMessage("Email is required").isEmail().withMessage("invalid email format").custom(async(email)=>{
    const user = await User.findOne({email})
    if(user){
      throw new BadRequestError("Email already exists")
    }
  }),
  body('password').notEmpty().withMessage("Password is required").isLength({min:8}).withMessage("password must be atleast 8 characters long"),
  body('role').notEmpty().withMessage("Role is required")
])

export const validateLoginInput = withValidationErrors([
  body('email').notEmpty().withMessage("email is required").isEmail().withMessage("invalid email format"),
  body('password').notEmpty().withMessage("password is required"),

])

export const validateUpdateUserInput = withValidationErrors([
  body('name').notEmpty().withMessage("name is required"),
  body('email')
  .notEmpty()
  .withMessage("email is required")
  .isEmail()
  .withMessage("invalid email format"),
  body('location').notEmpty().withMessage("location is required"),
])