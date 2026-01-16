const { OpenAI } = require("openai");

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const fs = require("fs");

const generateImage = async (prompt) => {
  if (!openai) {
    throw new Error("OpenAI API key not found. Please check your configuration.");
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error(error.message || "An error occurred while generating image.");
  }
};

const editImage = async (imagePath, prompt) => {
  if (!openai) throw new Error("OpenAI API key not found");

  try {
    const response = await openai.images.edit({
      model: "dall-e-2",
      image: fs.createReadStream(imagePath),
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } catch (error) {
    console.error("OpenAI Edit Error:", error);
    throw new Error(error.message || "An error occurred while editing image.");
  }
};

const createVariation = async (imagePath) => {
  if (!openai) throw new Error("OpenAI API key not found");

  try {
    const response = await openai.images.createVariation({
      model: "dall-e-2",
      image: fs.createReadStream(imagePath),
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } catch (error) {
    console.error("OpenAI Variation Error:", error);
    throw new Error(error.message || "An error occurred while creating image variation.");
  }
};

module.exports = {
  openai,
  generateImage,
  editImage,
  createVariation
};
