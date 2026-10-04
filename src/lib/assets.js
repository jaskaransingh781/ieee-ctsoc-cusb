// Turns the image references used in src/data/ into real URLs.
//
//   'events/poster.jpg'          -> the bundled file src/assets/events/poster.jpg
//   'https://example.com/a.jpg'  -> used as-is
//   null / unknown file          -> null (the UI shows its fallback visual)

const files = import.meta.glob('../assets/**/*.{png,jpg,jpeg,webp,avif,svg,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function resolveImage(ref) {
  if (!ref) return null;
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('/') || ref.startsWith('data:')) return ref;
  return files[`../assets/${ref.replace(/^\.?\//, '')}`] ?? null;
}
