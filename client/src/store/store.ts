import { makeAutoObservable } from 'mobx';

import { User } from 'src/models';
import { authHttp, AuthParams, Http } from 'src/http';

export class Store {
  static tokenKey = 'jwToken';

  user: User | null = null;
  isAuth = false;
  isLoading = false;

  async authenticateUser(token: string, user: User) {
    localStorage.setItem(Store.tokenKey, token);
    this.setAuth(true);
    this.setUser(user);
    Http.setToken(token);
  }

  setAuth(isAuth: boolean) {
    this.isAuth = isAuth;
  }

  setUser(user: User | null) {
    this.user = user;
  }

  setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  async login(params: AuthParams) {
    const { accessToken, user } = await authHttp.login(params);
    await this.authenticateUser(accessToken, user);
  }

  async register(params: AuthParams) {
    const { accessToken, user } = await authHttp.registration(params);
    await this.authenticateUser(accessToken, user);
  }

  async checkAuth() {
    const token = localStorage.getItem(Store.tokenKey);
    if (!token) {
      return false;
    }

    Http.setToken(token);
    Http.setOnError(axiosInstance => async (error) => {
      if (error.config && error.response?.status === 401 && !error.config.__isRetry) {
        error.config.__isRetry = true;
        const { accessToken, user } = await authHttp.refresh();
        await this.authenticateUser(accessToken, user);
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance.request(error.config);
      }
      throw error;
    });
    this.setLoading(true);

    try {
      const { accessToken, user } = await authHttp.refresh();
      await this.authenticateUser(accessToken, user);
    } finally {
      this.setLoading(false);
    }
    return true;
  }

  async logout() {
    await authHttp.logout();
    localStorage.removeItem(Store.tokenKey);
    this.setAuth(false);
    this.setUser(null);
    Http.unsetToken();
  }

  constructor() {
    makeAutoObservable(this);
  }
}
