import AppError from '../utils/AppError.js';

const handleCastError = () => {
  return new AppError('The requested record could not be found.', 404);
};

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || '';
  if (field === 'email') {
    return new AppError('This email address is already registered.', 400);
  }
  if (field === 'phoneNumber') {
    return new AppError('This phone number is already registered.', 400);
  }
  return new AppError('This record already exists.', 400);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors || {}).map((e) => {
    const msg = e.message;
    // Map database validation messages to polite human instructions
    if (msg.includes('required') || msg.toLowerCase().includes('is required')) {
      if (e.path === 'name') return 'Please enter your name.';
      if (e.path === 'email') return 'Please enter your email address.';
      if (e.path === 'password') return 'Please enter a password.';
      if (e.path === 'phoneNumber') return 'Please enter your phone number.';
      if (e.path === 'bloodGroup') return 'Please select your blood group.';
      if (e.path === 'city') return 'Please enter your city.';
      if (e.path === 'address') return 'Please enter your address.';
      if (e.path === 'hospitalName') return 'Please enter your hospital name.';
      if (e.path === 'licenseNumber') return 'Please enter your hospital license number.';
      return `Please provide your ${e.path}.`;
    }
    if (msg.toLowerCase().includes('valid email') || msg.toLowerCase().includes('invalid email') || msg.toLowerCase().includes('email format')) {
      return 'Please enter a valid email address.';
    }
    if (msg.includes('at least 6 characters')) {
      return 'Password must be at least 6 characters long.';
    }
    return msg;
  });
  return new AppError(messages.join('. ') || 'Please check the information entered.', 400);
};

export const notFound = (req, res, next) => {
  next(new AppError('The requested page or route could not be found.', 404));
};

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    if (error.name === 'CastError') {
      error = handleCastError();
    } else if (error.code === 11000) {
      error = handleDuplicateKey(error);
    } else if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    } else {
      // General error sanitization: hide technical names/stack references
      error = new AppError('Something went wrong. Please try again.', 500);
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong. Please try again.';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // Consistent human-friendly response, strictly hiding all stack traces and database internals
  res.status(statusCode).json({
    success: false,
    message,
  });
};
