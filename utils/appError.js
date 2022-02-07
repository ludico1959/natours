class AppError extends Error {
  constructor(message, statusCode) {
    /* super()
     * It calls te parent class (which is Error) constructor!
     * message is the only arguments that build accepts.
     */
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    /* An overview of error handling:
     * >>> OPERATIONAL ERRORS:
     * problems that we can predict will happen at some point, so we just need  to handle them in advance.
     * >>> PROGRAMMING ERRORS:
     * bugs that we developers introduce into our code. Difficult to find and handle withoun debuging.
     */
  }
}

module.exports = AppError;
