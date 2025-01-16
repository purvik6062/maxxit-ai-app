const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  };

  // Set the cookie in response header
  res.setHeader('Set-Cookie', `jwt=${token}; ${Object.entries(cookieOptions)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, req, res);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password"
      });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password"
      });
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, req, res);
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

exports.buyMembership = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.body.userID,
      {
        membershipType: req.body.membershipType,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID"
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};
