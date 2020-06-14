import 'dayjs/locale/ko';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import storyVideo from './video';
import { bodyLock, bodyScroll } from '../common';

dayjs.locale('ko');
dayjs.extend(relativeTime);

(function () {
  const modal = $('#story-modal');
  const storyContent = $('.story-content');
  const lastUpdate = $('.last-update');
  const time = $('.last-update .time');

  $(document).on('click', '.story-modal-btn', function () {
    const id = 'story-player';
    const i = $(this).find('i');
    const { videoUrl, imageUrl } = i.data();
    bodyLock();

    const h = `
      <div>  
        <button title="Close" class="modal-close"><i class="fa fa-times" aria-hidden="true"></i></button>
        <div class="bar-container">
          <div class="bar">
            <div class="in"></div>
          </div>
        </div>
        <video id="${id}" class="video-js" poster="${imageUrl}">
          <source src="${videoUrl}" type="video/mp4" />
        </video>
      </div>`;

    modal.html(h).show();
    storyVideo.on({
      id: id,
      onEnded: () => {
        modal.empty().hide();
        storyVideo.off();
        bodyScroll();
      },
    });
  });

  $(document).on('click', '.modal-close', function () {
    modal.empty().hide();
    storyVideo.off();
    bodyScroll();
  });

  $(document).on('keyup', function (ev) {
    if (ev.keyCode === 27) {
      modal.empty().hide();
      storyVideo.off();
      bodyScroll();
    }
  });

  $(document).on('click', 'input.back', function () {
    window.location.back(-1);
  });

  $(document).on('click', '.download', async function () {
    const el = $(this);
    const url = el.data('url');
    const file = el.data('file');
    if (!url) {
      throw new Error('data-url attribute를 확인해주세요.');
    }
    if (!file) {
      throw new Error('data-file attribute를 확인해주세요.');
    }

    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.alert('사라진 스토리는 다운로드할 수 없어 찍찍..🐭');
    }
  });

  lastUpdate.on('click', 'button', async function () {
    const $el = $(this);
    const { id } = time.data();

    try {
      $el.html('<i class="fa fa-spinner fa-spin"></i>');
      const res = await $.get('/api/v1/story', { id });

      $el.html(res.refreshText);
      window.alert(res.refreshAlert);
      storyContent.empty();

      if (!res.stories.length) {
        const html = `
          <div class="pure-u" style="width: 100%; text-align: center;">
            <p>
              이런 .... 스토리가 없어 찍찍..🐭<br />
              <input
                class="pure-button backBtn"
                value="뒤로가기"
                type="button"
              />
            </p>
          </div>`;
        storyContent.append(html);
      }

      res.stories.forEach((story) => {
        const timestamp = dayjs.unix(story.takenAt).format('YY/MM/DD h:m:s');
        const html = `
        <div class="pure-u-sm-1-1 pure-u-md-1-3 is-center">
          <p class="story-title">
            ${timestamp}
          </p>
          <div class="img-container">
            <img class="pure-img story-img" src="${story.imageUrl}" />
            <div class="overlay">
              <a class="icon story-modal-btn">
                ${
                  story.hasVideo
                    ? `<i
                      class="fa fa-play-circle"
                      data-video-url="${story.videoUrl}"
                      data-image-url="${story.imageUrl}"
                  ></i>`
                    : ''
                }
              </a>
            </div>
          </div>
          <button
            class="pure-button download"
            data-url="${story.hasVideo ? story.videoUrl : story.imageUrl}"
            data-file="${story.pk}"
          >
            DOWNLOAD
          </button>
        </div>`;
        storyContent.append(html);
      });

      time.attr('data-datetime', res.updatedAt);
      time.text(dayjs.unix(res.updatedAt).fromNow());
    } catch (e) {
      window.alert(e.responseJSON.refreshAlert);
      $el.html(e.responseJSON.refreshText);
    }
  });

  $(document).ready(function () {
    const { datetime, interval } = time.data();
    window.setInterval(() => {
      time.text(dayjs.unix(datetime).fromNow());
    }, interval * 1000);
  });
})();
