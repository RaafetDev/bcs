const express = require('express');
const app = express();
const Jimp = require('jimp');
const Tesseract = require('tesseract.js');

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

module.exports = app;