const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        for (let i = 0; i < roles.length; i++) {
            if (req.user.payload.role === roles[i]) { 
                    return next();
            }
        }
        throw new Error('no permisions')
    }
};
 
module.exports = {
    authorizeRoles
}