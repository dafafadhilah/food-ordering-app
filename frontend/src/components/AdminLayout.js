import { Layout, Menu, Button } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider, Content, Header } = Layout;

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: "#001529" }}
      >
        <div style={{ color: "white", padding: 16, fontWeight: "bold" }}>
          Admin Panel
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: "/admin/dashboard",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "/admin/restaurants",
              icon: <ShopOutlined />,
              label: "Restoran",
            },
            {
              key: "/admin/menus",
              icon: <UnorderedListOutlined />,
              label: "Menu",
            },
            {
              key: "/admin/orders",
              icon: <OrderedListOutlined />,
              label: "Order",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: 20,
          }}
        >
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Header>

        <Content style={{ margin: "16px" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
