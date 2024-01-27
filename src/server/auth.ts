import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  Profile,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import jwt, { Secret } from "jsonwebtoken";
import { firestore, auth, backEndApp } from "~/utils/firestore";
import config from "config.json";
import { AdapterUser } from "next-auth/adapters";

const DEV_ENV = process.env.NODE_ENV === "development";

console.warn(`Authentication is using ${DEV_ENV ? "dev" : "prod"} env!`);
const devAccounts = [
  "andayac@gmail.com",
  "ethancox16@gmail.com",
  "testminnie001@gmail.com",
];

function isDevAccount(profile: Profile | AdapterUser | undefined) {
  // const isDevAct = devAccounts.indexOf(user.email) >= 0;
  return profile && devAccounts.indexOf(profile.email!) >= 0;
}

function isGoogleAccount(profile: Profile | AdapterUser | undefined) {
  // const isGoogler = (user.email.split("@")[1] ?? "") === "google.com";
  return profile && (profile.email!.split("@")[1] ?? "") === "google.com";
}

type AppValUser = {
  id: string;
  custom_token: string;
  wssToken: string;
  // ...other properties
  // role: UserRole;
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

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    session: async ({ session, user, token }) => {
      // console.log("Session callback: check for access token: ", session, token);
      let customToken,
        wssToken = "";
      if (isDevAccount(user) || isGoogleAccount(user) || DEV_ENV) {
        try {
          customToken = await auth.createCustomToken(user.email ?? "");
          wssToken = encodeJWT(user);
        } catch (err) {
          console.log("Error auth.createCustomToken(): ", err);
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
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
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
