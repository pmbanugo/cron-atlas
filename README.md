# Cron Atlas - A modern job scheduler for the serverless era

Cron Atlas is a modern _(cron)_ job scheduler for the serverless era. It is a simple, reliable, and highly available job scheduler that allows you to schedule tasks that call your API endpoints. In other words, it calls your API endpoints where you deployed your job or function, at the defined schedule/interval.

> If you're hosting on Vercel, think of it as a more expressive Vercel Cron Jobs alternative. For Netlify functions, think of it as a better way to schedule function execution.

It is built on top of the following amazing tools and technologies:

- **Remix**: for the UI where you configure and manage the job schedule. It uses Tailwind and shadcn/ui components.
- **Turso (SQLite)**: for data storage.
- **Drizzle ORM**
- **Temporal**: For the reliable and durable execution of jobs.
- **WorkOS & AuthKit**: For authentication and enterprise security.

## Features

- **Flexible Scheduling:** Define your job schedules using intuitive cron expressions, simple strings like '2hrs', or through a user-friendly calendar interface.
- **Interactive UI:** Manage your jobs with ease, with functionalities to pause, instantly trigger, or delete jobs directly from the console.
- **Support for Serverless Functions:** Seamlessly schedule AWS Lambda, Vercel/Netlify Functions, Cloudflare Worker, or any API endpoint. This extends your serverless architectures and applications with timed task execution.
- **SQLite & Drizzle ORM:** Backed by the lightweight yet powerful Turso (SQLite) and Drizzle ORM, ensuring smooth data management and query execution.
- **Temporal Reliability:** Leverage Temporal’s durable execution capabilities to ensure that your jobs are never lost and always executed on time.

## Who's using Cron Atlas?

While it's still early to have this list, here's a list of people and products that already use Cron Atlas in production.

1. [FxRate Today](https://fxrate.today/): Used to schedule task that updates the exchange rates.
2. [FlyCD](https://flycd.dev): Internally used for some data clean up and migration tasks.

You should give it a try today by signing up for the cloud version at [cronatlas.dev](https://cronatlas.dev/).

> Feel free to open a PR if you're already using Cron Atlas.

## Getting Started

While you can fork and run this on your computer, the fastest way to try it out as of today is to use the Cloud version which you can access at [cronatlas.fly.dev](https://cronatlas.dev/).

> [!NOTE]
> The cloud version is fully functional with the minimal features available today. However, the UI might not look as fancy and interactive for some people. So try it with less expectation on the UI, rather on the features and reliability of the product.

### Local Set Up

> TODO:

## Resources

Blog posts & examples:

- [Top Hacker News Story Aggregator Using Next.js, Resend and Cron Atlas](https://dev.to/pmbanugo/top-hacker-news-story-aggregator-using-nextjs-resend-and-cron-atlas-18k2). FYI, you can do something similar by just creating a scheduled function to run directly on Cron Atlas (see this [video](https://www.loom.com/share/666953f8492748f3abb87e3df56824d2?sid=11521f04-36d7-4191-818e-cbf1579e17a4) for how to do that.)

## Contributing

Cron Atlas uses a permissive license and we welcome contributions from the community.

If you'd like to contribute, please fork the repository, make changes and submit pull requests (Thank you!).

## Author

Built by [Peter Mbanugo](https://pmbanugo.me/) - software engineer & founder of [FlyCD](https://flycd.dev/). He's based in Munich (Germany), so feel free to ask for a physical or virtual hangout.

You can connect with me on [Twitter](https://twitter.com/p_mbanugo) or [LinkedIn](https://www.linkedin.com/in/pmbanugo/).
