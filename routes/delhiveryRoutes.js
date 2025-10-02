const  express =require( "express");
const { createShipment, trackOrder } = require("../controllers/delhiveryControllers");

const router = express.Router();

// 📦 Create a shipment
router.post("/create", createShipment);

// 🚚 Track an order by waybill
router.get("/track/:waybill", trackOrder);

module.exports= router;
