import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "../components/keynote/Deck";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <Deck />;
}
