import { Link } from "@remix-run/react";
import { ArrowRight, Unlink } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex flex-col items-center justify-center h-[80vh]">
      <Unlink className="w-24 h-24 mb-4 text-red-500" />
      <h1 className="text-3xl font-bold mb-2">Oops!</h1>
      <p className="text-xl mb-6">
        We couldn't find the page you're looking for.
      </p>
      <Button variant="outline" asChild>
        <Link to="/">
          Go back home
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </main>
  );
}
