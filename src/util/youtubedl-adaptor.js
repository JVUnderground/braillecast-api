const youtubeDl = require('youtube-dl');

/**
 * 
 */
exports.getInfo = (url) => {
    return new Promise((resolve, reject) => {
        youtubeDl.getInfo(url,(err, data) => {
            if (err !== null) return reject(err);
            resolve(data);
        });
   });
}