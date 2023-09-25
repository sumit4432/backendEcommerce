
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const User=require("../modals/UaerSchema")

const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_KEY, {
    expiresIn: "1d",
  });
};

exports.signup = async (req, res) => {
  try {
    // Check if the user with the provided email already exists
    const existingUser = await User.findOne({ email: req.body.email }).exec();
    
    if (existingUser) {
      return res.status(400).json({
        error: "User already registered",
      });
    }
    const { name, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      name,
      email,
      hash_password,
      username: shortid.generate(),
    });
    await _user.save();
    const { _id, fullName, role } = _user;
    return res.status(201).json({
      user: { _id, fullName, email, role },
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
      error: error.message, 
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isPasswordValid = await user.authenticate(req.body.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (user.role !== "user") {
      return res.status(400).json({ error: "Access denied" });
    }

    const token = jwt.sign({_id:user._id, role: user.role}, process.env.JWT_KEY,{expiresIn: "7d"});
    const { _id, name, email, role } = user;

    return res.status(200).json({
      token,
      user: { _id, name, email, role },
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
      error: error.message, 
    });
  }
};
