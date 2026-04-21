let useMock = process.env.POF_MOCK !== 'false';

function isMock() {
  return useMock;
}

function enableMock() {
  useMock = true;
}

module.exports = { isMock, enableMock };
