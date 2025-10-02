const axios = require("axios");

// Create Shipment Controller
const createShipment = async (req, res) => {
  try {
    const shipmentData = req.body; // order + customer details

    const response = await axios.post(
      "https://track.delhivery.com/api/cmu/create.json",
      shipmentData,
      {
        headers: {
          Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const waybill = response.data?.packages?.[0]?.waybill;

    if (!waybill) {
      return res.status(400).json({ error: "Failed to get tracking ID" });
    }

    // 🔹 Here you should save waybill in your DB against the orderId
    // Example: await Order.updateOne({ _id: shipmentData.order }, { waybill });

    res.json({
      message: "Shipment created successfully",
      waybill,
      delhiveryResponse: response.data,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Shipment creation failed" });
  }
};

// Track Order Controller
 const trackOrder = async (req, res) => {
  try {
    const { waybill } = req.params;

    const response = await axios.get(
      `https://track.delhivery.com/api/v1/packages/json/?waybill=${waybill}`,
      {
        headers: {
          Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Tracking failed" });
  }
};
module.exports={createShipment,trackOrder};