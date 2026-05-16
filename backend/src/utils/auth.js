import crypto from "node:crypto";
import bcrypt from "bcrypt";

const BCRYPT_SALT_ROUNDS = 12;

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function fromBase64url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function tokenSecret() {
  return process.env.AUTH_TOKEN_SECRET || process.env.MONGODB_URI || "gaon-veda-development-secret";
}

/**
 * Hash a password using bcrypt.
 * @param {string} password - The plaintext password
 * @returns {Promise<{ passwordHash: string }>}
 */
export async function hashPassword(password) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  return { passwordHash };
}

/**
 * Verify a password against a stored bcrypt hash.
 * @param {string} password - The plaintext password attempt
 * @param {object} user - The user document (must have `passwordHash`)
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, user) {
  if (!user?.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

/**
 * Sign a JWT with HMAC-SHA256.
 * @param {object} payload - Token payload (e.g. { sub, email })
 * @param {number} expiresInSeconds - Token TTL (default 7 days)
 * @returns {string} - The signed JWT string
 */
export function signToken(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedBody = base64url(JSON.stringify(body));
  const signature = crypto.createHmac("sha256", tokenSecret()).update(`${encodedHeader}.${encodedBody}`).digest("base64url");

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

/**
 * Verify and decode a JWT. Returns the payload if valid, null otherwise.
 * @param {string|null} token
 * @returns {object|null}
 */
export function verifyToken(token) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedBody, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", tokenSecret()).update(`${encodedHeader}.${encodedBody}`).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64url(encodedBody));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Strip sensitive fields from a user document before sending to the client.
 * @param {object} user
 * @returns {object|null}
 */
export function publicUser(user) {
  const plain = user?.toObject ? user.toObject() : user;
  if (!plain) return null;

  const { passwordHash, passwordSalt, __v, ...safe } = plain;
  return safe;
}
