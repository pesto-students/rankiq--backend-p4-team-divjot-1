import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const cryptoKey = process.env.CRYPTO;

const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), cryptoKey, {
    keySize: 128 / 8,
    iv: cryptoKey,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
};

const decrypt = (data) => {
  try {
    return JSON.parse(
      CryptoJS.enc.Utf8.stringify(
        CryptoJS.AES.decrypt(data, cryptoKey, {
          keySize: 128 / 8,
          iv: cryptoKey,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        })
      )
    );
  } catch (e) {
    return false;
  }
};

export default { encrypt, decrypt };
