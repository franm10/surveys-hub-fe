/**
 * For deploy on Firebase:
 * cd functions
 * firebase deploy --only functions
* */
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {Timestamp, UpdateData} from "firebase-admin/firestore";

admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger for User Database
 * Set Role as User
 * Set CreatedBy as Timestamp
 * */
export const setUserRoleAndCreatedAt =
  functions.auth.user().onCreate(
    async (user) => {
      const db = admin.firestore();

      await admin.auth().setCustomUserClaims( user.uid, {role: "user"} );

      await db.collection("users").doc( user.uid).set({
        name: user.displayName ?? "",
        email: user.email ?? "",
        role: "user",
        createdAt: Date.now(),
      });
    }
  );

/**
 * Trigger for update Stats Collections
 * When User send new Submitted Survey
 * */
export const onSubmissionCreate = functions
  .region("europe-west1")
  .firestore
  .document("surveys/{surveyId}/submissions/{submissionId}")
  .onCreate(async (snap, ctx) => {
    const submission = snap.data();
    const surveyId = ctx.params.surveyId;

    if (!submission || !Array.isArray(submission.answers)) {
      throw new Error(
        `Submission ${ctx.params.submissionId} has no valid answers array`
      );
    }

    const statsRef = db
      .collection("surveys").doc(surveyId)
      .collection("stats").doc("stats");

    const submittedAt = submission.submittedAt as Timestamp;

    await db.runTransaction(async (tx) => {
      const statsSnap = await tx.get(statsRef);
      if (!statsSnap.exists) {
        throw new Error(`Stats non found for survey ${surveyId}`);
      }

      const updates: UpdateData<FirebaseFirestore.DocumentData> = {};

      updates["totalSubmitted"] = admin.firestore.FieldValue.increment(1);
      updates["lastSubmitted"] = submittedAt;

      const currentFirst =
        statsSnap.get("firstSubmitted") as Timestamp | undefined;
      if (!currentFirst || currentFirst.toMillis() > submittedAt.toMillis()) {
        updates["firstSubmitted"] = submittedAt;
      }

      (submission.answers as Array<{
        questionSeq: number; answersSeq: number[]
      }>)
        .forEach((ans) => {
          const qKey = ans.questionSeq.toString();
          ans.answersSeq.forEach((choiceSeq) => {
            const cKey = choiceSeq.toString();
            updates[`questionStats.${qKey}.${cKey}`] =
              admin.firestore.FieldValue.increment(1);
          });
        });
      tx.update(statsRef, updates);
    });
  });

enum Status {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  ARCHIVED = "ARCHIVED"
}

/**
 * Trigger for close expired surveys
 * */
export const closeExpiredSurveys = functions.pubsub
  .schedule("0 4 * * *")
  .timeZone("Europe/Rome")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();

    const snapshot = await db.collection("surveys")
      .where("status", "==", Status.OPEN)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const batch = db.batch();
    let updated = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const expirationDate = data.expirationDate as admin.firestore.Timestamp;

      if (expirationDate && expirationDate.toMillis() < now.toMillis()) {
        batch.update(doc.ref, {status: Status.CLOSED});
        updated++;
        console.log(`Survey ${doc.id} scaduta e chiusa`);
      }
    });

    if (updated > 0) {
      await batch.commit();
      console.log("survey scadute chiuse.");
    } else {
      console.log("Nessuna survey scaduta da chiudere.");
    }

    return null;
  });
