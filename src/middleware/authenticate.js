import createHttpError from "http-errors";

export const authenticate = async (req, res, next) => {
  const {sessionId, accessToken } = req.cookies;
if (!sessionId || !accessToken) {
  throw createHttpError(401, "Missing token")
}

const session = await Session.findOne({
  _id: sessionId,
  accessToken
});

if (!session) {
  throw createHttpError(401, "No session");
}

const isAccessTokenExpired = session.accessTokenValidUntil < new Date();
if (isAccessTokenExpired) {
  throw createHttpError (401, "Access token expired");
}

const user = await User.findById(session.userId);
if (!user) {
  throw createHttpError(401, "No user");
}

req.user = user;

next();

};
