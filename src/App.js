import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Tasks from './pages/Tasks';
import Weapons from './pages/Weapons';

const { Sider, Content } = Layout;

const App = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['/']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="/tasks">
              <Link to="/tasks">Tasks</Link>
            </Menu.Item>
            <Menu.Item key="/weapons">
              <Link to="/weapons">Weapons</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        {/* Main content area */}
        <Layout>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            <Routes>
              <Route path="/tasks" element={<Tasks />} />
            </Routes>
            <Routes>
              <Route path="/weapons" element={<Weapons />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;