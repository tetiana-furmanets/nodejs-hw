import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";
import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { createSession, setSessionCookies } from "../services/auth.js";
import {sendEmail} from "../utils/sendMail.js";

const templatePath = path.join(
  process.cwd(),
  "src",
  "templates",
  "reset-password-email.html"
);

const templateSource = await fs.readFile(templatePath, "utf-8");
const template = handlebars.compile(templateSource);

export const registerUser = async (req, res) => {
const existingUser = await User.findOne({email: req.body.email});
if (existingUser){
  throw createHttpError(400, "Email in use");
}

const hashedPassword = await bcrypt.hash(req.body.password, 10);

const newUser = await User.create({
  email:req.body.email,
  password:hashedPassword,
});

const session = await createSession (newUser._id);
setSessionCookies (res, session);

res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
const user = await User.findOne({email: req.body.email});
if (!user){
  throw createHttpError(401, "Invalid credentials");
}

const isValidPassword = await bcrypt.compare(req.body.password, user.password);
if (!isValidPassword){
  throw createHttpError(401, "Invalid credentials");
}

await Session.deleteOne({ userId: user._id});

const session = await createSession(user._id);

setSessionCookies (res, session);

res.status(200).json(user);
};


export const logoutUser = async (req, res) => {
if(req.cookies.sessionId){
  await Session.deleteOne({_id: req.cookies.sessionId});
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');
}

  res.status(204).send();
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;
  if(!sessionId || !refreshToken) {
    throw createHttpError(401, "Invalid session");
  }

  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError (401, "Invalid session");
  }

  const isRefreshTokenExpired = session.refreshTokenValidUntil < new Date ();
  if(isRefreshTokenExpired){
    await session.deleteOne();
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');
    throw createHttpError (401, "Invalid session");
  }

    await session.deleteOne();
    const newSession = await createSession(session.userId);
    setSessionCookies (res, newSession);

  res.status(200).json ({
    message: "Session updated!",
  });
};

export const requestResetEmail = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    return res.status(200).json({message: "Email sent, check inbox!"});
  }

const resetToken = jwt.sign({
  email: req.body.email,
  sub: user._id,
}, process.env.JWT_SECRET, {expiresIn: '15m'});


const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`;

  const html = template({
  name: user.email,
  link: resetLink,
});

  try{
await sendEmail({
from: process.env.SMTP_FROM,
to: req.body.email,
subject: "Password reset",
html,
});
  } catch (error) {
    throw createHttpError(500, error.message);
  }


res.status(200).json({
  message: "Email sent, check inbox!",
});
};


export const resetPassword = async (req, res) => {

  let payload;
try {
  payload = jwt.verify(req.body.token, process.env.JWT_SECRET);
} catch (error) {
throw createHttpError(401, "Bad token");
}

const user = await User.findOne({
  _id: payload.sub,
  email: payload.email,
});
if (!user) {
  throw createHttpError(404, "No user");
}

const hashedPassword = await bcrypt.hash(req.body.password, 10);
await User.updateOne({
_id: user._id}, {password: hashedPassword});

await Session.deleteMany({userId: user._id});



res.status(200).json({
  message: "Success",
});

};
