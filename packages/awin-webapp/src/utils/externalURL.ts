export enum ExternalURL {
  discord,
  twitter,
  notion,
  discourse,
}

export const externalURL = (externalURL: ExternalURL) => {
  switch (externalURL) {
    case ExternalURL.discord:
      return 'http://discord.gg/awin';
    case ExternalURL.twitter:
      return 'https://twitter.com/awindao';
    case ExternalURL.notion:
      return 'https://awin.notion.site/Explore-awin-a2a9dceeb1d54e10b9cbf3f931c2266f';
    case ExternalURL.discourse:
      return 'https://discourse.awin.wtf/';
  }
};
