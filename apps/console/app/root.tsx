import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "~/tailwind.css";
import { MainNav } from "~/components/nav";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* <Outlet /> */}
        <>
          <div className="flex-col md:flex">
            <div className="border-b">
              <div className="flex h-16 items-center px-4">
                <div className="font-medium text-2xl mr-6">Cron Atlas</div>
                {/* <TeamSwitcher
              teams={user.teams}
              username={user.username}
              installations={user.installations}
            /> */}
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                  {/* <Search /> */}
                  {/* <UserMenu
                email={user.email ?? ""}
                username={user.username}
                avatar={user.avatar}
              /> */}
                </div>
              </div>
            </div>
            <div className="mx-4 my-4">
              <Outlet />
            </div>
          </div>
        </>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
