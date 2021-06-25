import { makeAutoObservable } from 'mobx';

import { User } from 'src/models';
import { authHttp, AuthParams, Http } from 'src/http';

export class Store {
  static tokenKey = 'jwt';

  user: User | null = null;
  isAuth = false;
  isLoading = false;

  authenticateUser(token: string, user: User) {
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
    this.authenticateUser(accessToken, user);
  }

  async bootstrapAuth() {
    const token = localStorage.getItem(Store.tokenKey);
    token ? Http.setToken(token) : Http.unsetToken();

    Http.setOnError(axiosInstance => async (error) => {
      if (error.config && error.response?.status === 401 && !error.config.__isRetry) {
        error.config.__isRetry = true;
        try {
          const { accessToken, user } = await authHttp.refresh();
          this.authenticateUser(accessToken, user);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance.request(error.config);
        } catch (refreshError) {
          if (refreshError.response?.status === 401) {
            await this.logout();
          } else {
            console.error(refreshError);
          }
        }
      }
      throw error;
    });

    if (token) {
      this.setLoading(true);
      try {
        const { accessToken, user } = await authHttp.refresh();
        this.authenticateUser(accessToken, user);
      } finally {
        this.setLoading(false);
      }
    }
  }

  async logout() {
    try {
      await authHttp.logout();
    } finally {
      Http.unsetToken();
      localStorage.removeItem(Store.tokenKey);
      this.setAuth(false);
      this.setUser(null);
    }
  }

  constructor() {
    makeAutoObservable(this);
  }
}
