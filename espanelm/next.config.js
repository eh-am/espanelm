module.exports = {
  // hate this since the app itself
  // shouldn't have any idea where
  // it's going to be deployed to
  // but let's roll with it for now
  basePath: process.env.NODE_ENV === 'development' ? '' : '/espanelm',
};
