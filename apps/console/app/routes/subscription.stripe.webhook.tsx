import type { ActionFunctionArgs } from "@remix-run/node";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { getDbClient } from "~/data/db";
import { subscriptions, users } from "~/data/schema";
import { raiseError } from "~/lib/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY ?? raiseError("Missing Stripe secret key")
  );
  const endpointSecret =
    process.env.STRIPE_WEBHOOK_SECRET ??
    raiseError("Missing Stripe webhook secret");

  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return new Response("Invalid signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: unknown) {
    console.error(err);

    if (err instanceof Error) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
    return new Response("Webhook Error", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (!session.customer_email) {
        console.error("Missing customer email from checkout session");
        return new Response("Missing customer email", { status: 400 });
      }
      if (!session.subscription) {
        console.error("Missing subscription id from checkout session");
        return new Response("Missing subscription id", { status: 400 });
      }
      if (!session.customer) {
        console.error("Missing customer id from checkout session");
        return new Response("Missing customer id", { status: 400 });
      }

      const db = getDbClient();
      const user = await db.query.users.findFirst({
        columns: { id: true },
        where: eq(users.email, session.customer_email),
      });

      if (!user) {
        console.error("User not found for email: ", session.customer_email);
        return new Response("User not found", { status: 400 });
      }

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

      await db.insert(subscriptions).values({
        id: subscriptionId,
        customerId: session.customer,
        userId: user.id,
        active: 1,
      });

      console.log("Checkout session completed", session.id);
      break;
    }
    default:
      console.log(`Unhandled stripe event type: ${event.type}`);
  }

  return new Response(null, { status: 200 });
};
