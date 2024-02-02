import { Button } from "@/components/ui/button";
import {
  CardTitle,
  CardHeader,
  CardContent,
  Card,
  CardFooter,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div key="1" className="min-h-screen bg-gray-100">
      <nav className="bg-white py-4 px-8 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h1 className="text-xl font-semibold">Cron Atlas</h1>
        </div>
        <Button asChild>
          <a href="https://cronatlas.dev">Dashboard</a>
        </Button>
      </nav>
      <header className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4">
          Open-source Scheduled Serverless Function, and Cron Job Scheduler
        </h2>
        <p className="max-w-xl mx-auto mb-8">
          Run scheduled functions, or trigger your remote job endpoint our
          cloud-based cron job scheduler.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <a href="https://cronatlas.dev">Try for Free</a>
          </Button>
          <Button asChild variant="link">
            <a href="#pricing">View Pricing</a>
          </Button>
        </div>
      </header>
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h3 className="text-3xl font-bold mb-8 text-center">
            Why Use Cron Atlas?
          </h3>
          <ul className="list-none space-y-4 pl-0">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>Reliable serverless cron job scheduling.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>Run functions that last up to 10 (or more) minutes.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>
                No runtime limitation. Harness the full power of Node.js or Bun
                for your jobs/tasks.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>
                Powered by trusted technologies (e.g. Firecracker & Temporal).
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>Interactive UI to manage your cron jobs.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>
                Use human readable string & calendar expression to describe the
                schedule.
              </span>
            </li>
          </ul>
        </div>
      </section>
      <section className="bg-white pb-16">
        <div className="max-w-4xl mx-auto px-8">
          <h3 className="text-3xl font-bold text-center">
            A sneak peek into Cron Atlas
          </h3>
          <div
            style={{
              position: "relative",
              paddingBottom: "57.50798722044729%",
              height: 0,
            }}
            className="mt-8"
          >
            <iframe
              src="https://www.loom.com/embed/666953f8492748f3abb87e3df56824d2?sid=855a4418-45fc-4304-a781-b145a97404c8"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            ></iframe>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h3 className="text-3xl font-bold mb-8 text-center">
            Simple, Yet Powerful Features 🔥
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                Define your job schedules using intuitive cron expressions,
                simple strings like '2hrs', or through a user-friendly calendar
                interface.
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Fast, Secure, and Isolated</CardTitle>
              </CardHeader>
              <CardContent>
                Thanks to Firecracker, each function execution happens in their
                own microVM and private network. Function secrets are also
                stored in a secure vault, by a trusted provider.
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Pause & Backfill</CardTitle>
              </CardHeader>
              <CardContent>
                Ability to pause and backfill job execution{" "}
                <span className="text-sm text-zinc-500">(Coming soon)</span>.
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>No Limit Serverless</CardTitle>
              </CardHeader>
              <CardContent>
                Run your functions/jobs as long as you want, using the full
                potential of whatever runtime you choose (Node.js or Bun).{" "}
                <span className="text-sm text-zinc-500">
                  (Your wallet is the only limit 🤑).
                </span>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Durable & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                Enjoyed a reliable product powered by modern cloud-native
                technologies.
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Open Source</CardTitle>
              </CardHeader>
              <CardContent>
                It's open source and you can contribute the feature you'd like
                to have, or fork and self-host internally.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="bg-white py-16" id="pricing">
        <div className="max-w-4xl mx-auto px-8">
          <h3 className="text-3xl font-bold mb-8 text-center">Pricing Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="w-full bg-gray-200">
              <CardHeader>
                <CardTitle>Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Free for one year.</p>
                <ul className="list-none space-y-2 pl-0">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Create up to 4 cron jobs/function</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>10,000 remote job invocations (monthly)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>5,000 scheduled function run (monthly)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Up to 10 mins function execution time</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Access to{" "}
                      <a
                        href="https://discord.gg/ph45BEUN"
                        className="underline"
                      >
                        Discord
                      </a>{" "}
                      community & support.
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between">
                <a href="https://cronatlas.dev">
                  <Button variant="outline">Start for Free</Button>
                </a>
              </CardFooter>
            </Card>
            <Card className="w-full bg-gray-200">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <span className="line-through">$$</span> 🤔 / month
                </p>
                <ul className="list-none space-y-2 pl-0">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Unlimited cron job/function</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Unlimited remote job invocation.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Unlimited scheduled function run.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Up to 12 hours function execution time.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Access to GPU for ML or AI-related jobs</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button disabled>Coming Soon</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h3 className="text-3xl font-bold mb-8">Proudly Open Source</h3>
          <p className="mb-8">
            We're proud to be an open source product. Check out our code and
            contribute on GitHub.
          </p>
          <a href="https://github.com/pmbanugo/cron-atlas">
            <Button className="gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="w-4 h-4"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              View on GitHub
            </Button>
          </a>
        </div>
      </section>
      <footer className="bg-white py-8">
        <div className="max-w-4xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center mx-auto mt-4 md:mt-0">
            <span>© 2024 Cron Atlas. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckCircle({ className }: { className: string }) {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        // className="w-4 h-4 mt-1"
        className={className}
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    </>
  );
}
