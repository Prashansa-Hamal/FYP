import { z } from "zod";
import { Cookies } from "../session";
import crypto, { createHash } from "crypto";
import { createGoogleOAuthClient } from "./google";

export const OAuthProviders = ["google", "facebook"] as const;
export type OAuthProvider = (typeof OAuthProviders)[number];

export class OAuthClient<T> {
  private readonly provider: OAuthProvider;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly scopes: string[];
  private readonly urls: {
    auth: string;
    token: string;
    user: string;
  };
  private readonly userInfo: {
    schema: z.ZodSchema<T>;
    parcer: (data: T) => { id: string; email: string; name: string };
  };

  private readonly tokenSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
  });

  constructor({
    provider,
    clientId,
    clientSecret,
    scopes,
    urls,
    userInfo,
  }: {
    provider: OAuthProvider;
    clientId: string;
    clientSecret: string;
    scopes: string[];
    urls: { auth: string; token: string; user: string };
    userInfo: {
      schema: z.ZodSchema<T>;
      parcer: (data: T) => { id: string; email: string; name: string };
    };
  }) {
    this.provider = provider;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scopes = scopes;
    this.urls = urls;
    this.userInfo = userInfo;
  }

  private get redirectUrl() {
    return new URL(this.provider, process.env.OAUTH_REDIRECT_URL_BASE!);
  }

  createAuthUrl = (cookies: Pick<Cookies, "set">) => {
    const state = createState(cookies);
    const codeVerifier = createCodeVerifier(cookies);
    const codeChallenge = createCodeChallenge(codeVerifier);

    const url = new URL(this.urls.auth);
    url.searchParams.set("client_id", this.clientId);
    url.searchParams.set("redirect_uri", this.redirectUrl.toString());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.scopes.join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge", codeChallenge);

    return url.toString();
  };

  fetchUser = async (
    code: string,
    state: string,
    cookies: Pick<Cookies, "get">
  ) => {
    const isValidState = validateState(state, cookies);
    if (!isValidState) throw new Error("Invalid state!");

    const codeVerifier = getCodeVerifier(cookies);
    const { access_token, token_type } = await this.fetchToken(
      code,
      codeVerifier
    );

    const rawUserData = await fetch(this.urls.user, {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    }).then((res) => res.json());

    const parsed = this.userInfo.schema.safeParse(rawUserData);
    if (!parsed.success) {
      throw new Error("Invalid user data from Google");
    }

    const user = parsed.data;

    return this.userInfo.parcer(user);
  };

  private fetchToken = async (code: string, codeVerifier: string) => {
    const rawToken = await fetch(this.urls.token, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        code,
        redirect_uri: this.redirectUrl.toString(),
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code_verifier: codeVerifier,
      }).toString(),
    }).then((res) => res.json());

    const parsed = this.tokenSchema.safeParse(rawToken);
    if (!parsed.success) {
      throw new Error("Invalid token!");
    }

    return parsed.data;
  };
}

export const getOAuthClient = (provider: OAuthProvider) => {
  switch (provider) {
    case "google":
      return createGoogleOAuthClient();
    case "facebook":
      return createGoogleOAuthClient();
    default:
      throw new Error(`Invalid provider: ${provider satisfies never}`);
  }
};

const COOKIE_EXPIRATION_SECONDS = 60 * 10;
const STATE_COOKIE_KEY = "oAuthState";
const CODE_VERIFIER_KEY = "oAuthVerifierKey";

const createState = (cookies: Pick<Cookies, "set">) => {
  const state = crypto.randomBytes(32).toString("hex");
  setSecureCookie(cookies, STATE_COOKIE_KEY, state);
  return state;
};

const createCodeVerifier = (cookies: Pick<Cookies, "set">) => {
  const verifier = crypto.randomBytes(32).toString("hex");
  setSecureCookie(cookies, CODE_VERIFIER_KEY, verifier);
  return verifier;
};

const createCodeChallenge = (verifier: string) => {
  return createHash("sha256").update(verifier).digest("base64url");
};

const validateState = (state: string, cookies: Pick<Cookies, "get">) => {
  const cookieState = cookies.get(STATE_COOKIE_KEY)?.value;
  return cookieState === state;
};

const getCodeVerifier = (cookies: Pick<Cookies, "get">) => {
  const verifier = cookies.get(CODE_VERIFIER_KEY)?.value;
  if (!verifier) throw new Error("Code verifier is missing");
  return verifier;
};

const setSecureCookie = (
  cookies: Pick<Cookies, "set">,
  key: string,
  value: string
) => {
  cookies.set(key, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: Date.now() + COOKIE_EXPIRATION_SECONDS * 1000,
  });
};