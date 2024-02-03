import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  Profile,
} from "next-auth";
import { env } from "~/env.mjs";

import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import jwt, { Secret } from "jsonwebtoken";
import { firestore, auth, backEndApp } from "~/utils/firestore";
import config from "config.json";
import { AdapterUser } from "next-auth/adapters";

const DEV_ENV = process.env.NODE_ENV === "development";

console.log(
  `\u001B[31m Authentication is using ${DEV_ENV ? "dev" : "prod"} env!`
);

type AppValUser = {
  id: string;
  custom_token: string;
  wssToken: string;
} & DefaultSession["user"];

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: AppValUser;
  }
}

function encodeJWT(user: AdapterUser) {
  const maxAge = 10 * 24 * 60 * 60 * 1000;
  const jwtClaims = {
    email: user.email,
    iat: Date.now() / 1000,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };

  const encodedToken = jwt.sign(jwtClaims, env.NEXTAUTH_SECRET as Secret, {
    algorithm: "HS512",
  });
  return encodedToken;
}

function isDevAccount(profile: Profile | AdapterUser | undefined) {
  return profile && config.devAccounts.indexOf(profile.email!) >= 0;
}

function isGoogleAccount(profile: Profile | AdapterUser | undefined) {
  // const isGoogler = (user.email.split("@")[1] ?? "") === "google.com";
  return profile && (profile.email!.split("@")[1] ?? "") === "google.com";
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    session: ({ session, user, token }) => {
      let customToken,
        wssToken = "";
      if (isDevAccount(user) || isGoogleAccount(user) || DEV_ENV) {
        try {
          wssToken = encodeJWT(user);
        } catch (err) {
          console.log("Error wssToken encodeJWT: ", err);
        }
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          custom_token: customToken,
          wssToken: wssToken,
        },
      };
    },
    signIn: ({ account, profile, user, credentials }) => {
      // Basic filtering of emails after a user signs in via Google
      console.log("Sign in called with ", account?.expires_at, profile);
      if (
        account &&
        profile &&
        profile.email &&
        account.provider === "google"
      ) {
        console.log(
          "Auth Sign in returning: ",
          isDevAccount(profile) || isGoogleAccount(profile) || DEV_ENV
        );
        return isDevAccount(profile) || isGoogleAccount(profile) || DEV_ENV;
      }
      console.log("Sign in: false");
      return false;
    },
  },

  adapter: FirestoreAdapter(firestore),
  // adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: config.oauthcreds.web.client_id,
      clientSecret: config.oauthcreds.web.client_secret,
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
