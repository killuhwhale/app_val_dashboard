import { z } from "zod";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { sheets, auth } from "@googleapis/sheets";
import { getSession } from "next-auth/react";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  runCmd: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      let res = "";
      try {
        const runCommand = new Promise<string>((res, rej) => {
          // Define the SSH command to be executed
          // const ssh: ChildProcessWithoutNullStreams = spawn('ssh', ['samus@98.45.154.253', 'npm -v']);
          const test: ChildProcessWithoutNullStreams = spawn("curl", [
            "ifconfig.me",
          ]);

          // Handle output from the SSH command

          test.stdout.on("data", (data: any) => {
            console.log("stdout:", data);
          });

          test.stderr.on("data", (data: any) => {
            console.error("stderr:", data);
          });

          test.on("close", (code: any) => {
            console.log("child process exited with code: ", code);
            res("Closed!");
          });
        });

        res = await runCommand;
        console.log("Running command: ", res);
      } catch (err) {
        console.log("Error runnign command: ", err);
      }

      return {
        result: res,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
