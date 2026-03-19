import { Spin } from "antd";

function SpinComponent({ loading = false }) {
  return (
    <Spin
      spinning={loading}
      tip="Memuat..."
      size="large"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.7)", // semi-transparent overlay
        zIndex: 9999,
      }}
    />
  );
}

export default SpinComponent;
