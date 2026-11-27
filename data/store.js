const fs = require('fs');
const path = require('path');
const { connectMongo, syncToMongo } = require('../config/db');

const DB_PATH = path.join(__dirname, 'db.json');
let memoryDb = null;
let syncQueue = Promise.resolve();

const initialData = {
  suppliers: [
    {
      id: 1,
      name: "Mishra Water Supply",
      tagline: "Pure RO Drinking Water & Chilled Cans",
      location: "Aliganj, Lucknow",
      fullAddress: "Plot 42, Sector B, Near Kapoorthala, Aliganj, Lucknow, UP - 226024",
      distance: "1.2 km",
      deliveryTime: "20-30 mins",
      water: "Both",
      price: 30,
      coldPrice: 35,
      normalPrice: 30,
      rating: 4.8,
      ratingCount: 248,
      isVerified: true,
      image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60",
      phone: "+91 98765 43210",
      openTime: "06:00 AM - 10:00 PM",
      features: ["TDS 80-120 Safe Range", "Chilled & Normal", "Same Day Express Delivery", "Sanitized Cans"]
    },
    {
      id: 2,
      name: "Fresh Drop Water Services",
      tagline: "Natural Mineral & Alkaline Drinking Water",
      location: "Gomti Nagar, Lucknow",
      fullAddress: "Viram Khand 3, Near Husadiya Chauraha, Gomti Nagar, Lucknow, UP - 226010",
      distance: "2.5 km",
      deliveryTime: "25-35 mins",
      water: "Both",
      price: 25,
      coldPrice: 30,
      normalPrice: 25,
      rating: 4.9,
      ratingCount: 382,
      isVerified: true,
      image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=500&auto=format&fit=crop&q=60",
      phone: "+91 98112 34567",
      openTime: "06:30 AM - 10:30 PM",
      features: ["Multi-Stage RO + UV", "Sterilized Dispenser Cans", "Free Delivery", "Pre-booking Available"]
    },
    {
      id: 3,
      name: "Aqua Pure Waters",
      tagline: "Chilled Refreshing Water Cans",
      location: "Hazratganj, Lucknow",
      fullAddress: "Shop 14, Halwasiya Market, Hazratganj, Lucknow, UP - 226001",
      distance: "3.1 km",
      deliveryTime: "30-40 mins",
      water: "Cold",
      price: 35,
      coldPrice: 35,
      normalPrice: 30,
      rating: 4.7,
      ratingCount: 195,
      isVerified: true,
      image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=500&auto=format&fit=crop&q=60",
      phone: "+91 99345 67890",
      openTime: "07:00 AM - 09:30 PM",
      features: ["Super Chilled 4°C", "Food Grade Plastic Jars", "Fast Service"]
    },
    {
      id: 4,
      name: "Sky Water Solutions",
      tagline: "Reliable Daily Home & Office Water Delivery",
      location: "Indira Nagar, Lucknow",
      fullAddress: "Block C, Near Munshi Pulia Metro, Indira Nagar, Lucknow, UP - 226016",
      distance: "4.2 km",
      deliveryTime: "30-45 mins",
      water: "Both",
      price: 30,
      coldPrice: 35,
      normalPrice: 30,
      rating: 4.6,
      ratingCount: 160,
      isVerified: false,
      image: "https://images.unsplash.com/photo-1559839914-ba2a66e60da4?w=500&auto=format&fit=crop&q=60",
      phone: "+91 97234 56781",
      openTime: "06:00 AM - 10:00 PM",
      features: ["Daily Subscription", "Instant Delivery", "Bulk Order Discounts"]
    },
    {
      id: 5,
      name: "Ganga Jal Supply",
      tagline: "Pure Drinking Water with Copper-Enriched Storage",
      location: "Mahanagar, Lucknow",
      fullAddress: "B-12, Gole Market, Mahanagar, Lucknow, UP - 226006",
      distance: "2.1 km",
      deliveryTime: "20-30 mins",
      water: "Both",
      price: 28,
      coldPrice: 32,
      normalPrice: 28,
      rating: 4.8,
      ratingCount: 310,
      isVerified: true,
      image: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=500&auto=format&fit=crop&q=60",
      phone: "+91 94500 12345",
      openTime: "06:00 AM - 11:00 PM",
      features: ["Copper Filtration", "Clean Odorless Water", "Doorstep Floor Delivery"]
    },
    {
      id: 6,
      name: "Blue Wave Mineral Water",
      tagline: "High TDS Controlled Mineral Drinking Water",
      location: "Jankipuram, Lucknow",
      fullAddress: "Sector 6, Near Engineering College, Jankipuram, Lucknow, UP - 226021",
      distance: "3.8 km",
      deliveryTime: "25-35 mins",
      water: "Normal",
      price: 25,
      coldPrice: 30,
      normalPrice: 25,
      rating: 4.5,
      ratingCount: 142,
      isVerified: true,
      image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=60",
      phone: "+91 93690 98765",
      openTime: "07:00 AM - 09:00 PM",
      features: ["Student & Hostel Friendly", "Low Cost Clean Water", "Cash & Online Payments"]
    }
  ],
  orders: [
    {
      orderId: "JM98421054",
      supplier: {
        id: 1,
        name: "Mishra Water Supply",
        location: "Aliganj, Lucknow",
        phone: "+91 98765 43210"
      },
      waterType: "Cold",
      quantity: 2,
      pricePerUnit: 35,
      deliveryCharge: 0,
      discount: 0,
      totalPrice: 70,
      userDetails: {
        name: "Rahul Verma",
        mobile: "9876543210",
        address: "Flat 302, Green Park Apartments, Sector B",
        location: "Aliganj, Lucknow"
      },
      paymentMethod: "cod",
      deliveryType: "now",
      status: "Out for Delivery",
      statusHistory: [
        { status: "Placed", time: "10:15 AM", note: "Order placed successfully" },
        { status: "Accepted", time: "10:18 AM", note: "Supplier confirmed the order" },
        { status: "Preparing", time: "10:25 AM", note: "Chilled 20L jars sanitized and loaded" },
        { status: "Out for Delivery", time: "10:35 AM", note: "Rider Amit Kumar is on the way" }
      ],
      deliveryPartner: {
        name: "Amit Kumar",
        phone: "+91 98765 11223",
        vehicle: "UP 32 BK 4821 (Bajaj Maxima)"
      },
      orderDate: new Date().toLocaleDateString("en-IN"),
      orderTime: "10:15 AM"
    }
  ],
  reviews: [
    {
      id: 1,
      name: "Priya Sharma",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      text: "Paani bilkul fresh aur chilled time par deliver hua. Service kaafi reliable hai, app use karna bahut aasan hai!",
      date: "2 days ago",
      supplierName: "Mishra Water Supply"
    },
    {
      id: 2,
      name: "Rahul Verma",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      text: "Water jar bilkul clean aur sealed tha. Delivery boy ne 2nd floor par safely pahunchaya. 5 stars!",
      date: "3 days ago",
      supplierName: "Fresh Drop Water"
    },
    {
      id: 3,
      name: "Anjali Singh",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      text: "Near me best water suppliers filter ho gaye. Fast delivery aur reasonable price, best water app in Lucknow.",
      date: "5 days ago",
      supplierName: "Ganga Jal Supply"
    },
    {
      id: 4,
      name: "Aman Gupta",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      text: "Daily drinking water ke liye JalMitra sabse acchi choice hai. Pre-booking feature bahut kaam ka hai.",
      date: "1 week ago",
      supplierName: "Aqua Pure Waters"
    },
    {
      id: 5,
      name: "Neha Mishra",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      rating: 4,
      text: "Live order tracking feature is amazing. Pata chal jata hai rider kab tak aayega.",
      date: "1 week ago",
      supplierName: "Sky Water Solutions"
    }
  ],
  notifications: [
    {
      id: 1,
      title: "Order Out for Delivery! 🚚",
      message: "Rider Amit Kumar is arriving with your 20L Water Jars in ~10 mins.",
      time: "Just now",
      isRead: false,
      type: "order"
    },
    {
      id: 2,
      title: "Welcome to JalMitra 💧",
      message: "Get ₹10 OFF on your first 2 orders using code JAL10.",
      time: "Today",
      isRead: true,
      type: "promo"
    }
  ],
  users: [
    {
      mobile: "9876543210",
      name: "Rahul Verma",
      address: "Flat 302, Green Park Apartments, Sector B",
      location: "Aliganj, Lucknow",
      savedAddresses: [
        { id: 1, title: "Home", address: "Flat 302, Green Park Apartments, Sector B, Aliganj, Lucknow", isDefault: true },
        { id: 2, title: "Office", address: "Co-work Hub, 4th Floor, Gomti Nagar, Lucknow", isDefault: false }
      ]
    }
  ]
};

function readJsonFile() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(initialData));
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return JSON.parse(JSON.stringify(initialData));
  }
}

async function initStore() {
  const localData = readJsonFile();
  const { connected, data } = await connectMongo(localData);
  if (connected && data) {
    memoryDb = { ...localData, ...data };
  } else {
    memoryDb = localData;
  }
  return memoryDb;
}

function readDb() {
  if (memoryDb) return memoryDb;
  memoryDb = readJsonFile();
  return memoryDb;
}

function writeDb(data) {
  memoryDb = data;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
  // Serialize MongoDB Atlas writes to prevent race conditions
  syncQueue = syncQueue.then(() => syncToMongo(data)).catch((err) => {
    console.error('Mongo sync queue error:', err);
  });
  return true;
}

module.exports = {
  initStore,
  readDb,
  writeDb
};

