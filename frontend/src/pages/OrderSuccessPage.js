import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Divider, List, Button, Grid, Image } from "antd";
import api from "../services/api";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function OrderSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrderData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!orderData) return <div style={{ padding: 20 }}>Loading...</div>;

  const { order, items, restaurant } = orderData;

  const handleDownload = async () => {
    const response = await fetch(restaurant.qris_image);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "qris.png"; // bebas nama file
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        padding: screens.xs ? "16px" : "40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 12,
        }}
      >
        <Title level={screens.xs ? 4 : 2} style={{ textAlign: "center" }}>
          Pesanan Berhasil 🎉
        </Title>

        <Divider />

        <Text>
          <b>Order ID:</b> #{order.id}
        </Text>
        <br />
        <Text>
          <b>Nama:</b> {order.customer_name}
        </Text>
        <br />
        <Text>
          <b>Departemen:</b> {order.department}
        </Text>
        <br />
        <Text>
          <b>Tanggal PO:</b>{" "}
          {restaurant.po_dates
            ? new Date(restaurant.po_dates).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Tanggal tidak tersedia"}
        </Text>

        <Divider />

        <Title level={5}>Pesanan</Title>

        <List
          dataSource={items}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: "100%" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text
                    style={{
                      width: "70%",
                    }}
                  >
                    {item.menus.name}
                  </Text>
                  <Text style={{ width: "30%", textAlign: "right" }}>
                    x{item.qty}
                  </Text>
                </div>
                {item.note && (
                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      fontSize: 12,
                      marginTop: 2,
                      marginLeft: 4,
                    }}
                  >
                    {item.note}
                  </Text>
                )}
              </div>
            </List.Item>
          )}
        />

        <Divider />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text strong>Total</Text>
          <Text strong>Rp {order.total_price.toLocaleString()}</Text>
        </div>

        <Divider />

        <Title level={5}>Pembayaran</Title>

        <Text type="secondary">
          Pembayaran dapat dilakukan QRIS dengan scan atau download dibawah atau
          CASH saat mengambil makanan
        </Text>

        <Divider />

        {/* QRIS */}
        <Title level={5}>QRIS</Title>

        <div style={{ textAlign: "center" }}>
          <Image
            src={restaurant.qris_image}
            alt="QRIS"
            style={{
              maxWidth: "100%",
              borderRadius: 8,
            }}
          />

          <br />
          <br />

          <Button type="primary" onClick={handleDownload}>
            Download QRIS
          </Button>

          <Divider />

          <Button type="primary" onClick={() => navigate("/")}>
            Kembali
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default OrderSuccessPage;
