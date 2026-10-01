export const validateSignup = (username, email, password) => {
  if (!username || !email || !password) {
    return "All fields are required";
  }

  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return "Username must be at least 3 characters";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};

export const validateLogin = (email, password) => {
  if (!email || !password) {
    return "Email and password required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Invalid email format";
  }

  return null;
};
