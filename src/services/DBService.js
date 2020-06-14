const knex = require("../../config/database");
const { getCurrentUnixDate } = require("../services/utilities");

const createUser = async (user) => {
  let prevUser;
  let processedUser;
  try {
    prevUser = await knex("user").where({ pk: user.pk });
    if (prevUser.length) {
      await knex("user")
        .update({
          name: user.username,
          fullName: user.full_name,
          isPrivate: user.is_private,
          isVerified: user.is_verified,
          picUrl: user.profile_pic_url,
          updatedAt: getCurrentUnixDate(),
        })
        .where({ pk: user.pk });
    } else {
      await knex("user").insert({
        pk: user.pk,
        name: user.username || "",
        fullName: user.full_name || "",
        isPrivate: user.is_private,
        isVerified: user.is_verified,
        picUrl: user.profile_pic_url,
      });
    }
    processedUser = await knex("user").where({ pk: user.pk });
    return processedUser[0];
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const updateUserUpdatedAt = async (pk) => {
  try {
    let lastestUpdatedAt;
    await knex("user")
      .update({ updatedAt: getCurrentUnixDate() })
      .where({ pk });

    lastestUpdatedAt = await knex("user").where({ pk });
    return lastestUpdatedAt[0];
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const fetchUserUpdatedAt = async (pk) => {
  try {
    let user = await knex("user").where({ pk });
    return user[0].updatedAt;
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const fetchUserinfo = async (username) => {
  try {
    let prevUser = await knex("user").where({ name: username });

    return prevUser[0];
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const createStorySnapshot = async (stories, user) => {
  try {
    await knex("story").where({ userPk: user.pk }).del();
    // let prevUser = await knex('user').where({ pk: user.pk });
    // let latestUpdatedTime = prevUser[0].updatedAt;
    await knex("story").insert(
      stories.map((story) => ({
        userPk: user.pk,
        pk: story.pk,
        hasVideo: story.has_video,
        imageUrl: story.image_versions2[0].url || "",
        videoUrl: story.has_video ? story.video_versions[0].url : "",
        takenAt: story.taken_at,
        expireAt: story.expiring_at,
      }))
    );
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const fetchStorySnapshot = async (user) => {
  try {
    let stories = await knex("story").where({ userPk: user.pk });
    return stories;
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const createLog = async (msg) => {
  try {
    await knex("log").insert({
      message: msg,
      timestamp: getCurrentUnixDate(),
    });
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const fetchWorkers = async () => {
  try {
    let workers = await knex("api_account").where({ isWorked: 1 });
    return workers;
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const fetchWorkerByRandom = async () => {
  try {
    let worker = await knex.raw(
      `SELECT * FROM api_account WHERE isWorked = '1' ORDER BY RAND() LIMIT 1`
    );
    return worker[0][0];
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const updateWorkerErrorCnt = async (workerUsername) => {
  try {
    await knex.raw(
      `UPDATE api_account SET errorCnt = errorCnt + 1 WHERE username = '${workerUsername}'`
    );
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

const updateWorker = async (workerUsername, worked) => {
  try {
    await knex("api_account")
      .update({ isWorked: String(worked) })
      .where({ username: workerUsername });
  } catch (e) {
    throw new Error("찌리리리리지ㅣ지지지 으아아악 감전이다.", e);
  }
};

module.exports = {
  createUser,
  fetchUserinfo,
  createStorySnapshot,
  fetchStorySnapshot,
  updateUserUpdatedAt,
  fetchUserUpdatedAt,
  createLog,
  fetchWorkers,
  fetchWorkerByRandom,
  updateWorker,
  updateWorkerErrorCnt,
};
