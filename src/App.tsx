import { useEffect, useState } from "react";
import { siteConfig, type SocialKey } from "./siteConfig";

type FeedItem = {
  link: string;
  pubDate: string;
  thumbnail?: string;
  title: string;
};

type FeedResponse = {
  items: FeedItem[];
  status: string;
};

type LatestVideo = {
  id: string;
  link: string;
  published: string;
  thumbnail: string;
  title: string;
};

type SocialGroup = "CANLI YAYINLAR" | "YAYIN KESITLERI" | "SOSYAL MEDYA";

type SocialCard = {
  group: SocialGroup;
  gradientClass: string;
  handle: string;
  href: string;
  iconSrc: string;
  key: SocialKey;
  label: string;
  ringClass: string;
};

const socialCards: SocialCard[] = [
  {
    key: "tiktok",
    label: "TikTok",
    group: "SOSYAL MEDYA",
    href: siteConfig.links.tiktok,
    iconSrc: "https://cdn.simpleicons.org/tiktok/ffffff",
    gradientClass: "from-emerald-400/20 to-lime-400/20",
    ringClass: "hover:ring-emerald-300/45",
    handle: getHandle(siteConfig.links.tiktok),
  },
  {
    key: "youtube",
    label: "YouTube",
    group: "YAYIN KESITLERI",
    href: siteConfig.links.youtube,
    iconSrc: "https://cdn.simpleicons.org/youtube/ff0000",
    gradientClass: "from-emerald-400/20 to-lime-400/20",
    ringClass: "hover:ring-emerald-300/45",
    handle: getHandle(siteConfig.links.youtube),
  },
  {
    key: "instagram",
    label: "Instagram",
    group: "SOSYAL MEDYA",
    href: siteConfig.links.instagram,
    iconSrc: "https://cdn.simpleicons.org/instagram/ffffff",
    gradientClass: "from-emerald-400/20 to-lime-400/20",
    ringClass: "hover:ring-emerald-300/45",
    handle: getHandle(siteConfig.links.instagram),
  },
  {
    key: "kick",
    label: "Kick",
    group: "CANLI YAYINLAR",
    href: siteConfig.links.kick,
    iconSrc: "https://cdn.simpleicons.org/kick/53fc18",
    gradientClass: "from-emerald-400/20 to-lime-400/20",
    ringClass: "hover:ring-emerald-300/45",
    handle: getHandle(siteConfig.links.kick),
  },
];

const socialGroupOrder: SocialGroup[] = [
  "CANLI YAYINLAR",
  "YAYIN KESITLERI",
  "SOSYAL MEDYA",
];

function getHandle(url: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    if (!lastPart) {
      return parsed.hostname;
    }

    return lastPart.startsWith("@") ? lastPart : `@${lastPart}`;
  } catch {
    return url;
  }
}

function extractVideoId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) return watchMatch[1];

  const shortMatch = url.match(/\/(?:shorts|live|embed)\/([^/?&]+)/);
  if (shortMatch?.[1]) return shortMatch[1];

  const shortDomainMatch = url.match(/youtu\.be\/([^/?&]+)/);
  if (shortDomainMatch?.[1]) return shortDomainMatch[1];

  return null;
}

function isLongFormVideo(item: FeedItem): boolean {
  const link = item.link.toLowerCase();
  const title = item.title.toLowerCase();

  const isStandardVideoUrl = link.includes("watch?v=") || link.includes("youtu.be/");
  const isShort = link.includes("/shorts/") || title.includes("#shorts");

  return isStandardVideoUrl && !isShort;
}

