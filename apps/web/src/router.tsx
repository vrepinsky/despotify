import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { styled } from "goober";
import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type HealthState = "checking" | "ok" | "error";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function HomePage() {
  const [health, setHealth] = useState<HealthState>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const response = await fetch(`${apiUrl}/health`);
        if (!cancelled) {
          setHealth(response.ok ? "ok" : "error");
        }
      } catch {
        if (!cancelled) {
          setHealth("error");
        }
      }
    }

    void checkHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Shell>
      <Panel>
        <Kicker>Despotify</Kicker>
        <Title>Monorepo scaffold</Title>
        <Status data-state={health}>
          API health: {health === "checking" ? "checking" : health}
        </Status>
      </Panel>
    </Shell>
  );
}

const Shell = styled("main")`
  min-height: 100vh;
  background: #f4f6f8;
  color: #191b1f;
  display: grid;
  place-items: center;
  padding: 24px;
`;

const Panel = styled("section")`
  width: min(520px, 100%);
`;

const Kicker = styled("p")`
  color: #5b616e;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
`;

const Title = styled("h1")`
  font-size: 42px;
  line-height: 1;
  margin: 0 0 20px;

  @media (max-width: 620px) {
    font-size: 34px;
  }
`;

const Status = styled("p")`
  background: #ffffff;
  border: 1px solid #d6dce3;
  border-radius: 8px;
  margin: 0;
  padding: 14px 16px;

  &[data-state="ok"] {
    border-color: #74b89a;
  }

  &[data-state="error"] {
    border-color: #d77a61;
  }
`;
