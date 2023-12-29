import { Link } from "@remix-run/react";
import { CheckIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function CheckoutSuccess() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-6">
      <CheckIcon className="w-12 h-12 text-green-500" />
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
        Thank you for your purchase!
      </h1>
      <p className="max-w-lg text-center text-gray-700 dark:text-gray-300">
        Your order has been processed and you will receive a confirmation email
        shortly. Please note that it might take a while for your subscription to
        be activated.
      </p>

      <Button className="mt-4" variant="outline">
        <Link to="/">Return to Homepage</Link>
      </Button>
    </main>
  );
}
