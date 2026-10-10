import { createFileRoute } from "@tanstack/react-router";
import Game from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lost in the Cosmos — A Journey Home" },
      { name: "description", content: "A 2D pixel-art survival adventure: help astronaut Nova and robo-fox Pip find their way home across five levels." },
      { property: "og:title", content: "Lost in the Cosmos — A Journey Home" },
      { property: "og:description", content: "Survive, repair, explore and bring Nova and Pip home in this pixel-art space adventure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});
