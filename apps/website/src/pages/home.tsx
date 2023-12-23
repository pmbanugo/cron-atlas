import { CheckCircle, Clock, Github } from "lucide-react";
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
          <Clock className="w-5 h-5" />
          <h1 className="text-xl font-semibold">Cron Atlas</h1>
        </div>
        <Button asChild className="bg-blue-500 hover:bg-blue-700 text-white">
          <a href="https://cronatlas.dev">Dashboard</a>
        </Button>
      </nav>
      <header className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4">
          Open-source modern Cron Job Scheduler for the Serverless Era
        </h2>
        <p className="max-w-xl mx-auto mb-8">
          Schedule your tasks, and trigger your serverless function with ease
          using our cloud-based cron job scheduler.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild className="bg-blue-500 hover:bg-blue-700 text-white">
            <a href="https://cronatlas.dev">Try for Free</a>
          </Button>
          <Button
            asChild
            className="bg-transparent hover:bg-blue-500 text-blue-700 border border-blue-500 hover:text-white"
          >
            <a href="#pricing">View Pricing</a>
          </Button>
        </div>
      </header>
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h3 className="text-3xl font-bold mb-8">Why use Cron Atlas?</h3>
          <ul className="list-none space-y-4 pl-0">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>Reliable serverless cron job scheduling.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>Run as frequent as every 1 second.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>Interactive UI to manage your cron jobs.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>
                Schedule triggers to call your serverless function (e.g. Netlify
                Functions, Cloudflare Workers).
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-1" />
              <span>
                No need to learn cron syntax. Use readable English & calendar to
                schedule.
              </span>
            </li>
          </ul>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h3 className="text-3xl font-bold mb-8">
            Simple yet, Powerful Features
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
                <CardTitle>Unlimited invocations</CardTitle>
              </CardHeader>
              <CardContent>
                Run as frequent as every 1 second, without any limits.
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
                <CardTitle>Secure</CardTitle>
              </CardHeader>
              <CardContent>
                Trigger jobs and verify the request using a secure signature.{" "}
                <span className="text-sm text-zinc-500">(Coming soon).</span>
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
          <h3 className="text-3xl font-bold mb-8">Pricing Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="w-full bg-gray-200">
              <CardHeader>
                <CardTitle>Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Free forever with limits.</p>
                <ul className="list-none space-y-2 pl-0">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Create up to 5 cron jobs/schedule</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>10000 job invocations per month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Standard support and updates</span>
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
                <p>$20 / month</p>
                <ul className="list-none space-y-2 pl-0">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Unlimited jobs/schedule.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Unlimited invocations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Priority support with quick help</span>
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
            <span>© 2023 Cron Atlas. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
