import axios from 'axios';

const MXFACE_API_KEY = process.env.MXFACE_API_KEY;
const BASE_URL = 'https://api.mxface.ai/v1/face-compare';

/**
 * Compare two face images
 * @param {string} faceImage1 - Base64 or URL of the first image
 * @param {string} faceImage2 - Base64 or URL of the second image
 */
export const compareFaces = async (faceImage1, faceImage2) => {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        image1: faceImage1,
        image2: faceImage2,
      },
      {
        headers: {
          'x-api-key': MXFACE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data; // Contains match confidence score
  } catch (error) {
    console.error('Face comparison error:', error.response?.data || error.message);
    throw new Error('Face verification failed.');
  }
};
