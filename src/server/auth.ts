import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import jwt, { Secret } from "jsonwebtoken";
import { firestore, auth, backEndApp } from "~/utils/firestore";
import { AdapterUser } from "next-auth/adapters";

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

function encodeJWT(user: AppValUser) {
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
    // jwt: ({ account, token, user, profile, session, trigger }) => {
    //   console.log("JWT callback: ", token, user, account);

    //   if (account?.accessToken) {
    //     token.accessToken = account.accessToken;
    //   }
    //   return token;
    // },
    session: async ({ session, user, token }) => {
      let customToken = "";
      // console.log("Session callback: check for access token: ", session, token);
      const isDevAct =
        [
          "andayac@gmail.com",
          "ethancox16@gmail.com",
          "testminnie001@gmail.com",
        ].indexOf(user.email) >= 0;
      const isGoogler = (user.email.split("@")[1] ?? "") === "google.com";
      let wssToken;
      if (isDevAct || isGoogler) {
        try {
          customToken = await auth.createCustomToken(user.email ?? "");
          // eslint-disable-next-line
          wssToken = encodeJWT(user as AdapterUser as unknown as AppValUser);
          // console.log("Custom token:", wssToken);
        } catch (err) {
          console.log("Error auth.createCustomToken(): ", err);
        }
      }
      // console.log("Session auth: ", wssToken);
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
        const isDevAct =
          [
            "andayac@gmail.com",
            "ethancox16@gmail.com",
            "testminnie001@gmail.com",
          ].indexOf(profile.email) >= 0;
        //   abc@google.com => ['abc', 'google.com']
        const isGoogler = (profile.email.split("@")[1] ?? "") === "google.com";
        console.log(
          "isDev or isGoog",
          isDevAct,
          isGoogler,
          isDevAct || isGoogler
        );
        return isDevAct || isGoogler;
      }

      console.log("Sign in: false");
      return false;
    },
  },

  adapter: FirestoreAdapter(firestore),
  // adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
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
