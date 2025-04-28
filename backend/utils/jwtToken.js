export const generateToken = (user, message, statusCode, res) => {
  console.log("User in generateToken:", user); // Log the user object to check role
  const token = user.generateJsonWebToken();
  const cookieName = user.role === "Admin" ? "adminToken" :
    user.role === "Doctor" ? "doctorToken" : "patientToken"; // Added support for Doctor
  
  res
    .status(statusCode)
    .cookie(cookieName, token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  })
  .json({
    success: true,
    message,
    user,
    token,
  });
};
