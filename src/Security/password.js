const bcryptjs = require('bcryptjs');

const hashPassword = async (plainTextPassword) => {
    const salt = await bcryptjs.genSalt();
    return await bcryptjs.hash(plainTextPassword, salt);
};

const comparePlainTextToHashedPassword = async (plainTextPassword, hashedPassword) => {
    return await bcryptjs.compare(plainTextPassword, hashedPassword);
};

module.exports = {
    hashPassword,
    comparePlainTextToHashedPassword
}