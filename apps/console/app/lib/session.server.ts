import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { raiseError } from "./utils";
import { getAuthorizationUrl } from "./workos";

export type SessionData = {
  userId: string;
  firstName: string;
  email: string;
};

type SessionFlashData = {
  error: string;
};

export const getSessionManager = () => {
  const COOKIE_SECRET =
    process.env.AUTH_COOKIE_SECRET_KEY ??
    raiseError("Missing AUTH_COOKIE_SECRET_KEY");

  const sessionStorage = createCookieSessionStorage<
    SessionData,
    SessionFlashData
  >({
    cookie: {
      name: "__auth",
      //   domain: process.env.AUTH_COOKIE_DOMAIN,
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [COOKIE_SECRET],
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: true, // Doesn't work in safari if not serving via https
    },
  });

  const createUserSession = async ({
    userId,
    firstName,
    email,
    redirectTo = "/",
  }: {
    userId: string;
    firstName: string | null;
    email: string;
    redirectTo?: string;
  }) => {
    const session = await sessionStorage.getSession();
    session.set("userId", userId);
    if (firstName) {
      session.set("firstName", firstName);
    }
    session.set("email", email);

    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  };

  const getSession = (request: Request) => {
    return sessionStorage.getSession(request.headers.get("Cookie"));
  };

  const getUserId = async (request: Request) => {
    const session = await getSession(request);
    const userId = session.get("userId");
    if (!userId) {
      return null;
    }

    return userId;
  };

  const getUser = async (request: Request) => {
    const session = await getSession(request);
    const userId = session.get("userId");
    const firstName = session.get("firstName");
    const email = session.get("email");

    if (!userId || !email) {
      return null;
    }
    return {
      userId,
      firstName,
      email,
    };
  };

  const requireUser = async (
    request: Request,
    redirectTo: string = new URL(request.url).pathname
  ) => {
    const user = await getUser(request);
    if (!user) {
      throw redirect(getAuthorizationUrl(redirectTo));
    }
    return user;
  };

  const requireUserId = async (
    request: Request,
    redirectTo: string = new URL(request.url).pathname
  ) => {
    const userId = await getUserId(request);
    if (!userId) {
      throw redirect(getAuthorizationUrl(redirectTo));
    }
    return userId;
  };

  const logout = async (request: Request) => {
    const session = await getSession(request);
    return redirect("/login", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });
  };

  return {
    createUserSession,
    getSession,
    getUserId,
    requireUserId,
    getUser,
    requireUser,
    logout,
  };
};
