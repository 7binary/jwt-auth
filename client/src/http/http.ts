import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

interface AxiosRetryError extends AxiosError {
  config: AxiosRequestConfig & {__isRetry?: boolean};
}

type OnError = (axiosInstance: AxiosInstance) => (error: AxiosRetryError) => any;

const defaultConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

export abstract class Http {
  public baseURL: string;
  protected axiosInstance: AxiosInstance;
  protected onErrorId: number | null = null;

  protected static instances: {[key: string]: Http} = {};
  protected static token: string | null = null;
  protected static onError?: OnError;

  constructor(overrideConfig: AxiosRequestConfig = {}) {
    const config: AxiosRequestConfig = Object.assign({}, defaultConfig, overrideConfig);
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
    Http.token = null;
    Object.keys(Http.instances).forEach(key => {
      delete Http.instances[key].axiosInstance.defaults.headers.common.Authorization;
    });
  }

  static setOnError(onError: OnError) {
    Http.onError = onError;
    Object.keys(Http.instances).forEach(key => {
      const http = Http.instances[key];
      if (http.onErrorId !== null) {
        http.axiosInstance.interceptors.response.eject(http.onErrorId);
      }
      const errorHandler = onError(http.axiosInstance);
      http.onErrorId = http.axiosInstance.interceptors.response.use(config => config, errorHandler);
    });
  }

  static unsetOnError() {
    Http.onError = undefined;
    Object.keys(Http.instances).forEach(key => {
      const http = Http.instances[key];
      if (http.onErrorId !== null) {
        http.axiosInstance.interceptors.response.eject(http.onErrorId);
        http.onErrorId = null;
      }
    });
  }

  setOnError(onError: OnError) {
    if (this.onErrorId !== null) {
      this.axiosInstance.interceptors.response.eject(this.onErrorId);
    }
    const errorHandler = onError(this.axiosInstance);
    this.onErrorId = this.axiosInstance.interceptors.response.use(config => config, errorHandler);
  }

  unsetOnError() {
    if (this.onErrorId !== null) {
      this.axiosInstance.interceptors.response.eject(this.onErrorId);
      this.onErrorId = null;
    }
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

// SOMEWERE AT APP BOOTSTRAP
// const token = localStorage.getItem('jwt');
// token ? Http.setToken(token) : Http.unsetToken();
// Http.setOnError(axiosInstance => async (error) => {
//   if (error.config && error.response?.status === 401 && !error.config.__isRetry) {
//     error.config.__isRetry = true;
//     try {
//       const { accessToken } = await authHttp.refresh();
//       localStorage.setItem('jwt', accessToken);
//       Http.setToken(accessToken);
//       error.config.headers.Authorization = `Bearer ${accessToken}`;
//       return axiosInstance.request(error.config);
//     } catch (refreshError) {
//        if (refreshError.response?.status === 401) {
//          Http.unsetToken();
//          localStorage.deleteItem('jwt');
//        } else {
//          console.error(refreshError);
//        }
//      }
//   }
//   throw error;
// });
