import { CheckCircle, Clock, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardTitle,
  CardHeader,
  CardContent,
  Card,
  CardFooter,
} from "@/components/ui/card";
import createScheduleImage from "@/assets/create-schedule.avif";
import jobMonitorImage from "@/assets/job-monitor.avif";

export default function Home() {
  return (
    <div key="1" className="min-h-screen bg-gray-100">
      <nav className="bg-white py-4 px-8 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
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
          <h3 className="text-3xl font-bold mb-8">Why Use Cron Atlas?</h3>
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
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h3 className="text-3xl font-bold mb-8">
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
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h3 className="text-3xl font-bold text-center">
            A sneak peek into the console
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <img
                alt="Job schedule view"
                className="rounded mx-auto"
                height="500"
                width="500"
                src={createScheduleImage}
                style={{
                  aspectRatio: "500/500",
                  objectFit: "contain",
                }}
              />
              <p className="mt-2">Job Schedule View</p>
            </div>
            <div className="text-center">
              <img
                alt="Job Detail View"
                className="rounded mx-auto"
                height="500"
                width="500"
                src={jobMonitorImage}
                style={{
                  aspectRatio: "500/500",
                  objectFit: "contain",
                }}
              />
              <p className="mt-2">Job Detail View</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-16" id="pricing">
        <div className="max-w-4xl mx-auto px-8">
          <h3 className="text-3xl font-bold mb-8">Pricing Plans</h3>
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
                    <span>Access to GPU for ML or AI-related jobs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Priority email support</span>
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
              <Github className="w-4 h-4" />
              View on GitHub
            </Button>
          </a>
        </div>
      </section>
      <footer className="bg-white py-8">
        <div className="max-w-4xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center mt-4 md:mt-0">
            <span>© 2024 Cron Atlas. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
