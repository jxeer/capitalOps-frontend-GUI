import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHmac } from "crypto";
import { promisify } from "util";
import { parse as parseCookies } from "cookie";
import type { Express, Request, Response, RequestHandler } from "express";
import { storage } from "./storage";

const scryptAsync = promisify(scrypt);

// ---------------------------------------------------------------------------
// Password helpers
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(hashed, "hex"), buf);
}

// ---------------------------------------------------------------------------
// Minimal JWT using Node built-in crypto — no extra packages needed
// ---------------------------------------------------------------------------

const JWT_COOKIE = "cap_jwt";
const JWT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function makeJwt(payload: Record<string, unknown>, secret: string): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor((Date.now() + JWT_EXPIRY_MS) / 1000);
  const body = b64url(JSON.stringify({ ...payload, exp, iat: Math.floor(Date.now() / 1000) }));
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function parseJwt(token: string, secret: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  if (sig !== expected) return null;
  try {
    const decoded = JSON.parse(fromB64url(body));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers — called from route handlers after login/logout
// ---------------------------------------------------------------------------

export function setJwtCookie(res: Response, user: { id: string; username: string; role: string }): void {
  const secret = process.env.SESSION_SECRET || "capitalops-dev-secret";
  const token = makeJwt({ id: user.id, username: user.username, role: user.role }, secret);
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(JWT_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: JWT_EXPIRY_MS,
    path: "/",
  });
}

export function clearJwtCookie(res: Response): void {
  res.clearCookie(JWT_COOKIE, { path: "/" });
}

export function getUserFromRequest(req: Request): { id: string; username: string; role: string } | null {
  const secret = process.env.SESSION_SECRET || "capitalops-dev-secret";
  const cookieHeader = req.headers.cookie || "";
  const cookies = parseCookies(cookieHeader);
  const token = cookies[JWT_COOKIE];
  if (!token) return null;
  const payload = parseJwt(token, secret);
  if (!payload || typeof payload.id !== "string") return null;
  return { id: payload.id, username: String(payload.username), role: String(payload.role) };
}

// ---------------------------------------------------------------------------
// requireAuth middleware — reads JWT from cookie, no server-side session needed
// ---------------------------------------------------------------------------

export const requireAuth: RequestHandler = (req, res, next) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });
  (req as any).jwtUser = user;
  next();
};

// ---------------------------------------------------------------------------
// Passport + Express setup
// ---------------------------------------------------------------------------

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
    }
  }
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "capitalops-dev-secret";

  // express-session is kept only for Passport's Google OAuth state parameter
  // (needed for the brief handshake). Persistent auth is handled by JWT cookies.
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new session.MemoryStore(),
      cookie: {
        maxAge: 10 * 60 * 1000, // 10 min — only needed during OAuth flow
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Invalid credentials" });
        if (!user.password) return done(null, false, { message: "This account uses Google sign-in" });
        const valid = await comparePasswords(password, user.password);
        if (!valid) return done(null, false, { message: "Invalid credentials" });
        return done(null, { id: user.id, username: user.username, role: user.role });
      } catch (err) {
        return done(err);
      }
    })
  );

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (googleClientId && googleClientSecret) {
    const appUrl = process.env.APP_URL || "";
    const callbackURL = appUrl
      ? `${appUrl}/api/auth/google/callback`
      : "/api/auth/google/callback";

    console.log(`[auth] Google OAuth callback URL: ${callbackURL}`);

    passport.use(
      new GoogleStrategy(
        { clientID: googleClientId, clientSecret: googleClientSecret, callbackURL },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByGoogleId(profile.id);
            if (!user) {
              const email = profile.emails?.[0]?.value;
              const displayName = profile.displayName || email?.split("@")[0] || `user-${profile.id.slice(0, 6)}`;
              const existingByUsername = await storage.getUserByUsername(displayName);
              const username = existingByUsername
                ? `${displayName}-${profile.id.slice(0, 6)}`
                : displayName;
              user = await storage.createUser({
                username,
                googleId: profile.id,
                email,
                profileImage: profile.photos?.[0]?.value,
                role: "viewer",
                profileType: "investor",
                profileStatus: "active",
              });
            }
            return done(null, { id: user.id, username: user.username, role: user.role });
          } catch (err) {
            return done(err as Error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      done(null, { id: user.id, username: user.username, role: user.role });
    } catch (err) {
      done(err);
    }
  });
}
