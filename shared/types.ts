export interface ExternalListing { name: string; url: string; language: string; reportedEpisodes: number; externalOnly?: boolean; episodePages?: Record<string,string>; }
export interface Movie {
  id: string; title: string; year: number; description: string;
  genre: string; artwork: string; duration: string; credit: string; watchUrl?: string; aliases?: string[]; externalListings?: ExternalListing[];
}
export interface Episode { id: string; title: string; }
export interface VideoSource {
  id: string; provider: string; label: string; type: 'hls' | 'mp4' | 'embed'; url: string;
}
export interface MovieDetail extends Movie { episodes: Episode[]; }
export interface SearchResult { movies: Movie[]; unavailableProviders: string[]; }
