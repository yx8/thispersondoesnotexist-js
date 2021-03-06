import sharp from 'sharp';
import request from 'request';
import schedule from 'node-schedule';
import EventEmitter from 'events';

/**
 * ThisPersonDoesNotExist Class
 *
 * @class ThisPersonDoesNotExist
 * @extends {EventEmitter}
 */
class ThisPersonDoesNotExist extends EventEmitter {

    constructor(options) {
        super();
        this.options = {
            // thing: 'thing' in options ? options.thing : null
        }
    }

    /**
     * Get the image in base64
     *
     * @param {string} body buffer
     * @param {string} mimType type
     * @param {number} width default 128
     * @param {number} height default 128
     * @returns {string} resizedBase64
     * @memberof ThisPersonDoesNotExist
     */
    async getBase64(body, mimType, width, height) {
        let resizedImageBuffer = await sharp(body)
            .resize(width, height)
            .toBuffer();
        let resizedImageData = resizedImageBuffer.toString('base64');
        let resizedBase64 = `data:${mimType};base64,${resizedImageData}`;
        return resizedBase64;
    }

    /**
     * Create the image locally and return an object with the details
     *
     * @param {string} body buffer
     * @param {string} path path
     * @param {number} width default 128
     * @param {number} height default 128
     * @returns {object} 
     * @memberof ThisPersonDoesNotExist
     */
    async getImagePath(body, path, width, height) {
        let name = `${this.getId(10)}.jpeg`;
        let ImagePath = await sharp(body)
            .resize(width, height)
            .toFile(`${path}/${name}`);
        return Object.assign(ImagePath, {
            name
        })
    }

    /**
     * Get the image remotely
     *
     * @returns {Object}
     * @memberof ThisPersonDoesNotExist
     */
    async getRemoteImage() {
        return new Promise((resolve, reject) => {
            request.get({
                url: 'https://thispersondoesnotexist.com/image',
                encoding: null
            }, (error, response, body) => {
                if (error) return reject(error);
                try {
                    if (response.statusCode == 200) {
                        let img = new Buffer(body, 'base64');
                        let mimType = response.headers["content-type"];
                        resolve({
                            img,
                            mimType
                        });
                    } else {
                        throw error;
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    /**
     * Obtain a image
     *
     * @param {Object} options {
     *         width,
     *         height,
     *         type,
     *         path
     *     }
     * @returns {Object}
     * @memberof ThisPersonDoesNotExist
     */
    async getImage({
        width,
        height,
        type,
        path
    }) {

        width = width || 128;
        height = height || 128;
        type = type || 'file';
        path = path || '.';

        try {

            let {
                img,
                mimType
            } = await this.getRemoteImage();

            if (img && mimType) {

                let response;

                switch (type) {
                    case 'base64':
                        response = await this.getBase64(img, mimType, width, height);
                        break;

                    case 'file':
                        response = await this.getImagePath(img, path, width, height);
                        break;

                    default:
                        break;
                }

                return {
                    status: true,
                    data: response
                };
            } else {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cron Job
     *
     * @param {Object} options {
     *         time,
     *         width,
     *         height,
     *         type,
     *         path
     *     }
     * @returns {Event} created
     * @memberof ThisPersonDoesNotExist
     */
    cron({
        time,
        width,
        height,
        type,
        path
    }) {
        schedule.scheduleJob(time, async () => {
            let res = await this.getImage({
                width,
                height,
                type,
                path
            });
            this.emit('created', res);
        });
    }

    /**
     * Generate random name
     *
     * @param {*} length
     * @returns {string} text
     * @memberof ThisPersonDoesNotExist
     */
    getId(length) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

}

module.exports = ThisPersonDoesNotExist;