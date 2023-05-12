import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";

import { firestore, auth, backEndApp } from "~/utils/firestore";
import { signInWithCustomToken } from "firebase/auth";
import { frontEndAuth } from "~/utils/frontFirestore";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      custom_token: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      let customToken = "";
      if (["andayac@gmail.com"].indexOf(user.email) >= 0) {
        try {
          // const fbAuth = await getAuth();

          customToken = await auth.createCustomToken(user.email ?? "");
          const userCredential = await signInWithCustomToken(
            frontEndAuth,
            customToken
          );
          console.log("User logged in? ", userCredential.user);
          console.log("Custome token:", customToken);
          // customToken = customToken;
        } catch (err) {
          console.log("Error getAuth(): ", err);
        }
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          custom_token: customToken,
        },
      };
    },
    signIn: async ({ account, profile, user, credentials }) => {
      console.log("Sign in called with ", account?.id_token, profile);
      if (
        account &&
        profile &&
        profile.email &&
        account.provider === "google"
      ) {
        if (["andayac@gmail.com"].indexOf(profile.email) >= 0) {
          // const fbAuth = await getAuth();
          // const customToken = await fbAuth.createCustomToken(user.email ?? "");
          // console.log("Custome token:", customToken);
          // user.custom_token = customToken;
          return true;
        }
      }
      return false;
    },
  },

  adapter: FirestoreAdapter(firestore),
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
