const dayjs = require('dayjs');
const { MolgManager, LoginError } = require('../../core/molg-manager');
const UserService = require('../../services/UserService');
const DBService = require('../../services/DBService');

exports.feed = async (req, res, next) => {
  try {
    const pk = req.query.id;
    const nextMaxId = req.query.nextMaxId;
    const worker = await DBService.fetchWorkerByRandom();
    const ig = await MolgManager.getIg(worker);
    const userInstance = ig.feed.user(pk);
    const feedInfo = await UserService.getMoreFeeds(userInstance, nextMaxId);

    res
      .json({
        feeds: feedInfo.feeds,
        moreAvailable: feedInfo.moreAvailable,
        next_max_id: feedInfo.next_max_id,
      })
      .status(200);
  } catch (err) {
    if (err instanceof LoginError) {
      await DBService.updateWorkerErrorCnt(err.username);
      await DBService.updateWorker(err.username, 0);
    }

    console.log('err %o', err);
    next(err);
  }
};

exports.refreshStory = async (req, res, next) => {
  try {
    const pk = req.query.id;
    const updatedAt = await DBService.fetchUserUpdatedAt(pk);
    const afterOneMinute = dayjs.unix(updatedAt).add(1, 'minutes');
    const leftSeconds = afterOneMinute.diff(dayjs(), 'seconds');

    if (leftSeconds > 0) {
      res.status(401).json({
        refreshText: '스토리갱신',
        refreshAlert: `${leftSeconds}초 후에 다시 갱신할 수 있다구 찍찍..🐭`,
      });
      return;
    }

    const worker = await DBService.fetchWorkerByRandom();
    const ig = await MolgManager.getIg(worker);
    const dbUserInfo = await DBService.updateUserUpdatedAt(pk);
    const userIds = { userIds: [pk] };
    const userInstance = await ig.feed.reelsMedia(userIds);
    const storyInfo = await UserService.getStories(userInstance);

    await DBService.createStorySnapshot(storyInfo.stories, dbUserInfo);
    const storySnapshot = await DBService.fetchStorySnapshot(dbUserInfo);

    res.json({
      stories: storySnapshot,
      refreshText: '갱신됨',
      refreshAlert: '갱신을 완료했어 찍찍..🐭',
      updatedAt: dbUserInfo.updatedAt,
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
