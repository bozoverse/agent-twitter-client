import { bearerToken, bearerToken2, RequestApiResult } from './api';
import { TwitterGuestAuth } from './auth';
import { getProfile, getUserIdByScreenName, Profile } from './profile';
import {
  fetchSearchTweets,
  SearchMode,
  searchProfiles,
  searchTweets,
} from './search';
import { QueryTweetsResponse } from './timeline';
import { getTrends } from './trends';
import { getTweet, getTweets, Tweet } from './tweets';

export class Scraper {
  private auth: TwitterGuestAuth;
  private authTrends: TwitterGuestAuth;

  constructor() {
    this.auth = new TwitterGuestAuth(bearerToken);
    this.authTrends = new TwitterGuestAuth(bearerToken2);
  }

  public async getProfile(username: string): Promise<Profile> {
    const res = await getProfile(username, this.auth);
    return this.handleResponse(res);
  }

  public async getUserIdByScreenName(screenName: string): Promise<string> {
    const res = await getUserIdByScreenName(screenName, this.auth);
    return this.handleResponse(res);
  }

  public searchTweets(
    query: string,
    maxTweets: number,
    includeReplies: boolean,
    searchMode: SearchMode,
  ): AsyncGenerator<Tweet> {
    return searchTweets(
      query,
      maxTweets,
      includeReplies,
      searchMode,
      this.auth,
    );
  }

  public searchProfiles(
    query: string,
    maxProfiles: number,
    includeReplies: boolean,
  ): AsyncGenerator<Profile> {
    return searchProfiles(
      query,
      maxProfiles,
      includeReplies,
      SearchMode.Users,
      this.auth,
    );
  }

  public fetchSearchTweets(
    query: string,
    maxTweets: number,
    includeReplies: boolean,
    searchMode: SearchMode,
    cursor?: string,
  ): Promise<QueryTweetsResponse> {
    return fetchSearchTweets(
      query,
      maxTweets,
      includeReplies,
      searchMode,
      this.auth,
      cursor,
    );
  }

  public getTrends(includeReplies: boolean): Promise<string[]> {
    return getTrends(includeReplies, this.authTrends);
  }

  public getTweets(
    user: string,
    maxTweets: number,
    includeReplies: boolean,
  ): AsyncGenerator<Tweet> {
    return getTweets(user, maxTweets, includeReplies, this.auth);
  }

  public getTweet(id: string, includeReplies: boolean): Promise<Tweet | null> {
    return getTweet(id, includeReplies, this.auth);
  }

  public hasGuestToken(): boolean {
    return this.auth.hasToken() || this.authTrends.hasToken();
  }

  public withCookie(cookie: string): Scraper {
    this.auth.useCookie(cookie);
    this.authTrends.useCookie(cookie);
    return this;
  }

  public withXCsrfToken(token: string): Scraper {
    this.auth.useCsrfToken(token);
    this.authTrends.useCsrfToken(token);
    return this;
  }

  private handleResponse<T>(res: RequestApiResult<T>): T {
    if (!res.success) {
      throw res.err;
    }

    return res.value;
  }
}
