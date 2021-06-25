import React, { useState } from 'react';
import { Button, Divider, Tabs, List, Typography } from 'antd';
import { observer } from 'mobx-react-lite';

import { LoginForm, RegisterForm } from 'src/components';
import { useStore } from 'src/store';
import { User } from 'src/models';
import { userHttp } from 'src/http';

export const MainWidget: React.FC = observer(() => {
  const store = useStore();
  const [users, setUsers] = useState<User[]>([]);

  const logout = () => store.logout();
  const loadUsers = async () => {
    const fetchedUsers = await userHttp.fetchUsers();
    setUsers(fetchedUsers);
  };

  if (store.isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h1>{store.isAuth ? `Авторизован ${store.user?.email}` : 'Авторизуйтесь!'}</h1>
      {store.isAuth ? (
        <>
          <Button onClick={logout}>Выйти</Button>
          <Button onClick={loadUsers}>Подгрузить пользователей</Button>

          {users && users.length > 0 && (
            <>
              <Divider>Участники</Divider>
              <List
                header={<div>Header</div>}
                footer={<div>Footer</div>}
                bordered
                dataSource={users}
                rowKey={user => user.id}
                renderItem={user => (
                  <List.Item>
                    <Typography.Text mark>[{user.id}]</Typography.Text> {user.email}
                  </List.Item>
                )}
              />
            </>
          )}
        </>
      ) : (
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Login" key="1">
            <LoginForm />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Register" key="2">
            <RegisterForm />
          </Tabs.TabPane>
        </Tabs>
      )}

    </div>
  );
});
