const { workerData, parentPort } = require('worker_threads');
const Jimp = require('jimp');
const Tesseract = require('tesseract.js');

async function solover(img) {
    try {
        const image = await Jimp.read(Buffer.from(img, 'base64'));
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

(async () => {
    try {
        const text = await solover(workerData.img);
        parentPort.postMessage(text);
    } catch (error) {
        parentPort.postMessage(error);
    }
})();
