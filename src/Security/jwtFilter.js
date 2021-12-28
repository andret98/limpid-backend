const {
    verifyAndDecodeDataAsync
} = require('./jwt.js');
const authorizeAndExtractTokenAsync = async (req, res, next) => {
    if (!req.headers.authorization) {
        console.log("no token")
        console.log(req.headers)
        next();
    } else {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = await verifyAndDecodeDataAsync(token);
        req.user = decoded;
        next();
    }
};
module.exports = {
    authorizeAndExtractTokenAsync
}