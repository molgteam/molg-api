const { IgApiClient } = require('instagram-private-api');
const _omit = require('lodash/omit');

const {
  createDirectories,
  loadStateFor,
  saveStateFor,
} = require('./utilities');
// const ProxyList = require('../../config/proxylist');

class MolgManager {
  async getIg(worker) {
    const { username } = worker;
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    const state = await this.getState(username);

    console.log(`🐭 ${username} <---- 일어나 이 녀석아!`);

    if (state.ig) {
      await ig.state.deserialize(state.ig);
    }

    await this.authentication(ig, worker);

    ig.request.end$.subscribe(async () => {
      saveStateFor(username, {
        ig: JSON.stringify(_omit(await ig.state.serialize(), 'constants')),
        username,
      });

      // 메모리 부하를 막기 위해 subscribe 제거함
      ig.request.end$.complete();
    });

    return ig;
  }

  async authentication(ig, worker) {
    // const randIdx = Math.floor(Math.random() * ProxyList.length);
    // ig.state.proxyUrl = ProxyList[randIdx];
    // 나중에 쓸 프록시를 위해..
    try {
      await ig.account.currentUser();
    } catch (e) {
      console.log(`---------------LOGIN=${worker.username}---------------`);
      await this.logIn(ig, worker);
    }
  }

  async logIn(ig, worker) {
    const { username, password } = worker;
    return ig.account.login(username, password).catch(() => {
      throw new LoginError(worker);
    });
  }

  async getState(username) {
    await createDirectories('state');
    let state;

    state = await loadStateFor(username);

    if (!state) {
      state = {
        ig: undefined,
        username,
      };
    }

    return state;
  }
}

function LoginError(worker) {
  this.username = worker.username;
  this.message = `🚨${this.username}는(은) 패전하였습니다...`;
}

const mg = new MolgManager();

module.exports = { MolgManager: mg, LoginError };
