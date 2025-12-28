// utils/ExpressError.js
class ExpressError extends Error {
    constructor(statusCode, message) {
      super();         // call parent Error class
      this.statusCode = statusCode;
      this.message=message;
    }
  }
  
  module.exports = ExpressError;
  