type FingerprintInput = {
  albumName: string | null;
  artistName: string;
  releaseYear: number | null;
  title: string;
};

export function createFingerprint(input: FingerprintInput) {
  return [input.artistName, input.title, input.albumName, input.releaseYear]
    .map((value) =>
      String(value ?? "")
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, "-"),
    )
    .join(":");
}
