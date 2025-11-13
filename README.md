# Condominium Map

A responsive single-page map for condominium totems. Each QR code points to this application with a `?totem=` query parameter that drops a "You are here" pin in the right location.

## How it works

- Configuration lives in [`data/config.json`](data/config.json). Update this file with the real latitude/longitude values and map coordinates for totems and destinations.
- `index.html`, `styles.css`, and `script.js` implement the UI, dynamic marker placement, and Google Maps deep links.
- When a destination is selected, the app builds a `https://www.google.com/maps/dir` link that uses the totem latitude/longitude as the origin and the destination coordinates as the endpoint.

## Local development

Use any static web server. For example:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000/?totem=north-gate](http://localhost:8000/?totem=north-gate).

The layout is responsive and works down to narrow phone screens up through larger foldable and desktop widths.
