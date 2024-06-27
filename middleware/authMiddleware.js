import { UnauthenticatedError, UnauthorizedError } from "../errors/customErrors.js"
import { verifyJWT } from "../utils/tokenUtils.js"

export const authenticateUser = (req, res, next) => {
    const {token} = req.cookies
    if (!token) throw new UnauthenticatedError("authentication invalid")

    try {
        const {userId, role, standard} = verifyJWT(token);
        req.user = {userId, role, standard}
        next()
    } catch (error) {
        throw new UnauthenticatedError("authentication invalid")
    }
}

export const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError("Unauthorized to access this route")
        }    
        next();
    }
}



