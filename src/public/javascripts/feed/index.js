import '../../stylesheets/feed.css';
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import feedVideo from '../feed/video';
import dayjs from 'dayjs';
import lazyload from 'lazyload';

import { bodyLock, bodyScroll } from '../common';

(function () {
  const container = $('.feed-container');
  const modal = $('#feed-modal');
  const more = $('#more');

  const renderFeed = (feeds) => {
    feeds.forEach((feed) => {
      const date = dayjs.unix(feed.taken_at).format('YY/MM/DD hh:mm:ss');
      const h = `
      <div class="pure-u-sm-1-1 pure-u-md-1-3 is-center feed-wrapper">
          <div class="feed-header">
            <p class="story-title">${date}</p>
          </div>
          <div class="img-container">
            <img 
              class="pure-img feed-img lazyload"
              data-src="${feed.thumbnail.url}"
            />
            <div class="overlay">
              <a class="icon feed-modal-btn" title="${feed.thumbnail.type}">
                ${renderIcon(feed)}
              </a>
            </div>
          </div>
          <div class="feed-footer">
            ${renderFooter(feed)}
          </div>
        </div>`;
      container.append(h);
    });
    new lazyload();
  };

  const renderIcon = (feed) => {
    if (feed.media_type === 2) {
      const videoUrl = feed.video_versions[0].url;
      return `<i class="fa fa-play-circle video" data-url="${videoUrl}"></i>`;
    } else if (feed.media_type === 8) {
      const mediaUrls = feed.carousel_media.map((m) => m.url);

      return `<i class="fa fa-clone carousel" data-carousel-media="${mediaUrls}"></i>`;
    }

    return '';
  };

  const renderFooter = (feed) => {
    const locationName = feed.location.name ? feed.location.name : '찍찍..🐭?';
    let h = '';
    if (feed.thumbnail.type === 'video') {
      h += `<p class="pure-u-1-2"><i class="fa fa-eye"></i>${feed.view_count}</p>`;
    } else {
      h += `<p class="pure-u-1-2"><i class="fa fa-heart"></i>${feed.like_count}</p>`;
    }

    h += `<p class="pure-u-1-2"><i class="fa fa-comment"></i>${feed.comment_count}</p>
    <div class="pure-u-1 feed-location">${locationName}</div>`;

    return h;
  };

  more.on('click', function () {
    const pk = more.data('id');
    const nextMaxId = more.data('next-max-id');

    // add loading
    more.html('<i class="fa fa-spinner fa-spin"></i>');
    more.prop('disabled', true);

    $.get('/api/v1/feed', { id: pk, nextMaxId }).then(
      ({ feeds, moreAvailable, next_max_id }) => {
        renderFeed(feeds);
        if (moreAvailable) {
          more.data({ 'next-max-id': next_max_id });
          more.html('<i class="fa fa-chevron-circle-down"></i>');
          more.prop('disabled', false);
        } else {
          more.remove();
        }
      },
    );
  });

  $('body').on('click', '.video', function () {
    bodyLock();
    const url = $(this).data('url');
    const id = 'feed-video';
    const h = `
      <div>
        <button title="Close" class="modal-close"><i class="fa fa-times" aria-hidden="true"></i></button>
        <video id=${id} class="video-js">
          <source src="${url}" type="video/mp4" />
        </video>
      </div>`;
    modal.html(h).show();
    feedVideo.on({
      id: id,
      onEnded: () => {
        modal.empty().hide();
        feedVideo.off();
        bodyScroll();
      },
    });
  });

  $('body').on('click', '.carousel', function () {
    bodyLock();
    const carouselMedia = $(this).data('carousel-media').split(',');
    const html =
      carouselMedia.reduce(
        (prevHtml, media, index) => {
          let h = '<div>';
          if (media.includes('.mp4')) {
            h += `
          <video id="feed-${index}" class="video-js vjs-default-skin vjs-big-play-centered">
            <source src="${media}" type="video/mp4" />
          </video>`;
          } else {
            h += `
          <img class="pure-img inner-feed-img" src="${media}"/>`;
          }

          h += '</div>';
          return prevHtml + h;
        },
        `
      <div class="modal-container">
      <button title="Close" class="modal-close"><i class="fa fa-times" aria-hidden="true"></i></button>
      <div class="modal-content"><div class="slider">
      `,
      ) + '</div></div></div>';

    modal.html(html);
    modal.show();

    $('.slider').slick({ dots: true, mobileFirst: true });
    $('.slider').slick('setPosition');
  });

  $(document).on('click', '.modal-close', function () {
    if (modal.attr('class').includes('slick-initialized')) {
      modal.slick('unslick');
    }

    bodyScroll();
    modal.empty().hide();
    feedVideo.off();
  });

  $(document).on('keyup', function (ev) {
    if (ev.keyCode === 27) {
      if (modal.attr('class').includes('slick-initialized')) {
        modal.slick('unslick');
      }

      bodyScroll();
      modal.empty().hide();
      feedVideo.off();
    }
  });

  $(document).on('init', '.slider', function (event, slick) {
    const video = $(slick.$slides.get(0)).find('video');
    if (video.length) {
      const id = video.attr('id');
      feedVideo.on({ id });
    }
  });

  $(document).on('beforeChange', '.slider', function (_, slick, currentSlide) {
    const video = $(slick.$slides.get(currentSlide)).find('video');
    if (video.length) {
      const id = video.attr('id').replace('_html5_api', '');
      const feedVideoInstance = feedVideo.get(id);
      feedVideoInstance.pause();
    }
  });

  $(document).on('afterChange', '.slider', function (_, slick, currentSlide) {
    const video = $(slick.$slides.get(currentSlide)).find('video');
    if (video.length) {
      // videojs에서 id에 _html5_api를 자동으로 추가해버림.
      const id = video.attr('id').replace('_html5_api', '');
      const feedVideoInstance = feedVideo.get(id);

      if (!feedVideoInstance) {
        feedVideo.on({ id });
      } else {
        feedVideoInstance.play();
      }
    }
  });

  $(document).ready(function () {
    new lazyload();
  });
})($);
