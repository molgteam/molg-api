const { promises } = require('fs');
const { createHash } = require('crypto');

async function createDirectories(file = 'temp') {
  return await promises
    .access(`./${file}`)
    .catch(() => promises.mkdir(`./${file}`));
}

async function loadStateFor(name) {
  const nameHash = hash(name);
  return loadStateRaw(`${nameHash}.json`);
}

async function loadStateRaw(fileName) {
  const filePath = `./state/${fileName}`;
  return await promises
    .access(filePath)
    .then(() =>
      promises
        .readFile(filePath, { encoding: 'utf8' })
        .then((data) => JSON.parse(data)),
    )
    .catch(() => undefined);
}

async function saveStateFor(name, data) {
  const nameHash = hash(name);
  const filePath = `./state/${nameHash}.json`;
  await promises.writeFile(filePath, JSON.stringify(data));
}

async function saveErrorFor(date, logData) {
  const filePath = `./error/${date}.json`;
  await promises.writeFile(filePath, JSON.stringify(logData));
}

function hash(data) {
  return createHash('md5').update(data).digest().toString('hex');
}

module.exports = {
  createDirectories,
  loadStateFor,
  loadStateRaw,
  saveStateFor,
  hash,
  saveErrorFor,
};
