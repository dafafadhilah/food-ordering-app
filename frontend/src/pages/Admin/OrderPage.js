import { useEffect, useState } from "react";
import {
  Card,
  Select,
  Typography,
  Table,
  DatePicker,
  Form,
  Button,
  Row,
  Col,
  List,
  Space,
  Tag,
} from "antd";
import dayjs from "dayjs";
import api from "../../services/api";
import CommonTable from "../../components/CommonTable";

const { Title } = Typography;

function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedMenuNotes, setSelectedMenuNotes] = useState([]);
  const [selectedMenuName, setSelectedMenuName] = useState("");
  const { Text } = Typography;

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    const res = await api.get("/admin/restaurants");
    setRestaurants(res.data.sort((a, b) => a.id - b.id));
  };

  const onFinish = async (values) => {
    setLoading(true);

    const date = values.date.format("YYYY-MM-DD");

    try {
      const res = await api.get(
        `/admin/orders?date=${date}&restaurant_id=${values.restaurant}`,
      );
      setOrders(res.data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // 🔥 REKAP
  const getSummary = () => {
    const summary = {};

    orders.forEach((o) => {
      (o.order_items || []).forEach((item) => {
        const name = item.menus?.name || "Unknown";
        summary[name] = (summary[name] || 0) + item.qty;
      });
    });

    return Object.keys(summary).map((key) => ({
      menu: key,
      total: summary[key],
    }));
  };

  const summaryData = getSummary();

  const summaryColumns = [
    {
      title: "Menu",
      dataIndex: "menu",
      width: "80%",
      render: (_, record) => {
        // ambil semua notes untuk menu ini
        const notes = orders
          .flatMap((o) => o.order_items || [])
          .filter((i) => i.menus?.name === record.menu && i.note)
          .map((i) => i.note);

        return (
          <div>
            <div>{record.menu}</div>
            {notes.length > 0 &&
              notes.map((note, idx) => (
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: 12, marginTop: 2 }}
                  key={idx}
                >
                  {note}
                </Text>
              ))}
          </div>
        );
      },
    },
    { title: "Total Qty", dataIndex: "total", width: "20%" },
  ];

  const orderColumns = [
    { title: "Order ID", dataIndex: "id", width: "10%" },
    {
      title: "Customer",
      dataIndex: "customer",
      width: "20%",
      render: (_, record) => `${record.customer_name} (${record.department})`,
    },
    {
      title: "Pesanan",
      dataIndex: "pesanan",
      width: "50%",
      render: (_, record) => (
        <div>
          {(record.order_items || []).map((i) => (
            <div key={i.id} style={{ marginBottom: 4 }}>
              <div>
                {i.menus?.name} x {i.qty}
              </div>
              {i.note && (
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    fontSize: 12,
                    marginTop: 2,
                    marginLeft: 4, // sedikit indent agar seperti sub-item
                  }}
                >
                  {i.note}
                </Text>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "total_price",
      width: "10%",
      render: (val) => `Rp ${val}`,
    },
    {
      title: "Status",
      dataIndex: "payment_status",
      width: "10%",
      render: (val, record) => (
        <Space>
          <Tag color={val === "DONE" ? "green" : "orange"}>{val}</Tag>

          {val !== "DONE" && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleMarkDone(record.id)}
              loading={loadingId === record.id}
            >
              Done
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleMarkDone = async (id) => {
    setLoadingId(id);
    try {
      await api.put(`/admin/orders/${id}/status`, {
        payment_status: "DONE",
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, payment_status: "DONE" } : o)),
      );
    } finally {
      setLoadingId(null);
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (a.payment_status === "DONE" && b.payment_status !== "DONE") return 1;
    if (a.payment_status !== "DONE" && b.payment_status === "DONE") return -1;
    return 0;
  });

  return (
    <div>
      <Card style={{ marginBottom: "20px" }}>
        <Title level={3}>Admin Orders</Title>
      </Card>
      {/* 🔥 FORM FILTER */}
      <Card style={{ marginBottom: 20 }}>
        <Form
          layout="horizontal"
          onFinish={onFinish}
          labelCol={{ span: 4 }} // label lebih kecil
          wrapperCol={{ span: 20 }} // input lebih lebar
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Restoran"
                name="restaurant"
                rules={[{ required: true, message: "Pilih restoran!" }]}
              >
                <Select
                  placeholder="Pilih Restoran"
                  options={restaurants.map((r) => ({
                    value: r.id,
                    label: r.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tanggal"
                name="date"
                rules={[{ required: true, message: "Pilih tanggal!" }]}
                initialValue={dayjs().add(1, "day")}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col
              xs={24}
              md={12}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Button type="primary" htmlType="submit" loading={loading}>
                Tampilkan Data
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 🔥 DATA MUNCUL SETELAH SUBMIT */}
      {orders.length > 0 && (
        <>
          <Card style={{ marginBottom: 20 }}>
            <Title level={4}>Rekap Menu</Title>

            <CommonTable
              columns={summaryColumns}
              dataSource={summaryData}
              rowKey="menu"
              searchFields={["menu"]}
              placeholder="Cari menu..."
              pagination={false}
            />
          </Card>

          <Card>
            <Title level={4}>Detail Orders</Title>

            <CommonTable
              columns={orderColumns}
              dataSource={sortedOrders}
              searchFields={["customer_name", "department"]}
              placeholder="Cari customer..."
              pagination={false}
              rowClassName={(record) =>
                record.payment_status === "DONE" ? "row-done" : ""
              }
            />
          </Card>
        </>
      )}
    </div>
  );
}

export default AdminOrderPage;
