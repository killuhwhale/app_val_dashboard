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

import { firestore, auth, backEndApp } from "~/utils/firestore";

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

      const isDevAct =
        ["andayac@gmail.com", "testminnie001@gmail.com"].indexOf(user.email) >=
        0;
      const isGoogler = (user.email.split("@")[1] ?? "") === "google.com";

      if (isDevAct || isGoogler) {
        try {
          customToken = await auth.createCustomToken(user.email ?? "");
          // console.log("Custom token:", customToken);
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
        },
      };
    },
    signIn: ({ account, profile, user, credentials }) => {
      console.log("Sign in called with ", account?.expires_at, profile);
      if (
        account &&
        profile &&
        profile.email &&
        account.provider === "google"
      ) {
        const isDevAct =
          ["andayac@gmail.com", "testminnie001@gmail.com"].indexOf(
            profile.email
          ) >= 0;
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
