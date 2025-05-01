import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

async function addCredits(
  twitterId: string, // Changed from userId to twitterId
  amount: number,
  source: string,
  description: string
) {
  let client: MongoClient;
  client = await dbConnect();
  const session = client.startSession();
  try {
    const db = client.db("ctxbt-signal-flow");

    await session.withTransaction(async () => {
      // Find the user by twitterId
      const user = await db
        .collection("users")
        .findOne({ twitterId }, { session });
      if (!user) {
        throw new Error("User not found");
      }

      // Increment the user's credits using ObjectId
      const updateResult = await db
        .collection("users")
        .updateOne(
          { _id: user._id },
          { $inc: { credits: amount } },
          { session }
        );

      if (updateResult.matchedCount === 0) {
        throw new Error("User not found");
      }

      // Log the transaction with ObjectId
      await db.collection("transactions").insertOne(
        {
          userId: user._id, // Use MongoDB ObjectId
          type: "CREDIT",
          amount,
          source,
          description,
          createdAt: new Date(),
        },
        { session }
      );
    });
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred");
  } finally {
    if (session) await session.endSession();
    if (client) await client.close();
  }
}

export { addCredits };
