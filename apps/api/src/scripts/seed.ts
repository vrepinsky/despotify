import { faker } from "@faker-js/faker";
import { createAppContext } from "../app-context.js";
import { createFingerprint } from "../helpers/fingerprint.helper.js";

type SeedTrack = {
  albumName: string;
  artistName: string;
  durationMs: number;
  isrc: string | null;
  releaseYear: number;
  title: string;
};

faker.seed(20260703);

const appContext = createAppContext();
const { repositories } = appContext;

const playlistThemes = ["Late Night Record Bin", "Independent Finds", "Downloadable Gems"];

const seedTracks: SeedTrack[] = [
  {
    albumName: "Neon Basement",
    artistName: "Mira Vale",
    durationMs: 217_000,
    isrc: "USMO12600001",
    releaseYear: 2021,
    title: "Static Bloom",
  },
  {
    albumName: "Harbor Lights",
    artistName: "The Soft Machines",
    durationMs: 188_000,
    isrc: "GBUM72600002",
    releaseYear: 2020,
    title: "Low Tide Signal",
  },
  {
    albumName: "Glass Maps",
    artistName: "Nadia North",
    durationMs: 242_000,
    isrc: null,
    releaseYear: 2023,
    title: "Cartographer",
  },
  {
    albumName: "Sunday Circuit",
    artistName: "Ari Junction",
    durationMs: 204_000,
    isrc: "NLF712600003",
    releaseYear: 2019,
    title: "Return Path",
  },
  {
    albumName: "Field Notes",
    artistName: "Little Atlas",
    durationMs: 263_000,
    isrc: null,
    releaseYear: 2022,
    title: "North Window",
  },
  {
    albumName: "Archive Dust",
    artistName: "Mira Vale",
    durationMs: 231_000,
    isrc: "USMO12600006",
    releaseYear: 2024,
    title: "Static Bloom - Live Room",
  },
];

try {
  await repositories.seed.clear();

  const tracks = await Promise.all(
    seedTracks.map((track) =>
      requireRecord(
        repositories.tracks.create({
          ...track,
          normalizedFingerprint: createFingerprint(track),
        }),
      ),
    ),
  );

  const playlists = await Promise.all(
    playlistThemes.map((name, index) =>
      requireRecord(
        repositories.playlists.create({
          authorName: faker.person.fullName(),
          description: faker.music.genre(),
          imageUrl: faker.image.urlLoremFlickr({ category: "music" }),
          metadata: {
            followerCount: faker.number.int({ max: 20_000, min: 25 }),
            seeded: true,
          },
          name,
          sourcePlaylistId: `spotify-playlist-${index + 1}`,
          sourceUrl: `https://open.spotify.com/playlist/seed-${index + 1}`,
        }),
      ),
    ),
  );

  const playlistA = getSeedItem(playlists, 0);
  const playlistB = getSeedItem(playlists, 1);
  const playlistC = getSeedItem(playlists, 2);
  const trackA = getSeedItem(tracks, 0);
  const trackB = getSeedItem(tracks, 1);
  const trackC = getSeedItem(tracks, 2);
  const trackD = getSeedItem(tracks, 3);
  const trackE = getSeedItem(tracks, 4);
  const trackF = getSeedItem(tracks, 5);

  await Promise.all([
    repositories.playlistTracks.add({
      playlistId: playlistA.id,
      position: 1,
      sourceTrackId: "spotify-track-1",
      trackId: trackA.id,
    }),
    repositories.playlistTracks.add({
      playlistId: playlistA.id,
      position: 2,
      sourceTrackId: "spotify-track-2",
      trackId: trackB.id,
    }),
    repositories.playlistTracks.add({
      playlistId: playlistA.id,
      position: 3,
      sourceTrackId: "spotify-track-3",
      trackId: trackC.id,
    }),
    repositories.playlistTracks.add({
      playlistId: playlistB.id,
      position: 1,
      sourceTrackId: "spotify-track-1",
      trackId: trackA.id,
    }),
    repositories.playlistTracks.add({
      playlistId: playlistB.id,
      position: 2,
      sourceTrackId: "spotify-track-4",
      trackId: trackD.id,
    }),
    repositories.playlistTracks.add({
      playlistId: playlistB.id,
      position: 3,
      sourceTrackId: "spotify-track-5",
      trackId: trackE.id,
    }),
    repositories.playlistTracks.add({
      playlistId: playlistC.id,
      position: 1,
      sourceTrackId: "spotify-track-6",
      trackId: trackF.id,
    }),
  ]);

  await Promise.all(
    tracks.map((track, index) =>
      repositories.trackExternalIds.add({
        externalId: `spotify-track-${index + 1}`,
        externalUrl: `https://open.spotify.com/track/seed-${index + 1}`,
        metadata: { seeded: true },
        source: "spotify",
        trackId: track.id,
      }),
    ),
  );

  await Promise.all([
    repositories.trackLinks.add({
      artistName: trackA.artistName,
      confidence: "0.9600",
      metadata: { edgeCase: "one_track_many_links_same_service" },
      source: "bandcamp",
      status: "accepted",
      title: trackA.title,
      trackId: trackA.id,
      type: "paid",
      url: "https://miravale.bandcamp.com/track/static-bloom",
    }),
    repositories.trackLinks.add({
      artistName: trackA.artistName,
      confidence: "0.8100",
      metadata: { edgeCase: "one_track_many_links_same_service" },
      source: "bandcamp",
      status: "accepted",
      title: `${trackA.title} Demo`,
      trackId: trackA.id,
      type: "paid",
      url: "https://miravale.bandcamp.com/track/static-bloom-demo",
    }),
    repositories.trackLinks.add({
      artistName: trackA.artistName,
      confidence: "0.7400",
      metadata: { edgeCase: "incorrect_alternative" },
      source: "youtube",
      status: "incorrect",
      title: "Static Bloom Cover",
      trackId: trackA.id,
      type: "stream",
      url: "https://youtube.com/watch?v=incorrect-static-bloom",
    }),
    repositories.trackLinks.add({
      artistName: trackB.artistName,
      confidence: "0.9200",
      metadata: { edgeCase: "one_to_one" },
      source: "soundcloud",
      status: "accepted",
      title: trackB.title,
      trackId: trackB.id,
      type: "free_download",
      url: "https://soundcloud.com/the-soft-machines/low-tide-signal",
    }),
    repositories.trackLinks.add({
      artistName: trackC.artistName,
      confidence: "0.6700",
      metadata: { edgeCase: "missing_isrc" },
      source: "youtube",
      status: "unknown",
      title: trackC.title,
      trackId: trackC.id,
      type: "stream",
      url: "https://youtube.com/watch?v=cartographer-seed",
    }),
  ]);

  console.log("Seeded mock playlist import data.");
} finally {
  await appContext.pool.end();
}

async function requireRecord<T>(record: Promise<T | undefined>) {
  const resolved = await record;
  if (!resolved) {
    throw new Error("Expected seed insert to return a record.");
  }

  return resolved;
}

function getSeedItem<T>(items: T[], index: number) {
  const item = items[index];
  if (!item) {
    throw new Error(`Missing seed item at index ${index}.`);
  }

  return item;
}
