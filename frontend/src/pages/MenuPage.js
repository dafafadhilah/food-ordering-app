import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Row, Col, Typography, Button, Grid, Input, Table } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import api from "../services/api";
import { showModalNotif } from "../components/ModalNotif";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function MenuPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const screens = useBreakpoint();

  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [paramModal, setParamModal] = useState([]);

  const formatTanggal = (date) => {
    const d = dayjs(date).format("dddd, DD MMMM YYYY");
    return d.charAt(0).toUpperCase() + d.slice(1);
  };

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("customer"));

    if (!customer) {
      navigate("/");
      return;
    }

    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await api.get(`/menus/${id}`);
      setMenus(res.data.menus);
      setRestaurant(res.data.restaurant);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (menu) => {
    const existing = cart.find((item) => item.id === menu.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === menu.id ? { ...item, qty: item.qty + 1 } : item,
        ),
      );
    } else {
      setCart([...cart, { ...menu, qty: 1 }]);
    }
  };

  const removeFromCart = (menu) => {
    const existing = cart.find((item) => item.id === menu.id);

    if (!existing) return;

    if (existing.qty === 1) {
      setCart(cart.filter((item) => item.id !== menu.id));
    } else {
      setCart(
        cart.map((item) =>
          item.id === menu.id ? { ...item, qty: item.qty - 1 } : item,
        ),
      );
    }
  };

  const getQty = (id) => {
    const item = cart.find((c) => c.id === id);
    return item ? item.qty : 0;
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const confirmCheckout = () => {
    const message = (
      <div>
        <div style={{ marginBottom: 8 }}>
          Apakah anda yakin ingin menyimpan pesanan berikut:
        </div>

        {restaurant?.po_dates && (
          <div
            style={{
              marginBottom: 12,
              padding: "8px 12px",
              background: "#fff7e6",
              border: "1px solid #ffd591",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            📅 Pesanan akan tersedia pada:{" "}
            <b>{formatTanggal(restaurant.po_dates)}</b>
          </div>
        )}

        <Table
          dataSource={cart.map((item, idx) => ({ ...item, key: idx }))}
          pagination={false}
          size="small"
          style={{ width: "100%", border: "none", marginTop: "10px" }}
          columns={[
            {
              title: "Menu",
              dataIndex: "name",
              render: (text) => <Text strong>{text}</Text>,
              width: "50%",
            },
            {
              title: "Note",
              dataIndex: "note",
              render: (text) => (text ? <Text>{text}</Text> : "-"),
              width: "40%",
            },
            {
              title: "Qty",
              dataIndex: "qty",
              width: "10%",
            },
          ]}
        />
      </div>
    );

    showModalNotif({
      type: "confirm",
      title: "Konfirmasi Checkout",
      message,
      onOk: () => checkout(),
    });
  };

  const checkout = async () => {
    const customer = JSON.parse(localStorage.getItem("customer"));

    const order_date = restaurant?.po_dates;

    const res = await api.post("/orders", {
      customer,
      cart,
      restaurant_id: id,
      total,
      order_date,
    });

    const orderId = res.data.order_id;

    navigate(`/order-success/${orderId}`);
    localStorage.removeItem("customer");
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div style={{ padding: screens.xs ? "16px" : "40px" }}>
        <Card style={{ marginBottom: "20px", padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Title level={screens.xs ? 4 : 2}>Menu Restoran</Title>
            <Button
              type="primary"
              onClick={() => navigate("/restaurants")} // kembali ke halaman sebelumnya
            >
              Kembali
            </Button>
          </div>
          <Text
            type="secondary"
            style={{ display: "block", fontSize: 14, marginLeft: 2 }}
          >
            Silahkan dipilih menu yang ingin dipesan dan klik pesan sekarang.
          </Text>
        </Card>

        <Card style={{ marginBottom: "20px" }}>
          <Row gutter={[12, 12]}>
            {menus.map((m) => {
              const qty = getQty(m.id);

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={m.id}>
                  <Card
                    hoverable={m.is_active}
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      cursor: m.is_active ? "pointer" : "not-allowed",
                      opacity: m.is_active ? 1 : 0.5, // terlihat disabled
                      position: "relative",
                    }}
                    cover={
                      <img
                        src={m.image}
                        alt={m.name}
                        style={{
                          height: screens.xs ? 140 : 160,
                          objectFit: "cover",
                        }}
                      />
                    }
                  >
                    <Title level={5}>{m.name}</Title>
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        fontSize: 14,
                        marginBottom: "5px",
                      }}
                    >
                      {m.description}
                    </Text>
                    <Text>Rp {m.price}</Text>

                    <div style={{ marginTop: 10 }}>
                      {qty === 0 ? (
                        <Button
                          type="primary"
                          block
                          disabled={!m.is_active}
                          onClick={() => m.is_active && addToCart(m)}
                        >
                          + Tambah
                        </Button>
                      ) : (
                        <div style={{ marginTop: 10 }}>
                          <Input.TextArea
                            placeholder="Tambahkan catatan..."
                            value={cart.find((c) => c.id === m.id)?.note || ""}
                            onChange={(e) =>
                              setCart(
                                cart.map((c) =>
                                  c.id === m.id
                                    ? { ...c, note: e.target.value }
                                    : c,
                                ),
                              )
                            }
                            rows={2}
                            style={{ marginBottom: 8 }}
                          />

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Button
                              icon={<MinusOutlined />}
                              onClick={() => removeFromCart(m)}
                            />
                            <span>{qty}</span>
                            <Button
                              icon={<PlusOutlined />}
                              onClick={() => addToCart(m)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>

        {/* 🔥 FLOATING CART */}
        {cart.length > 0 && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              background: "#fff",
              borderTop: "1px solid #eee",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
              zIndex: 1000,
            }}
          >
            <div style={{ marginLeft: "30px" }}>
              <div style={{ fontSize: 12, color: "#888" }}>
                {cart.length} item
              </div>
              <div style={{ fontWeight: "bold" }}>
                Rp {total.toLocaleString()}
              </div>
            </div>

            <div style={{ marginRight: "30px" }}>
              <Button type="primary" size="large" onClick={confirmCheckout}>
                Pesan Sekarang
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPage;
