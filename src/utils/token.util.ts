import jwt from 'jsonwebtoken';
import { logger } from '../core/loggers';

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

let resolvedJwtSecret = JWT_SECRET;
if (!resolvedJwtSecret || !String(resolvedJwtSecret).trim()) {
  throw new Error(
    '[token] JWT_SECRET is missing or empty. Set JWT_SECRET in your environment before starting the app.'
  );
}
resolvedJwtSecret = String(resolvedJwtSecret).trim();

const VALID_EXPIRES_IN_PATTERN = /^(\d+\s*[smhdwy]|\d+)$/i;
let resolvedExpiresIn = JWT_EXPIRES_IN;
if (!resolvedExpiresIn || !VALID_EXPIRES_IN_PATTERN.test(String(resolvedExpiresIn).trim())) {
  logger.warn(
    '[token] JWT_EXPIRES_IN is missing or invalid ("%s"). Defaulting to "7d". ' +
    'Set a valid value (e.g. "7d", "1h", "3600") in your environment.',
    resolvedExpiresIn
  );
  resolvedExpiresIn = '7d';
}

const validateRequiredNonEmptyField = (value, fieldName) => {
  if (value === undefined || value === null || !String(value).trim()) {
    throw new Error(
      `[token] signToken requires user.${fieldName} to be present and non-empty.`
    );
  }
};

const signToken = (user) => {
  if (!user || typeof user !== 'object') {
    throw new Error('[token] signToken requires a valid user object.');
  }

  const id = user.id;
  const role = user.role;
  const email = user.email;

  validateRequiredNonEmptyField(id, 'id');
  validateRequiredNonEmptyField(role, 'role');
  validateRequiredNonEmptyField(email, 'email');

  return jwt.sign(
    { sub: String(id).trim(), role: String(role).trim(), email: String(email).trim() },
    resolvedJwtSecret,
    { expiresIn: resolvedExpiresIn } as any
  );
};

export { signToken };
