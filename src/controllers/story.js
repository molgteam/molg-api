const { MolgManager, LoginError } = require("../core/molg-manager");
const UserService = require("../services/UserService");
const DBService = require("../services/DBService");
const { compareDateMin, dayjs } = require("../services/utilities");

exports.index = async function (req, res, next) {
  try {
    const targetUser = req.params.id;
    const prevUser = await DBService.fetchUserinfo(targetUser);

    if (
      typeof prevUser === "undefined" ||
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

      res.json({ userData: dbUserInfo, storyData: storySnapshot });
    } else {
      const storySnapshot = await DBService.fetchStorySnapshot(prevUser);
      res.json({ userData: prevUser, storyData: storySnapshot });
    }
  } catch (err) {
    if (err instanceof LoginError) {
      await DBService.updateWorkerErrorCnt(err.username);
      await DBService.updateWorker(err.username, 0);
    }

    console.log("err %o", err);
    next(err);
  }
};
