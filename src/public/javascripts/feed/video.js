import videojs from 'video.js';
import 'videojs-landscape-fullscreen';

const feedVideo = (function () {
  const options = {
    fluid: true,
    controls: true,
    autoplay: false,
    preload: 'auto',
    height: '720px',
  };
  let videoInstances = {};

  function onLoadedMetadata() {
    this.play();
    this.on('timeupdate', onTimeUpdate);
  }

  function onTimeUpdate() {}

  return {
    on: ({ id, onEnded = () => {} }) => {
      videoInstances[id] = videojs(id, options);
      videoInstances[id].on('loadedmetadata', onLoadedMetadata);
      videoInstances[id].on('ended', onEnded);

      videoInstances[id].landscapeFullscreen({
        fullscreen: {
          enterOnRotate: true,
          alwaysInLandscapeMode: true,
          iOS: true,
        },
      });
    },
    off: () => {
      Object.keys(videoInstances).forEach((key) => {
        videoInstances[key].dispose();
      });
      videoInstances = {};
    },
    get: (key) => {
      return videoInstances[key];
    },
  };
})();

export default feedVideo;
