import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import api from "../../services/api";

const { Title } = Typography;

function AdminLoginPage() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await api.post("/admin/login", values);

      // simpan token
      localStorage.setItem("admin_token", res.data.token);

      message.success("Login berhasil 🚀");

      navigate("/admin/dashboard");
    } catch (err) {
      message.error("Username / Password salah");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        background: "linear-gradient(135deg, #1677ff, #69c0ff)",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          Admin Login 🔐
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Username wajib diisi" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Masukkan username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password wajib diisi" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Masukkan password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default AdminLoginPage;
