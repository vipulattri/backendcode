export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  // Setting the token as a cookie with proper attributes
  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true, // Prevents JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Cookies will only be sent over HTTPS in production
      sameSite: "None", // Allows cookies to be sent in cross-origin requests
    })
    .json({
      success: true,
      message,
      user,
      token, // Optional, consider removing from response if not required
    });
};
