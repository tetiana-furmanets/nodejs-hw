import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { User } from '../models/user.js';
import createHttpError from "http-errors";



export const updateUserAvatar = async (req, res) => {
    if (!req.file) {
    throw createHttpError(400, "Avatar file is required");
  }
  const result = await saveFileToCloudinary(req.file.buffer, req.user._id);


  const updateUser = await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    { avatar: result.secure_url },
    { returnDocument: "after" },

  );

  res.status(200).json({ url: updateUser.avatar });
};
