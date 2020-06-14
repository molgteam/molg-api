const { MolgManager, LoginError } = require('../core/molg-manager');
const DBService = require('../services/DBService');

exports.index = async function (req, res, next) {
  const regex = /^[a-zA-Zㄱ-힣0-9|/_/.]*$/;

  try {
    let username = req.query.id.replace(/ /gi, '');
    if (username.length == 0) {
      const author = ['_.wook', '_________ggun'];
      username = author[Math.floor(Math.random() * author.length)];
    }

    if (!regex.test(username)) {
      res.render('UserSearchResult', { userItems: [], username });
      return;
    }

    const worker = await DBService.fetchWorkerByRandom();
    const ig = await MolgManager.getIg(worker);
    const userItems = await ig.search.users(username);

    res.render('UserSearchResult', { userItems, username });
  } catch (err) {
    if (err instanceof LoginError) {
      await DBService.updateWorkerErrorCnt(err.username);
      await DBService.updateWorker(err.username, 0);
    }

    console.log('err %o', err);
    next(err);
  }
};
