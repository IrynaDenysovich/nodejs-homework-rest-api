const Jimp = require("jimp");

const jimpResizeAndDelete = async (uploadedPath) => {
  const file = await Jimp.read(uploadedPath);
  return await file.resize(250, 250).quality(60).writeAsync(uploadedPath);
};

module.exports = {
  jimpResizeAndDelete,
};
