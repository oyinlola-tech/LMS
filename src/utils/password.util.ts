import argon2 from 'argon2';

const hashPassword = async (plain) => {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1,
  });
};

const verifyPassword = async (hash, plain) => {
  if (!hash) return false;
  return argon2.verify(hash, plain);
};

export { hashPassword, verifyPassword };
