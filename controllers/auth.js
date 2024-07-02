const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const {name, email, password} = req.body;

  // check all the missing fields
  if (!name || !email || !password)
    return res
      .status(400)
      .json({error: "Please enter all the required fields..."});

  // name validation
  if (name.length > 25)
    return res
      .status(400)
      .json({error: "Name can only be less than 25 characters"});

  // email validation
  const emailReg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailReg.test(email))
    return res.status(400).json({error: "Please enter a valid email address"});

  // validation of password
  if (password.length < 6)
    return res
      .status(400)
      .json({error: "Password must be at least 6 characters long"});

  try {
    const doesUserAlreadyExist = await User.findOne({email});

    if (doesUserAlreadyExist)
      return res.status(400).json({
        error: `A user with the email [${email}] already exists, so please try another one`,
      });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({name, email, password: hashedPassword});

    // save the user
    const result = await newUser.save();

    result._doc.password = undefined;

    return res.status(201).json({...result._doc});
  } catch (error) {
    console.log(error);
    return res.status(500).json({error: error.message});
  }
};

exports.login = async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({email: "Please enter all the required fields!"});

  // email validation
  const emailReg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailReg.test(email))
    return res.status(400).json({error: "Please enter a valid email address"});

  try {
    const doesUserExist = await User.findOne({email});

    if (!doesUserExist)
      return res.status(400).json({error: "Invalid email or password!"});

    // if there were any user present
    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExist.password
    );

    if (!doesPasswordMatch)
      return res.status(400).json({error: "Invalid email or password!"});

    const payload = {_id: doesUserExist._id};
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});

    const user = {...doesUserExist._doc, password: undefined};
    return res.status(200).json({token, user});
  } catch (error) {
    console.log(error);
    return res.status(500).json({error: error.message});
  }
};

exports.me = async (req, res) => {
  return res.status(200).json({...req.user._doc});
};
