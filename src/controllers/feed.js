const { MolgManager, LoginError } = require('../core/molg-manager');
const DBService = require('../services/DBService');
const UserService = require('../services/UserService');
const { dayjs } = require('../services/utilities');

exports.index = async function (req, res, next) {
  try {
    const targetUser = req.params.id;
    const worker = await DBService.fetchWorkerByRandom();
    const ig = await MolgManager.getIg(worker);
    const userInfo = await ig.user.searchExact(targetUser);
    const userInstance = await ig.feed.user(userInfo.pk);
    const feedInfo = { feeds: [], moreAvailable: false, next_max_id: 0 };

    if (!userInfo.is_private) {
      const { feeds, moreAvailable, next_max_id } = await UserService.getFeeds(
        userInstance,
      );

      feedInfo.feeds = feeds;
      feedInfo.moreAvailable = moreAvailable;
      feedInfo.next_max_id = next_max_id;
    }

    res.render('UserFeed', {
      id: userInfo.username,
      is_private: userInfo.is_private,
      is_verified: userInfo.is_verified,
      profile_pic_url: userInfo.profile_pic_url,
      feeds: feedInfo.feeds,
      moreAvailable: feedInfo.moreAvailable,
      next_max_id: feedInfo.next_max_id,
      pk: userInfo.pk,
      dayjs,
    });
  } catch (err) {
    if (err instanceof LoginError) {
      await DBService.updateWorkerErrorCnt(err.username);
      await DBService.updateWorker(err.username, 0);
    }

    console.log('err %o', err);
    next(err);
  }
};
