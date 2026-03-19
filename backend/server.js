require("dotenv").config();

const express = require("express");
const cors = require("cors");
const supabase = require("./supabase");

// untuk upload gambar
const multer = require("multer");
const upload = multer();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Food Ordering API Running");
});

app.get("/restaurants", async (req, res) => {
  const { data, error } = await supabase.from("restaurants").select("*");

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});

app.get("/menus/:restaurantId", async (req, res) => {
  const { restaurantId } = req.params;

  // ambil restoran
  const { data: restaurant, error: errRestaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single();

  if (errRestaurant) {
    return res.status(500).json(errRestaurant);
  }

  // ambil menu
  const { data: menus, error: errMenus } = await supabase
    .from("menus")
    .select("*")
    .eq("restaurant_id", restaurantId);

  if (errMenus) {
    return res.status(500).json(errMenus);
  }

  res.json({
    restaurant,
    menus,
  });
});

app.post("/orders", async (req, res) => {
  const { customer, cart, restaurant_id, order_date, total } = req.body;

  const { data: order, error } = await supabase
    .from("orders")
    .insert([
      {
        order_date,
        restaurant_id,
        customer_name: customer.name,
        customer_wa: customer.phone,
        department: customer.division,
        payment_status: "PROCESSING",
        total_price: total,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json(error);

  const items = cart.map((item) => ({
    order_id: order.id,
    menu_id: item.id,
    qty: item.qty,
    price: item.price,
    note: item.note || null,
  }));

  await supabase.from("order_items").insert(items);

  res.json({ order_id: order.id });
});

app.get("/orders/:id", async (req, res) => {
  const orderId = req.params.id;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError) return res.status(500).json(orderError);

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(
      `
      qty,
      price,
      note,
      menus (
        name
      )
    `,
    )
    .eq("order_id", orderId);

  if (itemsError) return res.status(500).json(itemsError);

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", order.restaurant_id)
    .single();

  res.json({
    order,
    items,
    restaurant,
  });
});

app.get("/admin/restaurants", async (req, res) => {
  const { data, error } = await supabase.from("restaurants").select("id, name");

  if (error) return res.status(500).json(error);

  res.json(data);
});

app.get("/admin/allrestaurants", async (req, res) => {
  const { data, error } = await supabase.from("restaurants").select("*");

  if (error) return res.status(500).json(error);

  res.json(data);
});

app.get("/admin/orders", async (req, res) => {
  const { date, restaurant_id } = req.query;

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      restaurants (name),
      order_items (
        qty,
        price,
        note,
        menus (name)
      )
    `,
    )
    .eq("order_date", date);

  if (restaurant_id) {
    query = query.eq("restaurant_id", restaurant_id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  res.json(data);
});

const bcrypt = require("bcrypt");
// cek pw
// bcrypt.hash("admin12345", 10).then(console.log);
const jwt = require("jsonwebtoken");

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !admin) {
    return res.status(401).json({ message: "User tidak ditemukan" });
  }

  const isMatch = await bcrypt.compare(password, admin.password_hash);

  if (!isMatch) {
    return res.status(401).json({ message: "Password salah" });
  }

  const token = jwt.sign(
    { id: admin.id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  res.json({ token });
});

app.post(
  "/admin/restaurants",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "qris", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, is_active, po_dates } = req.body;
      const files = req.files;

      let logoUrl = null;
      let qrisUrl = null;

      // upload logo ke supabase
      if (files?.logo?.[0]) {
        const file = files.logo[0];
        const filePath = `restaurants/logo_${Date.now()}_${file.originalname}`;
        const { error } = await supabase.storage
          .from("Logo Image")
          .upload(filePath, file.buffer, { contentType: file.mimetype });
        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from("Logo Image")
          .getPublicUrl(filePath);

        logoUrl = publicUrl.publicUrl;
      }

      // upload qris ke supabase
      if (files?.qris?.[0]) {
        const file = files.qris[0];
        const filePath = `restaurants/qris_${Date.now()}_${file.originalname}`;
        const { error } = await supabase.storage
          .from("Qris Image")
          .upload(filePath, file.buffer, { contentType: file.mimetype });
        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from("Qris Image")
          .getPublicUrl(filePath);

        qrisUrl = publicUrl.publicUrl;
      }

      // insert ke DB
      const { data, error } = await supabase
        .from("restaurants")
        .insert([
          {
            name,
            is_active,
            logo_image: logoUrl,
            qris_image: qrisUrl,
            po_dates,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload gagal", error: err });
    }
  },
);

app.put(
  "/admin/restaurants/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "qris", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, is_active, po_dates } = req.body;
      const files = req.files;

      let updateData = { name, is_active, po_dates };

      // upload logo jika ada
      if (files?.logo?.[0]) {
        const file = files.logo[0];
        const filePath = `restaurants/logo_${Date.now()}_${file.originalname}`;

        const { error } = await supabase.storage
          .from("Logo Image")
          .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from("Logo Image")
          .getPublicUrl(filePath);

        updateData.logo_image = publicUrl.publicUrl;
      }

      // upload qris jika ada
      if (files?.qris?.[0]) {
        const file = files.qris[0];
        const filePath = `restaurants/qris_${Date.now()}_${file.originalname}`;

        const { error } = await supabase.storage
          .from("Qris Image")
          .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from("Qris Image")
          .getPublicUrl(filePath);

        updateData.qris_image = publicUrl.publicUrl;
      }

      // update DB
      const { data, error } = await supabase
        .from("restaurants")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Update gagal", error: err });
    }
  },
);

app.get("/admin/menus", async (req, res) => {
  const { restaurant_id } = req.query;

  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("restaurant_id", restaurant_id)
    .order("id", { ascending: true });

  if (error) return res.status(500).json(error);

  res.json(data);
});

app.post("/admin/menus", upload.single("image"), async (req, res) => {
  try {
    const { name, price, restaurant_id, is_active, description } = req.body;
    const file = req.file;

    let imageUrl = null;

    if (file) {
      const filePath = `menus/${Date.now()}_${file.originalname}`;

      const { error } = await supabase.storage
        .from("Food Image")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("Food Image")
        .getPublicUrl(filePath);

      imageUrl = publicUrl.publicUrl;
    }

    const { data, error } = await supabase
      .from("menus")
      .insert([
        { name, price, restaurant_id, is_active, description, image: imageUrl },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal tambah menu", error: err });
  }
});

app.put("/admin/menus/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, is_active, description } = req.body;
    const file = req.file;

    let updateData = { name, price, is_active, description };

    if (file) {
      const filePath = `menus/${Date.now()}_${file.originalname}`;

      const { error } = await supabase.storage
        .from("Food Image")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("Food Image")
        .getPublicUrl(filePath);

      updateData.image = publicUrl.publicUrl;
    }

    const { data, error } = await supabase
      .from("menus")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal update menu", error: err });
  }
});

app.put("/admin/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;

  // optional validasi biar aman
  const allowedStatus = ["PROCESSING", "DONE"];
  if (!allowedStatus.includes(payment_status)) {
    return res.status(400).json({ message: "Status tidak valid" });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json(error);

  res.json(data);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
