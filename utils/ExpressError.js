//define class (Extedns regular Error class)
class ExpressError extends Error {
    constructor(message, statusCode) {
        super(); //calls the Error constructor in the ExpressError construcotr
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;