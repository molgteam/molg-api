const prompts = require('prompts');
const {
  IgApiClient,
  IgCheckpointError,
  IgLoginTwoFactorRequiredError,
} = require('instagram-private-api');

const ig = new IgApiClient();

(async () => {
  console.log('다시 일어나라 장병들이여!');
  const username = await promptUsername();
  await ig.state.deserialize('{}');
  ig.state.generateDevice(username);
  const res = await logIn(username, await promptPassword());
  console.log(`${res.username}는 살아났습니다..!`);
})().catch(console.error);

async function promptUsername() {
  return (
    await prompts({
      name: 'username',
      type: 'text',
      message: 'Username',
    })
  ).username;
}

async function promptPassword() {
  return (
    await prompts({
      name: 'password',
      type: 'text',
      message: 'Password',
    })
  ).password;
}

async function promptCode(method) {
  return (
    await prompts({
      name: 'code',
      type: 'text',
      message: `Enter the code you received via ${method}`,
    })
  ).code;
}

async function logIn(username, password) {
  // two timer - there could be a checkpoint AND 2FA
  return ig.account
    .login(username, password)
    .catch(handleError)
    .catch(handleError);
}

async function handleError(e) {
  if (e instanceof IgCheckpointError) {
    await ig.challenge.auto(true);
    const code = await promptCode('Email/SMS');
    const loggedIn = (await ig.challenge.sendSecurityCode(code)).logged_in_user;
    if (!loggedIn) return ig.account.currentUser();
    return loggedIn;
  } else if (e instanceof IgLoginTwoFactorRequiredError) {
    const twoFactorInfo = e.response.body.two_factor_info;
    const verificationMethod = twoFactorInfo.totp_two_factor_on
      ? 'TOTP'
      : 'SMS';
    const code = await promptCode(verificationMethod);
    return ig.account.twoFactorLogin({
      verificationMethod,
      verificationCode: code,
      trustThisDevice: '1',
      twoFactorIdentifier: twoFactorInfo.two_factor_identifier,
      username: twoFactorInfo.username,
    });
  } else {
    throw e;
  }
}
