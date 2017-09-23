const shajs = require('sha.js');

export const sha256 = (data: string) => shajs('sha256').update(data).digest('hex');
