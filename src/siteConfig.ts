export type SocialKey = "tiktok" | "youtube" | "instagram" | "kick";

export const siteConfig = {
  creatorName: "Anildev",
  tagline: "Selamlar, ben Anıl. 29 yaşındayım. Yazılım mühendisiyim. Kafa dağıtmak için yayın açıyorum, oyun oynuyorum, oyun geliştiriyorum.",
  // Replace this with your own YouTube channel id.
  youtubeChannelId: "UC5HZthpqNgwbxIczihPk5KA",
  links: {
    tiktok: "https://www.tiktok.com/@anilldev",
    youtube: "https://www.youtube.com/@anilldev",
    instagram: "https://www.instagram.com/anilized",
    kick: "https://kick.com/anildev",
  } as Record<SocialKey, string>,
};
