import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Switch,
  message,
} from "antd";
import api from "../../services/api";

function AdminMenuPage() {
  const [menus, setMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [paramLoading, setParamLoading] = useState({
    loadingTable: false,
    loadingModal: false,
    loadingSelect: false,
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setParamLoading((prev) => ({ ...prev, loadingSelect: true }));
    try {
      const res = await api.get("/admin/allrestaurants");
      setRestaurants(res.data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error(err);
    } finally {
      setParamLoading((prev) => ({ ...prev, loadingSelect: false }));
    }
  };

  const fetchMenus = async (restaurantId) => {
    setParamLoading((prev) => ({ ...prev, loadingTable: true }));
    try {
      const res = await api.get(`/admin/menus?restaurant_id=${restaurantId}`);
      setMenus(res.data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error(err);
    } finally {
      setParamLoading((prev) => ({ ...prev, loadingTable: false }));
    }
  };

  const handleSelectRestaurant = (value) => {
    setSelectedRestaurant(value);
    fetchMenus(value);
  };

  const handleAdd = () => {
    setEditingMenu(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);

    form.setFieldsValue({
      name: menu.name,
      price: menu.price,
      is_active: menu.is_active,
      description: menu.description,
    });

    setFileList(
      menu.image
        ? [
            {
              uid: "-1",
              name: "image.png",
              status: "done",
              url: menu.image,
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
      formData.append("description", values.description); // ✅ INI YANG KURANG
      formData.append("price", values.price);
      formData.append("is_active", values.is_active);
      formData.append("restaurant_id", selectedRestaurant);

      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      if (editingMenu) {
        await api.put(`/admin/menus/${editingMenu.id}`, formData);
        message.success("Menu diupdate!");
      } else {
        await api.post("/admin/menus", formData);
        message.success("Menu ditambahkan!");
      }

      setModalVisible(false);
      fetchMenus(selectedRestaurant);
    } catch (err) {
      message.error("Gagal simpan menu");
    } finally {
      setParamLoading((prev) => ({ ...prev, loadingModal: false }));
    }
  };

  const columns = [
    { title: "Nama", dataIndex: "name" },
    { title: "Description", dataIndex: "description" },
    { title: "Harga", dataIndex: "price" },
    {
      title: "Gambar",
      dataIndex: "image",
      render: (val) => (val ? <img src={val} width={50} /> : "-"),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (val) =>
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
      <Card title="Kelola Menu">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Select
            loading={paramLoading.loadingSelect}
            placeholder="Pilih Restoran"
            style={{ width: 300 }}
            onChange={handleSelectRestaurant}
            options={restaurants.map((r) => ({
              value: r.id,
              label: r.name,
            }))}
          />

          <Button
            type="primary"
            onClick={handleAdd}
            disabled={!selectedRestaurant}
          >
            Tambah Menu
          </Button>
        </div>

        <Table
          dataSource={menus}
          columns={columns}
          rowKey="id"
          loading={paramLoading.loadingTable}
        />
      </Card>

      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Nama Menu" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="price" label="Harga" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Gambar">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              maxCount={1}
            >
              <Button>Upload Gambar</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="is_active" label="Aktif" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
            loading={paramLoading.loadingModal}
          >
            Simpan
          </Button>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminMenuPage;
