interface SrsRTCOption {
  app: string;
  stream: string;
  ip: string;
  port: number;
  params: Record<string, string>;
  https: boolean;
}

class SrsRTCPublisher {
  private readonly option: SrsRTCOption = {
    app: "live",
    stream: "livestream",
    ip: "127.0.0.1",
    port: 1985,
    params: {},
    https: false,
  };
  
  private pc: RTCPeerConnection | null = null;

  constructor(option?: Partial<SrsRTCOption>) {
    if (option) {
      this.option = {
        ...this.option,
        ...option,
      };
    }
  }

  async publish(stream: MediaStream) {
    if (this.pc) {
      this.pc.close();
    }

    this.pc = new RTCPeerConnection();
    const pc = this.pc;

    pc.addTransceiver("video", { direction: "sendonly" });
    pc.addTransceiver("audio", { direction: "sendonly" });

    pc.addTrack(stream.getVideoTracks()[0]);
    pc.addTrack(stream.getAudioTracks()[0]);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const queryString = new URLSearchParams(this.option.params).toString();
      const streamurl = `webrtc://${this.option.ip}/${this.option.app}/${this.option.stream}${queryString ? '?' + queryString : ''}`;

      const response = await fetch(
        `http${this.option.https ? 's' : ''}://${this.option.ip}:${this.option.port}/rtc/v1/publish/`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            streamurl: streamurl,
            sdp: offer.sdp,
            api: `http${this.option.https ? 's' : ''}://${this.option.ip}:${this.option.port}/rtc/v1/publish/`,
          }),
        }
      );

      const data = await response.json();
      if (data.code !== 0) {
        throw new Error("获取 Answer 失败");
      }

      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: data.sdp })
      );
    } catch (error) {
      console.error('发布失败:', error);
      if (this.pc) {
        this.pc.close();
        this.pc = null;
      }
      throw error;
    }
  }

  dispose() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}

class SrsRTCPlayer {
  private readonly option: SrsRTCOption = {
    app: "live",
    stream: "livestream",
    ip: "127.0.0.1",
    port: 1985,
    params: {},
    https: false,
  };

  private pc: RTCPeerConnection | null = null;

  constructor(option?: Partial<SrsRTCOption>) {
    if (option) {
      this.option = {
        ...this.option,
        ...option,
      };
    }
  }

  async play() {
    const stream: MediaStream = new MediaStream();

    if (this.pc) {
      this.pc.close();
    }

    this.pc = new RTCPeerConnection();

    const pc = this.pc;

    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    pc.ontrack = (event) => {
      stream.addTrack(event.track);
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const queryString = new URLSearchParams(this.option.params).toString();
      const streamurl = `webrtc://${this.option.ip}/${this.option.app}/${this.option.stream}${queryString ? '?' + queryString : ''}`;

      const response = await fetch(
        `http${this.option.https ? 's' : ''}://${this.option.ip}:${this.option.port}/rtc/v1/play/`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            streamurl: streamurl,
            sdp: offer.sdp,
            api: `http${this.option.https ? 's' : ''}://${this.option.ip}:${this.option.port}/rtc/v1/play/`,
          }),
        }
      );

      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(`SRS 服务器返回错误: ${data.code}`);
      }

      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: data.sdp })
      );

      return stream
    } catch (error) {
      console.error('播放设置失败:', error);
      if (this.pc) {
        this.pc.close();
        this.pc = null;
      }
      throw error;
    }
  }

  dispose() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}

export { SrsRTCPublisher, SrsRTCPlayer };
export type { SrsRTCOption };
