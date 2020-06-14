require('dayjs/locale/ko');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.locale('ko');
dayjs.extend(relativeTime);

function getFeedImage(feed) {
  const obj = {};
  if (!feed.image_versions2.candidates) return obj;

  const [pc] = feed.image_versions2.candidates;

  obj.type = 'image';
  obj.width = pc.width;
  obj.height = pc.height;
  obj.url = pc.url;

  return obj;
}

function getFeedVideo(feed) {
  const obj = {};
  if (!feed.video_versions) return obj;

  const [videoItem] = feed.video_versions;

  obj.type = 'video';
  obj.width = videoItem.width;
  obj.height = videoItem.height;
  obj.url = videoItem.url;

  return obj;
}

function getCarouselMedia(carouselMedia) {
  if (!carouselMedia) return [];

  return carouselMedia.map(({ id, media_type, ...rest }) => {
    const feed = media_type === 2 ? getFeedVideo(rest) : getFeedImage(rest);

    const result = {
      id,
      media_type,
      ...feed,
    };

    return result;
  });
}

/**
 * 8 = carousel
 * 2 = video
 * 1 = image
 */
function setFeedThumbnail({ media_type, ...rest }) {
  if (typeof media_type === 'undefined')
    throw new Error('media_type가 없습니다.');

  if (media_type === 8) {
    return getFeedImage(rest.carousel_media[0]);
  }

  return getFeedImage(rest);
}

function setStoryThumbnail(feed) {
  return getFeedImage(feed);
}

function kFormatter(num) {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
    : Math.sign(num) * Math.abs(num);
}

function compareDateMin(unixTime) {
  return dayjs.unix(unixTime).diff(dayjs().unix(), 'minute');
}

function hasVideo(video_versions) {
  return typeof video_versions !== 'undefined';
}

function getCurrentUnixDate() {
  return dayjs().unix();
}

module.exports = {
  getFeedImage,
  getFeedVideo,
  setFeedThumbnail,
  setStoryThumbnail,
  kFormatter,
  getCarouselMedia,
  hasVideo,
  compareDateMin,
  getCurrentUnixDate,
  dayjs,
};
