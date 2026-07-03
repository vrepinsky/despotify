import { createRootRoute, createRoute, createRouter, Link, Outlet } from "@tanstack/react-router";
import { styled } from "goober";
import { usePlaylists, useTracks } from "./data-providers";

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: EmptyPlaylistState,
});

const playlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/playlists/$playlistId",
  component: PlaylistPage,
});

const routeTree = rootRoute.addChildren([indexRoute, playlistRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppLayout() {
  const playlistsQuery = usePlaylists();

  return (
    <Shell>
      <Sidebar>
        <Brand>Despotify</Brand>
        <PlaylistList>
          {playlistsQuery.isLoading ? <MutedText>Loading playlists</MutedText> : null}
          {playlistsQuery.isError ? <ErrorText>Could not load playlists</ErrorText> : null}
          {playlistsQuery.data?.map((playlist) => (
            <PlaylistLinkItem key={playlist.publicId}>
              <Link
                activeProps={{ "data-active": true }}
                params={{ playlistId: playlist.publicId }}
                to="/playlists/$playlistId"
              >
                <PlaylistName>{playlist.name ?? "Untitled playlist"}</PlaylistName>
                <PlaylistMeta>
                  {playlist.trackCount} tracks
                  {playlist.authorName ? ` by ${playlist.authorName}` : ""}
                </PlaylistMeta>
              </Link>
            </PlaylistLinkItem>
          ))}
        </PlaylistList>
      </Sidebar>
      <Content>
        <Outlet />
      </Content>
    </Shell>
  );
}

function EmptyPlaylistState() {
  return (
    <PageHeader>
      <Kicker>Playlists</Kicker>
      <Title>Select a playlist</Title>
    </PageHeader>
  );
}

function PlaylistPage() {
  const { playlistId } = playlistRoute.useParams();
  const playlistsQuery = usePlaylists();
  const tracksQuery = useTracks(playlistId);
  const playlist = playlistsQuery.data?.find((item) => item.publicId === playlistId);

  return (
    <PlaylistView>
      <PageHeader>
        <Kicker>{playlist?.authorName ?? "Playlist"}</Kicker>
        <Title>{playlist?.name ?? "Loading playlist"}</Title>
        {playlist ? (
          <HeaderMeta>
            {playlist.trackCount} tracks · imported {formatDate(playlist.lastImportedAt)}
          </HeaderMeta>
        ) : null}
      </PageHeader>

      {tracksQuery.isLoading ? <MutedText>Loading tracks</MutedText> : null}
      {tracksQuery.isError ? <ErrorText>Could not load tracks</ErrorText> : null}

      <TrackList>
        {tracksQuery.data?.map((track) => (
          <TrackItem key={track.publicId}>
            <TrackPosition>{track.position}</TrackPosition>
            <TrackBody>
              <TrackTitle>{track.title}</TrackTitle>
              <TrackMeta>
                {track.artistName}
                {track.albumName ? ` · ${track.albumName}` : ""}
                {track.releaseYear ? ` · ${track.releaseYear}` : ""}
              </TrackMeta>
              <AltLinks>
                {track.altLinks.length === 0 ? <MutedText>No alternatives yet</MutedText> : null}
                {track.altLinks.map((link) => (
                  <AltLink href={link.url} key={link.url} rel="noreferrer" target="_blank">
                    <LinkSource>{link.source}</LinkSource>
                    <span>{link.title ?? link.url}</span>
                    <LinkStatus data-status={link.status}>{link.status}</LinkStatus>
                  </AltLink>
                ))}
              </AltLinks>
            </TrackBody>
          </TrackItem>
        ))}
      </TrackList>
    </PlaylistView>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

const Shell = styled("main")`
  min-height: 100vh;
  background: #f5f7f9;
  color: #17191d;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled("aside")`
  background: #ffffff;
  border-right: 1px solid #dfe4ea;
  min-height: 100vh;
  padding: 24px;

  @media (max-width: 760px) {
    border-bottom: 1px solid #dfe4ea;
    border-right: 0;
    min-height: auto;
  }
`;

const Brand = styled("h1")`
  font-size: 22px;
  margin: 0 0 24px;
`;

const PlaylistList = styled("nav")`
  display: grid;
  gap: 8px;
`;

const PlaylistLinkItem = styled("div")`
  a {
    border: 1px solid #dfe4ea;
    border-radius: 8px;
    color: inherit;
    display: grid;
    gap: 6px;
    padding: 12px;
    text-decoration: none;
  }

  a[data-active="true"] {
    background: #eef5f2;
    border-color: #77a893;
  }
`;

const PlaylistName = styled("span")`
  font-size: 15px;
  font-weight: 700;
`;

const PlaylistMeta = styled("span")`
  color: #646b76;
  font-size: 13px;
  line-height: 1.35;
`;

const Content = styled("section")`
  min-width: 0;
  padding: 32px;

  @media (max-width: 760px) {
    padding: 24px;
  }
`;

const PlaylistView = styled("div")`
  max-width: 980px;
`;

const PageHeader = styled("header")`
  margin: 0 0 24px;
`;

const Kicker = styled("p")`
  color: #646b76;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
`;

const Title = styled("h2")`
  font-size: 34px;
  line-height: 1.1;
  margin: 0;
`;

const HeaderMeta = styled("p")`
  color: #646b76;
  margin: 10px 0 0;
`;

const TrackList = styled("div")`
  display: grid;
  gap: 12px;
`;

const TrackItem = styled("article")`
  align-items: start;
  background: #ffffff;
  border: 1px solid #dfe4ea;
  border-radius: 8px;
  display: grid;
  gap: 14px;
  grid-template-columns: 36px minmax(0, 1fr);
  padding: 16px;
`;

const TrackPosition = styled("span")`
  align-items: center;
  background: #edf0f3;
  border-radius: 999px;
  color: #555d68;
  display: inline-flex;
  font-size: 13px;
  font-weight: 700;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const TrackBody = styled("div")`
  min-width: 0;
`;

const TrackTitle = styled("h3")`
  font-size: 18px;
  line-height: 1.25;
  margin: 0 0 5px;
`;

const TrackMeta = styled("p")`
  color: #646b76;
  font-size: 14px;
  margin: 0 0 14px;
`;

const AltLinks = styled("div")`
  display: grid;
  gap: 8px;
`;

const AltLink = styled("a")`
  align-items: center;
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  color: inherit;
  display: grid;
  gap: 10px;
  grid-template-columns: 92px minmax(0, 1fr) auto;
  padding: 10px 12px;
  text-decoration: none;

  @media (max-width: 620px) {
    align-items: start;
    grid-template-columns: 1fr;
  }
`;

const LinkSource = styled("span")`
  color: #366853;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
`;

const LinkStatus = styled("span")`
  border-radius: 999px;
  color: #4f5965;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;

  &[data-status="accepted"] {
    background: #e3f3ea;
    color: #286241;
  }

  &[data-status="incorrect"] {
    background: #fbe9e4;
    color: #9c432b;
  }

  &[data-status="unknown"] {
    background: #edf0f3;
  }
`;

const MutedText = styled("p")`
  color: #646b76;
  margin: 0;
`;

const ErrorText = styled("p")`
  color: #a33d2b;
  margin: 0;
`;
