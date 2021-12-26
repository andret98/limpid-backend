const jwt = require('jsonwebtoken');
const secretKey = "UNPjx:&sKlz>l3Fn~XoC.ctI;]MY9j"

const generateTokenAsync = async (payload) => {
    const encode = await jwt.sign({payload}, secretKey);
    return encode;
};

const verifyAndDecodeDataAsync = async (token) => {
    const decoded = await jwt.verify(token, secretKey);
    return decoded;
};

module.exports = {
    generateTokenAsync,
    verifyAndDecodeDataAsync
};