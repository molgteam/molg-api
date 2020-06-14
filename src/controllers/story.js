const { MolgManager, LoginError } = require('../core/molg-manager');
const UserService = require('../services/UserService');
const DBService = require('../services/DBService');
const { compareDateMin, dayjs } = require('../services/utilities');

exports.index = async function (req, res, next) {
  try {
    const targetUser = req.params.id;
    const prevUser = await DBService.fetchUserinfo(targetUser);

    if (
      typeof prevUser === 'undefined' ||
      compareDateMin(prevUser.updatedAt) < -10
    ) {
      const worker = await DBService.fetchWorkerByRandom();
      const ig = await MolgManager.getIg(worker);
      const userInfo = await ig.user.searchExact(targetUser);
      const dbUserInfo = await DBService.createUser(userInfo);

      const userPk = { userIds: [dbUserInfo.pk] };
      const userInstance = await ig.feed.reelsMedia(userPk);
      const storyInfo = await UserService.getStories(userInstance);
      await DBService.createStorySnapshot(storyInfo.stories, dbUserInfo);
      const storySnapshot = await DBService.fetchStorySnapshot(dbUserInfo);

      res.render('UserStory', {
        name: dbUserInfo.name,
        pk: dbUserInfo.pk,
        isPrivate: dbUserInfo.isPrivate,
        isVerified: dbUserInfo.isVerified,
        picUrl: dbUserInfo.picUrl,
        updatedAt: dbUserInfo.updatedAt,
        stories: storySnapshot,
        dayjs,
      });
    } else {
      const storySnapshot = await DBService.fetchStorySnapshot(prevUser);
      res.render('UserStory', {
        name: prevUser.name,
        pk: prevUser.pk,
        isPrivate: prevUser.isPrivate,
        isVerified: prevUser.isVerified,
        picUrl: prevUser.picUrl,
        updatedAt: prevUser.updatedAt,
        stories: storySnapshot,
        dayjs,
      });
    }
  } catch (err) {
    if (err instanceof LoginError) {
      await DBService.updateWorkerErrorCnt(err.username);
      await DBService.updateWorker(err.username, 0);
    }

    console.log('err %o', err);
    next(err);
  }
};
