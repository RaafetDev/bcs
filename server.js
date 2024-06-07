const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const tesseract = require('tesseract.js');

app.use(express.json());

// Create a temporary directory for storing the images
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.post('/ocr', async (req, res) => {
  try {
    const images = req.body;
    const results = {};

    // Process the images in parallel
    await Promise.all(
      Object.keys(images).map(async (key) => {
        const image = images[key];
        const imagePath = path.join(tempDir, `${key}.png`);

        try {
          // Save the image to a temporary file
          await fs.promises.writeFile(imagePath, Buffer.from(image, 'base64'));

          // Perform OCR on the image using Tesseract.js
          const { data } = await tesseract.recognize(imagePath, 'eng', {
            logger: (m) => console.log(m),
          });

          // Extract the detected number from the OCR result
          const detectedNumber = parseInt(data.text.trim(), 10);
          results[key] = isNaN(detectedNumber) ? '' : detectedNumber.toString();
        } catch (error) {
          console.error(`Error processing image ${key}: ${error}`);
          results[key] = ''; // Set a default value in case of an error
        } finally {
          // Remove the temporary file
          await fs.promises.unlink(imagePath).catch((err) => {
            console.error(`Error removing temporary file ${imagePath}: ${err}`);
          });
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Error in /ocr route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


















/*const express = require('express');
const cors = require('cors');
const app = express();
const Jimp = require('jimp');
const Tesseract = require('tesseract.js');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

async function AI(arr) {
    async function solover(img, cl) {
        try {
            const image = await Jimp.read(img);
            const processedImage = await image
                .color([{ apply: 'brighten', params: [-10] }])
                .contrast(1)
                .color([{ apply: 'darken', params: [10] }])
                .getBase64Async(Jimp.MIME_PNG);

            const result = await Tesseract.recognize(processedImage, 'eng', { tessedit_char_whitelist: '0123456789' });
            return result.data.text.trim();
        } catch (error) {
            throw error;
        }
    }

    const promises = arr.map(item => solover(Buffer.from(item.img, 'base64')));

    try {
        const texts = await Promise.all(promises);
        return arr.map((item, index) => ({ id: item.id, text: texts[index] }));
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

app.get('/', (req, res) => {
    res.json({ status: true, server: 'ON', by: 'RedBLs', telegram: 'https://t.me/bls_script_alert' });
});

app.post('/v5/api', async (req, res) => {
    console.log(req.body);
    const data = req.body.data || false;

    try {
        if (data && Array.isArray(data)) {
            const result = await AI(data);
            res.json({ status: true, data: result });
        } else {
            res.json({ status: false, msg: 'data invalid!' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: false, msg: 'Internal Server Error' });
    }
});

app.listen(3000);*/