async function fetchLatestVideo(channelId: string): Promise<LatestVideo> {
  if (!channelId.trim()) {
    throw new Error("Set your YouTube channel id in src/siteConfig.ts.");
  }

  // rss2json caches by source URL; changing this query forces a fresh upstream read.
  const feedUrl = encodeURIComponent(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}&_=${Date.now()}`,
  );
  const response = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Could not load YouTube feed.");
  }

  const data = (await response.json()) as FeedResponse;
  if (data.status !== "ok" || data.items.length === 0) {
    throw new Error("No videos found for this YouTube channel.");
  }

  const latest = data.items.find(isLongFormVideo);
  if (!latest) {
    throw new Error("No long-form videos found for this channel yet.");
  }

  const videoId = extractVideoId(latest.link);

  if (!videoId) {
    throw new Error("Could not parse latest video id.");
  }

  return {
    id: videoId,
    link: latest.link,
    published: latest.pubDate,
    thumbnail: latest.thumbnail ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    title: latest.title,
  };
}

function App() {
  const [latestVideo, setLatestVideo] = useState<LatestVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLatestVideo() {
      try {
        const video = await fetchLatestVideo(siteConfig.youtubeChannelId);
        if (active) {
          setLatestVideo(video);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadLatestVideo();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="relative isolate min-h-[100dvh] overflow-x-clip px-3 py-5 sm:px-8 sm:py-10 [padding-top:calc(1rem+env(safe-area-inset-top))] [padding-bottom:calc(1rem+env(safe-area-inset-bottom))]">
      <div className="pointer-events-none absolute -left-24 top-0 h-60 w-60 rounded-full bg-emerald-400/25 blur-3xl sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-lime-400/20 blur-3xl sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute inset-0 opacity-15 sm:opacity-20 [background:repeating-linear-gradient(0deg,rgba(74,222,128,0.12)_0px,rgba(74,222,128,0.12)_1px,transparent_1px,transparent_3px)]" />
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-5xl items-start justify-center sm:min-h-[calc(100dvh-5rem)] sm:items-center">
        <section className="glass-panel w-full rounded-2xl p-4 sm:rounded-3xl sm:p-10">
          <header className="enter-up text-center sm:text-left">
            <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/85 sm:text-xs sm:tracking-[0.4em]">
              Sosyal Medya Linkleri
            </p>
            <h1 className="title-font neon-text mt-3 text-2xl leading-tight text-emerald-200 sm:mt-2 sm:text-5xl sm:leading-none lg:text-7xl">
              {siteConfig.creatorName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-50/85 sm:mt-4 sm:text-lg">
              {siteConfig.tagline}
            </p>
          </header>

          <section className="mt-7 space-y-5 sm:mt-8 sm:space-y-6">
            {socialGroupOrder.map((group, index) => {
              const cards = socialCards.filter((card) => card.group === group);
              if (cards.length === 0) return null;

              return (
                <div key={group} className={`enter-up delay-${Math.min(index + 1, 5)}`}>
                  <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300/90 sm:mb-3 sm:text-xs sm:tracking-[0.24em]">
                    {group}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {cards.map((card) => (
                      <a
                        key={card.key}
                        href={card.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative overflow-hidden rounded-xl border border-emerald-300/20 bg-emerald-200/[0.03] p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-emerald-100/[0.06] hover:shadow-[0_14px_30px_rgba(5,46,22,0.65)] sm:rounded-2xl sm:p-4"
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition duration-300 group-hover:opacity-100 ${card.gradientClass}`}
                        />
                        <div className="relative flex items-center gap-3">
                          <span
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/25 bg-black/70 text-xs font-bold tracking-wider text-white ring-2 ring-transparent transition ${card.ringClass}`}
                          >
                            <img
                              src={card.iconSrc}
                              alt={`${card.label} logo`}
                              className="h-5 w-5 object-contain"
                              loading="lazy"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[15px] font-semibold text-white sm:text-base">
                              {card.label}
                            </p>
                            <p className="truncate text-sm text-emerald-100/75">
                              {card.handle}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="mt-8 enter-up delay-5 sm:mt-10">
            <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="title-font neon-text text-xl leading-tight text-emerald-200 sm:text-4xl">
                Son Video
              </h2>
              <a
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-300/12 sm:w-auto sm:py-2 sm:tracking-[0.2em]"
              >
                Kanala Git
              </a>
            </div>

            {isLoading && (
              <div className="rounded-xl border border-emerald-300/20 bg-black/45 p-4 text-sm text-emerald-100/80 sm:rounded-2xl sm:p-6">
                Son video yukleniyor...
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-300/30 bg-rose-950/30 p-4 text-sm text-rose-100 sm:rounded-2xl sm:p-6">
                {error}
              </div>
            )}

            {latestVideo && (
              <article className="overflow-hidden rounded-xl border border-emerald-300/25 bg-black/60 sm:rounded-2xl">
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${latestVideo.id}`}
                    title={latestVideo.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="space-y-2 p-4 sm:p-5">
                  <h3 className="line-clamp-2 text-base font-semibold text-emerald-50 sm:text-lg">
                    {latestVideo.title}
                  </h3>
                  <p className="text-sm text-emerald-100/75">
                    {new Date(latestVideo.published).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <a
                    href={latestVideo.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm font-medium text-emerald-300 transition hover:text-lime-200"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </article>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
