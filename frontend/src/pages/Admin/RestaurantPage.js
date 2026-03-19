import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Switch,
  message,
} from "antd";
import api from "../../services/api";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { DatePicker } from "antd";

dayjs.locale("id");

function AdminRestaurantPage() {
  const [form] = Form.useForm();
  const [restaurants, setRestaurants] = useState([]);
  const [paramLoading, setParamLoading] = useState({
    loadingTable: false,
    loadingModal: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [logoFileList, setLogoFileList] = useState([]);
  const [qrisFileList, setQrisFileList] = useState([]);

  const fetchRestaurants = async () => {
    setParamLoading((prev) => ({ ...prev, loadingTable: true }));
    try {
      const res = await api.get("/admin/allrestaurants");
      setRestaurants(res.data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error(err);
    } finally {
      setParamLoading((prev) => ({ ...prev, loadingTable: false }));
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAdd = () => {
    setEditingRestaurant(null);
    form.resetFields();
    setLogoFileList([]);
    setQrisFileList([]);
    setModalVisible(true);
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);

    form.setFieldsValue({
      name: restaurant.name,
      is_active: restaurant.is_active,
      po_dates: restaurant.po_dates ? dayjs(restaurant.po_dates) : null,
    });

    // tampilkan file lama sebagai preview
    setLogoFileList(
      restaurant.logo_image
        ? [
            {
              uid: "-1",
              name: "logo.png",
              status: "done",
              url: restaurant.logo_image,
            },
          ]
        : [],
    );

    setQrisFileList(
      restaurant.qris_image
        ? [
            {
              uid: "-2",
              name: "qris.png",
              status: "done",
              url: restaurant.qris_image,
            },
          ]
        : [],
    );

    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setParamLoading((prev) => ({ ...prev, loadingModal: true }));
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("is_active", values.is_active);

      formData.append(
        "po_dates",
        values.po_dates ? values.po_dates.format("YYYY-MM-DD") : null,
      );

      if (values.logo?.file) formData.append("logo", values.logo.file);
      if (values.qris?.file) formData.append("qris", values.qris.file);

      if (editingRestaurant) {
        await api.put(`/admin/restaurants/${editingRestaurant.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Restoran diperbarui!");
      } else {
        await api.post("/admin/restaurants", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Restoran baru ditambahkan!");
      }

      setModalVisible(false);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      message.error("Terjadi kesalahan!");
    } finally {
      setParamLoading((prev) => ({ ...prev, loadingModal: false }));
    }
  };

  const handleToggleActive = async (record) => {
    try {
      await api.put(`/admin/restaurants/${record.id}`, {
        is_active: !record.is_active,
      });
      fetchRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Nama", dataIndex: "name" },
    {
      title: "LOGO",
      dataIndex: "logo_image",
      render: (val) => (val ? <img src={val} width={50} /> : "-"),
    },
    {
      title: "QRIS",
      dataIndex: "qris_image",
      render: (val) => (val ? <img src={val} width={50} /> : "-"),
    },
    {
      title: "Tanggal PO",
      dataIndex: "po_dates",
      render: (val) => (val ? dayjs(val).format("dddd, DD MMMM YYYY") : "-"),
    },
    {
      title: "Aktif",
      dataIndex: "is_active",
      render: (val, record) =>
        val ? (
          <Button type="primary">Aktif</Button>
        ) : (
          <Button type="primary" danger>
            Non Aktif
          </Button>
        ),
    },
    {
      title: "Aksi",
      render: (_, record) => (
        <Button onClick={() => handleEdit(record)}>Edit</Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Kelola Restoran"
        extra={
          <Button type="primary" onClick={handleAdd}>
            Tambah Restoran
          </Button>
        }
      >
        <Table
          dataSource={restaurants}
          columns={columns}
          rowKey="id"
          loading={paramLoading.loadingTable}
        />
      </Card>

      <Modal
        open={modalVisible}
        title={editingRestaurant ? "Edit Restoran" : "Tambah Restoran"}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Nama Restoran"
            rules={[{ required: true, message: "Isi nama restoran!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Logo">
            <Upload
              beforeUpload={() => false}
              fileList={logoFileList}
              onChange={({ fileList }) => setLogoFileList(fileList)}
              maxCount={1}
            >
              <Button>Upload Logo</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="QRIS">
            <Upload
              beforeUpload={() => false}
              fileList={qrisFileList}
              onChange={({ fileList }) => setQrisFileList(fileList)}
              maxCount={1}
            >
              <Button>Upload QRIS</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="po_dates"
            label="Tanggal Pesanan Tersedia"
            rules={[{ required: true, message: "Pilih tanggal!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item name="is_active" label="Aktif" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={paramLoading.loadingModal}
            >
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminRestaurantPage;
