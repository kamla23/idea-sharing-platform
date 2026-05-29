
export const validateSignup = (username, email, password) => {

  if (!username || !email || !password) {
    return "All fields are required";
  }

  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }

  if (username[0] !== username[0].toUpperCase()) {
    return "Username must start with capital letter";
  }

  if (!email.includes("@") || !email.includes(".")) {
    return "Email must contain @ and .";
  }

  let hasNumber = false;
  for (let i = 0; i < email.length; i++) {
    if (!isNaN(email[i]) && email[i] !== " ") {
      hasNumber = true;
    }
  }

  if (!hasNumber) {
    return "Email must contain at least one number";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  let hasLetter = false;
  let hasNumberPass = false;
  let hasSymbol = false;

  for (let i = 0; i < password.length; i++) {
    const ch = password[i];

    if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z")) {
      hasLetter = true;
    } else if (ch >= "0" && ch <= "9") {
      hasNumberPass = true;
    } else {
      hasSymbol = true;
    }
  }

  if (!hasLetter || !hasNumberPass || !hasSymbol) {
    return "Password must contain letter, number and symbol";
  }

  return null; 
};



export const validateLogin = (email, password) => {

  if (!email || !password) {
    return "Email and password required";
  }

  if (!email.includes("@") || !email.includes(".")) {
    return "Invalid email format";
  }

  return null; 
};