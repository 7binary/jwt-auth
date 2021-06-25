import { Http } from 'src/http';
import { User } from 'src/models';

class UserHttp extends Http {

  async fetchUsers() {
    const res = await this.get<{users: User[]}>('api/users');
    return res.data.users;
  }
}

export const userHttp = new UserHttp();
