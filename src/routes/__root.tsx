import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: "Build apps that listen to you - Voice First Web Apps",
      },
      {
        name: "description",
        content:
          "A cinematic keynote on building voice-first JavaScript and web applications.",
      },
      {
        property: "og:title",
        content: "Build apps that listen to you - Voice First Web Apps",
      },
      {
        property: "og:description",
        content:
          "A cinematic keynote on building voice-first JavaScript and web applications.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
