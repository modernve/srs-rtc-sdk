# SRS WebRTC SDK

SRS WebRTC SDK is a WebRTC streaming solution based on SRS (Simple Realtime Server). It provides simple APIs for WebRTC publishing and playing.

### Features

- Easy-to-use WebRTC publishing
- WebRTC playback support
- Configurable connection parameters
- TypeScript support
- Lightweight and efficient

### Installation

```bash
npm install srs-rtc-sdk
```

### Publish

```ts
import { SrsRTCPublisher } from "srs-rtc-sdk";

const publisher = new SrsRTCPublisher({
  app: "live",
  stream: "livestream",
  ip: "127.0.0.1",
  port: 1985,
  https: false,
});

const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});

await publisher.publish(stream);

```

### Play

```ts
import { SrsRTCPlayer } from "srs-rtc-sdk";

const player = new SrsRTCPlayer({
  app: "live",
  stream: "livestream",
  ip: "127.0.0.1",
  port: 1985,
  https: false,
});

const playerStream = await player.play();
```

### License

MIT
