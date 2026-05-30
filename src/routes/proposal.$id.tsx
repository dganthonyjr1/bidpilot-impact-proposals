import { createFileRoute, redirect } from "@tanstack/react-router";

// Friendly URL alias — /proposal/:id redirects to the public proposal page.
export const Route = createFileRoute("/proposal/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/p/$id", params: { id: params.id }, replace: true });
  },
  component: () => null,
});