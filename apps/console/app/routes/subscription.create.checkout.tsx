import { redirect, type ActionFunctionArgs, json } from "@remix-run/node";
import Stripe from "stripe";
import { getSessionManager } from "~/lib/session.server";
import { raiseError } from "~/lib/utils";

export async function action({ request }: ActionFunctionArgs) {
  const user = await getSessionManager().requireUser(request, "/");

  const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY ?? raiseError("Missing Stripe secret key")
  );

  const priceId =
    process.env.STRIPE_PREMIUM_BETA_PRICE_ID ??
    raiseError("Missing Stripe price ID");

  const YOUR_DOMAIN =
    process.env.NODE_ENV === "production"
      ? "https://cronatlas.dev"
      : "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${YOUR_DOMAIN}/subscription/success/checkout`,
    cancel_url: `${YOUR_DOMAIN}`,
    automatic_tax: { enabled: true },
  });
  if (!session.url) throw json("Couldn't generate checkout session URL");

  return redirect(session.url, 303);
}

export function loader() {
  return redirect("/");
}
