import axios from 'axios';

import { Http } from 'src/http';
import { User } from 'src/models';

export interface AuthParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

class AuthHttp extends Http {

  async login(params: AuthParams) {
    const res = await this.post<AuthResponse>('api/login', params);
    return res.data;
  }

  async registration(params: AuthParams) {
    const res = await this.post<AuthResponse>('api/registration', params);
    return res.data;
  }

  async logout() {
    return await this.get('/api/logout');
  }

  async refresh() {
    const res = await axios.get<AuthResponse>(`${process.env.REACT_APP_API_URL}/api/refresh`, { withCredentials: true });
    return res.data;
  }
}

export const authHttp = new AuthHttp();
