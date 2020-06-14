// css
import 'purecss';
import 'purecss/build/grids-responsive-min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'video.js/dist/video-js.css';
import '../stylesheets/style.css';

// Needed for Hot Module Replacement
if (typeof module.hot !== 'undefined') {
  module.hot.accept(); // eslint-disable-line no-undef
}

export function bodyLock() {
  const top = -window.document.documentElement.scrollTop;
  $('body').css({
    position: 'fixed',
    width: '100%',
    top,
    overflow: 'hidden',
  });
}

export function bodyScroll() {
  const top = $('body').css('top').replace('px', '');
  const _top = Number(-top);
  $('body').css({
    position: 'static',
    width: 'auto',
    overflow: 'auto',
    top: '',
  });
  window.document.documentElement.scrollTo(0, _top);
}
