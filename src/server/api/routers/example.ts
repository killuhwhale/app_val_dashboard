import { z } from "zod";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { sheets, auth } from "@googleapis/sheets";
import { getSession } from "next-auth/react";
import { getStorage } from "firebase-admin/storage";
import { backStorage, firestore } from "~/utils/firestore";
const db = firestore;

const bucket = backStorage.bucket();
// Example code from Google Doc..
// async function deleteFBCollection(collectionPath: string, batchSize = 0) {
//   const collectionRef = db.collection(collectionPath);
//   // const query = collectionRef.orderBy('__name__').limit(batchSize); // want to skip ordering...

//   const query = collectionRef.limit(batchSize === 0 ? 1000 : batchSize);
//   return new Promise((resolve, reject) => {
//     deleteQueryBatch(query, resolve).catch(reject);
//   });
// }

// // Example code from Google Doc..
// async function deleteQueryBatch(
//   query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
//   resolve: (value: unknown) => void
// ) {
//   const snapshot = await query.get();

//   const batchSize = snapshot.size;
//   if (batchSize === 0) {
//     // When there are no documents left, we are done
//     resolve("");
//     return;
//   }

//   // Delete documents in a batch
//   const batch = db.batch();
//   snapshot.docs.forEach((doc) => {
//     batch.delete(doc.ref);
//   });
//   await batch.commit();

//   // Recurse on the next process tick, to avoid
//   // exploding the stack.
//   process.nextTick(async () => {
//     await deleteQueryBatch(query, resolve);
//   });
// }

async function deleteMedia(docID: string) {
  /* Deletes media from storage */

  const res = await bucket.getFiles({ prefix: `amaceRuns/${docID}` });
  const promises: Promise<any>[] = [];
  console.log("Get files res: ", res);
  const files = res[0];
  console.log("Files:");
  files.forEach((file) => {
    console.log(file.name);
    promises.push(bucket.file(file.name).delete());
  });

  await Promise.all(promises);
}

const AppListEntrySchema = z.object({
  apps: z.string(),
  driveURL: z.string(),
  listname: z.string(),
  playstore: z.boolean(),
});

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

  deleteCollection: protectedProcedure
    .input(z.object({ docID: z.string() }))
    .mutation(async ({ input }) => {
      // Deletes Doc and sub collection from Firestore - AmaceRuns
      console.log("Deleting docID: ", input.docID);

      try {
        const doc = db.doc(`AmaceRuns/${input.docID}`);
        const res = await firestore.recursiveDelete(doc);
        console.log("Done deleting: ", res);

        await deleteMedia(input.docID);

        return {
          deleted: input.docID,
        };
      } catch (err) {
        console.log("Error deleting Collection: ", input.docID, " - ", err);
        return {
          deleted: "",
        };
      }
    }),

  createAppList: protectedProcedure
    .input(AppListEntrySchema)
    .mutation(async ({ input }) => {
      // Deletes Doc and sub collection from Firestore - AmaceRuns
      console.log(
        "Creating list: ",
        input.listname,
        input.driveURL,
        input.apps
      );

      try {
        const doc = db.doc(`AppLists/${input.listname}`);
        const res = await doc.set({
          ...input,
          playstore: input.driveURL.length === 0,
        });
        console.log("Done creating: ", res);

        return {
          created: true,
        };
      } catch (err) {
        console.log("Error creating applist: ", input.listname, " - ", err);
        return {
          created: false,
        };
      }
    }),
  updateAppList: protectedProcedure
    .input(AppListEntrySchema)
    .mutation(async ({ input }) => {
      // Deletes Doc and sub collection from Firestore - AmaceRuns
      console.log(
        "Updating list: ",
        input.listname,
        input.driveURL,
        input.apps
      );

      try {
        const doc = db.doc(`AppLists/${input.listname}`);
        const res = await doc.update({
          apps: input.apps,
        });

        console.log("Done updating: ", res);

        return {
          updated: true,
        };
      } catch (err) {
        console.log("Error updating applist: ", input.listname, " - ", err);
        return {
          updated: false,
        };
      }
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
