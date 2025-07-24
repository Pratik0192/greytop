import CryptoJS from 'crypto-js';

const AES_KEY = process.env.AES_KEY as string;

if(!AES_KEY) {
    throw new Error('AES_KEY is not defined in environment variables');
}

const key = CryptoJS.enc.Utf8.parse(AES_KEY);

export function encryptAES(plainText: string) {
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function decryptAES(cipherText: string) {
  const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}