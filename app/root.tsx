import type { LinksFunction } from "@remix-run/node";
import { SpeedInsights } from "@vercel/speed-insights/remix"

import styles from "./tailwind.css";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { cn } from "./lib/utils";
import { PdfProvider } from "./contexts/pdf-context";
import { Toaster } from "~/components/ui/sonner"


export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export default function App() {
  return (
    <PdfProvider>
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={cn("flex-grow py-8 bg-white")}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <SpeedInsights />
        <Toaster/>
        </div>
      </body>
      
    </html>
    </PdfProvider>
  );
}
