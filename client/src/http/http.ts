import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const defaultConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

interface AxiosRetryError extends AxiosError {
  config: AxiosRequestConfig & {__isRetry?: boolean};
}

type OnError = (axiosInstance: AxiosInstance) => (error: AxiosRetryError) => any;

export abstract class Http {
  public baseURL: string;
  protected axiosInstance: AxiosInstance;
  protected onErrorId?: number;

  protected static instances: {[key: string]: Http} = {};
  protected static token: string | undefined;
  protected static onError: OnError | undefined;

  constructor(overwriteConfig: AxiosRequestConfig = {}) {
    const config: AxiosRequestConfig = Object.assign({}, defaultConfig, overwriteConfig);
    this.baseURL = config.baseURL as string;
    this.axiosInstance = axios.create(config);

    if (!Http.instances[config.baseURL!]) {
      if (Http.token) {
        this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${Http.token}`;
      }
      if (Http.onError && this.onErrorId === undefined) {
        this.onErrorId = this.axiosInstance.interceptors.response.use(config => config, Http.onError);
      }
      Http.instances[config.baseURL!] = this;
    }
  }

  static setToken(token: string) {
    Http.token = token;
    Object.keys(Http.instances).forEach(key => {
      Http.instances[key].axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    });
  }

  static unsetToken() {
    Http.token = undefined;
    Object.keys(Http.instances).forEach(key => {
      delete Http.instances[key].axiosInstance.defaults.headers.common.Authorization;
    });
  }

  static setOnError(onError: OnError) {
    Http.onError = onError;
    Object.keys(Http.instances).forEach(key => {
      if (Http.instances[key].onErrorId === undefined) {
        const errorHandler = onError(Http.instances[key].axiosInstance);
        Http.instances[key].onErrorId =
          Http.instances[key].axiosInstance.interceptors.response.use(config => config, errorHandler);
      }
    });
  }

  get<T = null>(path: string) {
    return this.client.get<T>(path);
  }

  post<T = null>(path: string, payload: any = undefined) {
    return this.client.post<T>(path, payload);
  }

  patch<T = null>(path: string, payload: any = undefined) {
    return this.client.patch<T>(path, payload);
  }

  put<T = null>(path: string, payload: any = undefined) {
    return this.client.put<T>(path, payload);
  }

  delete(path: string) {
    return this.client.delete(path);
  }

  setToken(token: string) {
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  unsetToken() {
    delete this.client.defaults.headers.common.Authorization;
  }

  get client(): AxiosInstance {
    return Http.instances[this.baseURL].axiosInstance;
  }
}
