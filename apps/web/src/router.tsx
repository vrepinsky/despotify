import { useMutation } from "@tanstack/react-query";
import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { ExternalLink, Link as LinkIcon, Loader2, Music2 } from "lucide-react";
import { styled } from "goober";
import { useState } from "react";

import { resolvePlaylist } from "./api.ts";

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
  const [playlistUrl, setPlaylistUrl] = useState("");
  const mutation = useMutation({
    mutationFn: resolvePlaylist,
  });

  return (
    <Shell>
      <MainPanel>
        <Header>
          <BrandMark>
            <Music2 size={22} />
          </BrandMark>
          <div>
            <Kicker>Despotify</Kicker>
            <Title>Find buyable and downloadable alternatives for Spotify playlists.</Title>
          </div>
        </Header>

        <Form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate(playlistUrl);
          }}
        >
          <InputWrap>
            <LinkIcon size={18} />
            <Input
              aria-label="Spotify playlist URL"
              onChange={(event) => setPlaylistUrl(event.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              type="url"
              value={playlistUrl}
            />
          </InputWrap>
          <Button disabled={!playlistUrl || mutation.isPending} type="submit">
            {mutation.isPending ? <Loader2 className="spin" size={18} /> : null}
            Resolve
          </Button>
        </Form>

        {mutation.isError ? <Notice tone="bad">{mutation.error.message}</Notice> : null}

        {mutation.data ? (
          <Results>
            <ResultsHeader>
              <div>
                <SectionTitle>{mutation.data.playlist.name ?? "Spotify playlist"}</SectionTitle>
                <Muted>{mutation.data.tracks.length} imported tracks</Muted>
              </div>
              <External href={mutation.data.playlist.url} rel="noreferrer" target="_blank">
                <ExternalLink size={16} />
                Spotify
              </External>
            </ResultsHeader>

            {mutation.data.warnings.map((warning) => (
              <Notice key={warning} tone="warn">
                {warning}
              </Notice>
            ))}

            {mutation.data.tracks.length === 0 ? (
              <Empty>
                Add Spotify API credentials to import tracks. Alternative search workers can then
                fill Bandcamp, YouTube, and SoundCloud matches.
              </Empty>
            ) : (
              <TrackList>
                {mutation.data.tracks.map((track) => (
                  <TrackRow key={track.id}>
                    <div>
                      <TrackTitle>{track.title}</TrackTitle>
                      <Muted>{track.artists.join(", ")}</Muted>
                    </div>
                    <Status>Queued</Status>
                  </TrackRow>
                ))}
              </TrackList>
            )}
          </Results>
        ) : null}
      </MainPanel>
    </Shell>
  );
}

const Shell = styled("main")`
  min-height: 100vh;
  background: #f4f6f8;
  color: #191b1f;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 56px 20px;
`;

const MainPanel = styled("section")`
  width: min(920px, 100%);
`;

const Header = styled("header")`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: start;
  margin-bottom: 28px;
`;

const BrandMark = styled("div")`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #14213d;
  color: #f7d54a;
  display: grid;
  place-items: center;
`;

const Kicker = styled("p")`
  color: #5b616e;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
`;

const Title = styled("h1")`
  font-size: 56px;
  line-height: 0.98;
  margin: 0;
  max-width: 780px;

  @media (max-width: 620px) {
    font-size: 38px;
  }
`;

const Form = styled("form")`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const InputWrap = styled("label")`
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #d6dce3;
  border-radius: 8px;
  padding: 0 14px;
`;

const Input = styled("input")`
  width: 100%;
  border: 0;
  color: #191b1f;
  font: inherit;
  outline: none;
`;

const Button = styled("button")`
  min-height: 52px;
  border: 0;
  border-radius: 8px;
  background: #0f8b8d;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font: inherit;
  font-weight: 800;
  padding: 0 22px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const Results = styled("section")`
  background: #ffffff;
  border: 1px solid #d6dce3;
  border-radius: 8px;
  margin-top: 20px;
  padding: 18px;
`;

const ResultsHeader = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
`;

const SectionTitle = styled("h2")`
  font-size: 22px;
  margin: 0 0 4px;
`;

const Muted = styled("p")`
  color: #646b76;
  margin: 0;
`;

const Notice = styled("p")<{ tone: "bad" | "warn" }>`
  background: ${({ tone }) => (tone === "bad" ? "#ffe8e4" : "#fff4cf")};
  border: 1px solid ${({ tone }) => (tone === "bad" ? "#efaaa1" : "#ebcd73")};
  border-radius: 8px;
  color: #2c2522;
  margin: 12px 0;
  padding: 12px 14px;
`;

const Empty = styled("p")`
  border: 1px dashed #aeb8c4;
  border-radius: 8px;
  color: #4f5662;
  margin: 0;
  padding: 22px;
`;

const TrackList = styled("div")`
  display: grid;
  gap: 8px;
`;

const TrackRow = styled("article")`
  align-items: center;
  border: 1px solid #ece8df;
  border-radius: 8px;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  min-height: 68px;
  padding: 12px 14px;
`;

const TrackTitle = styled("h3")`
  font-size: 16px;
  margin: 0 0 4px;
`;

const Status = styled("span")`
  background: #eef1f4;
  border-radius: 999px;
  color: #454c57;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 10px;
`;

const External = styled("a")`
  align-items: center;
  color: #191b1f;
  display: inline-flex;
  gap: 6px;
  font-weight: 700;
  text-decoration: none;
`;
