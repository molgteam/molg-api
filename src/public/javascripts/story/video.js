import videojs from 'video.js';
import 'videojs-landscape-fullscreen';

const storyVideo = (function () {
  const options = {
    fluid: true,
    controls: false,
    autoplay: false,
    preload: 'auto',
    height: '720px',
  };
  let videoInstance;
  let hasPlay = false;
  let duration;

  function onLoadedMetadata() {
    duration = this.duration();
    this.play();
    this.on('timeupdate', onTimeUpdate);
  }

  function onTimeUpdate() {
    if (!hasPlay) {
      $('.bar').css({
        animation: `fill ${duration}s linear 1`,
        'background-color': '#fff',
      });

      hasPlay = true;
    }
  }

  return {
    on: ({ id, onEnded }) => {
      videoInstance = videojs(id, options);
      videoInstance.one('loadedmetadata', onLoadedMetadata);
      videoInstance.one('ended', onEnded);
      videoInstance.one('error', () => {
        window.alert('사라진 스토리는 볼 수 없어 찍찍..🐭');
        onEnded();
      });
      videoInstance.landscapeFullscreen({
        fullscreen: {
          enterOnRotate: true,
          alwaysInLandscapeMode: true,
          iOS: true,
        },
      });
    },
    off: () => {
      videoInstance.dispose();
      hasPlay = false;
    },
    get: () => {
      return videoInstance;
    },
  };
})();

export default storyVideo;
