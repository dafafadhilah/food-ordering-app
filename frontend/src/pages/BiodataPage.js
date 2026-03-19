import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Grid } from "antd";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function BiodataPage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const onFinish = (values) => {
    localStorage.setItem("customer", JSON.stringify(values));
    navigate("/restaurants");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: screens.xs ? "flex-start" : "center", // HP top, desktop tengah
        alignItems: "stretch", // card ikut lebar container
        padding: screens.xs ? "10px" : "40px",
        background: "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: screens.xs ? "100%" : 400, // HP full-width, desktop tetap 400px
          margin: screens.xs ? "0" : "0 auto", // desktop di tengah
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          padding: screens.xs ? "20px 12px" : "24px", // padding lebih kecil di HP
        }}
      >
        <Title level={screens.xs ? 4 : 3} style={{ textAlign: "center" }}>
          Isi Biodata
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Nama"
            name="name"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input placeholder="Masukkan nama" />
          </Form.Item>

          <Form.Item
            label="No WhatsApp"
            name="phone"
            rules={[
              { required: true, message: "No WA wajib diisi" },
              { pattern: /^[0-9]+$/, message: "Hanya boleh angka" },
            ]}
          >
            <Input
              placeholder="08xxxx"
              maxLength={15}
              inputMode="numeric"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
            />
          </Form.Item>

          <Form.Item
            label="Divisi / Departemen"
            name="division"
            rules={[{ required: true, message: "Divisi wajib diisi" }]}
          >
            <Input placeholder="IT / Finance / dll" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Lanjut Pilih Restoran
            </Button>
          </Form.Item>
        </Form>

        <Text
          type="secondary"
          style={{
            display: "block",
            fontSize: 14,
            marginLeft: 2,
            textAlign: "center",
          }}
        >
          Powered by : Dafa Fadhilah
        </Text>
      </Card>
    </div>
  );
}

export default BiodataPage;
