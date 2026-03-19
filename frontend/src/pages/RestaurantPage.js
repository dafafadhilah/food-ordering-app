import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Typography, Grid, Button, Spin } from "antd";
import api from "../services/api";
import { SmileOutlined } from "@ant-design/icons";
import SpinComponent from "../components/SpinComponent";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function RestaurantPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [paramLoading, setParamLoading] = useState({});
  const screens = useBreakpoint();

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("customer"));

    if (!customer) {
      navigate("/");
      return;
    }

    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setParamLoading((prev) => ({ ...prev, loadingRestoran: true }));
      const res = await api.get("/restaurants");
      const data = res.data.sort((a, b) => a.id - b.id);
      setRestaurants(data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    } finally {
      setParamLoading((prev) => ({ ...prev, loadingRestoran: false }));
    }
  };

  return (
    <div
      style={{
        padding: screens.xs ? "16px 12px" : "40px",
      }}
    >
      <Card style={{ marginBottom: "20px", padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Title level={screens.xs ? 4 : 2} style={{ margin: 0 }}>
            Pilih Restoran
          </Title>

          <Button
            type="primary"
            onClick={() => navigate("/")} // kembali ke halaman sebelumnya
          >
            Kembali
          </Button>
        </div>
        <Text
          type="secondary"
          style={{ display: "block", fontSize: 14, marginLeft: 2 }}
        >
          Jika disabled maka toko sedang tutup atau close order. Terimakasih
          <SmileOutlined style={{ marginLeft: "5px" }} />
        </Text>
      </Card>

      <Card>
        <Row gutter={[12, 12]}>
          {paramLoading.loadingRestoran ? (
            <SpinComponent loading={paramLoading.loadingRestoran} />
          ) : (
            restaurants.map((r) => (
              <Col xs={24} sm={12} md={8} lg={6} key={r.id}>
                <Card
                  hoverable={r.is_active} // hanya hoverable kalau aktif
                  onClick={() =>
                    r.is_active && navigate(`/restaurants/${r.id}`)
                  }
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    cursor: r.is_active ? "pointer" : "not-allowed",
                    opacity: r.is_active ? 1 : 0.5, // terlihat disabled
                    position: "relative",
                  }}
                  cover={
                    r.logo_image ? (
                      <img
                        alt={r.name}
                        src={r.logo_image}
                        style={{
                          width: "100%",
                          height: screens.xs ? 120 : 150,
                          objectFit: "cover",
                          filter: r.is_active ? "none" : "grayscale(80%)", // opsional: lebih jelas disabled
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: screens.xs ? 120 : 150,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#fafafa",
                          color: "#999",
                        }}
                      >
                        No Image
                      </div>
                    )
                  }
                >
                  <Card.Meta
                    title={
                      <div>
                        <div style={{ fontSize: screens.xs ? 14 : 16 }}>
                          {r.name}
                        </div>

                        {r.po_dates && r.is_active && (
                          <Text
                            style={{
                              fontSize: 12,
                              display: "block",
                              marginTop: 4,
                              color: "#fa8c16",
                              fontWeight: 500,
                            }}
                          >
                            Ready: {dayjs(r.po_dates).format("DD MMM YYYY")}
                          </Text>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Card>
    </div>
  );
}

export default RestaurantPage;
