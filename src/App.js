import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Tasks from './pages/Tasks';
import Weapons from './pages/Weapons';
import Rings from './pages/Rings';
import Items from './pages/Items';
import Equipments from './pages/Equipment';

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
            <Menu.Item key="/rings">
              <Link to="/rings">Rings</Link>
            </Menu.Item>            
            <Menu.Item key="/equipments">
              <Link to="/equipments">Equipments</Link>
            </Menu.Item>
            <Menu.Item key="/item">
              <Link to="/items">Items</Link>
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
            <Routes>
              <Route path="/rings" element={<Rings />} />
            </Routes>
            <Routes>
              <Route path="/items" element={<Items />} />
            </Routes>
            <Routes>
              <Route path="/equipments" element={<Equipments />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;