import crypto from 'crypto';
import argon2 from 'argon2';

const generateOtp = () => {
  const num = crypto.randomInt(0, 1000000);
  return String(num).padStart(6, '0');
};

const hashOtp = async (code) => {
  return argon2.hash(code, { type: argon2.argon2id });
};

const verifyOtp = async (hash, code) => {
  return argon2.verify(hash, code);
};

export { generateOtp, hashOtp, verifyOtp };
