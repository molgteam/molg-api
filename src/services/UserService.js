const {
  setFeedThumbnail,
  setStoryThumbnail,
  kFormatter,
  getCarouselMedia,
  hasVideo,
} = require('./utilities');

exports.getFeeds = async function (user) {
  if (!user) {
    throw new Error('user이 없습니다.');
  }

  let feeds = (await user.items()) || [];

  if (feeds.length) {
    feeds = feeds.map((feed) => ({
      ...feed,
      pk: feed.pk || '',
      taken_at: feed.taken_at,
      media_type: feed.media_type || 0,
      comment_count: kFormatter(feed.comment_count) || 0,
      like_count: kFormatter(feed.like_count) || 0,
      view_count: kFormatter(feed.view_count) || 0,
      device_timestamp: feed.device_timestamp || '',
      carousel_media_count: feed.carousel_media_count || 0,
      carousel_media: getCarouselMedia(feed.carousel_media),
      has_video: hasVideo(feed.video_versions),
      thumbnail: setFeedThumbnail(feed),
      location: feed.location || { name: '찍찍..🐭?' },
    }));
  }

  return {
    feeds,
    moreAvailable: user.moreAvailable,
    next_max_id: user.nextMaxId,
  };
};

exports.getMoreFeeds = async function (user, nextMaxId) {
  if (!user) {
    throw new Error('user이 없습니다.');
  }

  if (!nextMaxId) {
    throw new Error('nextMaxId 값이 없습니다.');
  }

  user.nextMaxId = nextMaxId;

  let res = (await user.items()) || [];

  if (res.length) {
    res = res.map((feed) => ({
      ...feed,
      pk: feed.pk || '',
      taken_at: feed.taken_at,
      media_type: feed.media_type || 0,
      comment_count: kFormatter(feed.comment_count) || 0,
      like_count: kFormatter(feed.like_count) || 0,
      view_count: kFormatter(feed.view_count) || 0,
      device_timestamp: feed.device_timestamp || '',
      carousel_media_count: feed.carousel_media_count || 0,
      carousel_media: getCarouselMedia(feed.carousel_media),
      has_video: hasVideo(feed.video_versions),
      thumbnail: setFeedThumbnail(feed),
      location: feed.location || { name: '찍찍..🐭?' },
    }));
  }

  return {
    feeds: res,
    moreAvailable: user.moreAvailable || false,
    next_max_id: user.nextMaxId || '',
  };
};
exports.getStories = async function (user) {
  if (!user) {
    throw new Error('user이 없습니다.');
  }

  let storyItems = (await user.items()) || [];

  if (storyItems.length) {
    storyItems = storyItems.map((story) => ({
      taken_at: story.taken_at,
      pk: story.pk || '0',
      id: story.id || '0',
      image_versions2: story.image_versions2.candidates || [],
      device_timestamp: story.device_timestamp || 0,
      has_video: hasVideo(story.video_versions),
      video_versions: story.video_versions || [],
      video_duration: story.video_duration || 0,
      expiring_at: story.expiring_at,
      thumbnail: setStoryThumbnail(story),
    }));
  }

  return { stories: storyItems };
};
