import React, { useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { observer } from 'mobx-react-lite';

import { MainWidget } from 'src/components';
import { useStore } from 'src/store';
import './App.css';

const { Header, Content, Footer } = Layout;

export const App: React.FC = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.checkAuth();
  }, [store]);

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
          {new Array(5).fill(null).map((_, index) => {
            const key = index + 1;
            return <Menu.Item key={key}>{`nav ${key}`}</Menu.Item>;
          })}
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <MainWidget />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>jwt-auth @ 2021</Footer>
    </Layout>
  );
});
