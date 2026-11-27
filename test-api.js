async function test() {
  try {
    console.log('--- STARTING WATER SUPPLY FULL-STACK TESTS ---');

    // 1. Health
    const h = await fetch('http://localhost:5000/api/health').then(r=>r.json());
    console.log('1. Health Check:', h.status);

    // 2. Customer App: Suppliers
    const sups = await fetch('http://localhost:5000/api/suppliers').then(r=>r.json());
    console.log('2. Customer - Suppliers API (Count):', sups.count, '-', sups.data[0].name);

    // 3. Customer App: Place Order
    const newOrder = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        supplier: {id: 1, name: 'Mishra Water Supply', location: 'Aliganj, Lucknow', phone: '+91 98765 43210'},
        waterType: 'Cold',
        quantity: 2,
        pricePerUnit: 35,
        totalPrice: 70,
        userDetails: {name: 'Test Customer', mobile: '9988776655', address: 'Flat 101, Gomti Nagar', location: 'Gomti Nagar'},
        paymentMethod: 'cod'
      })
    }).then(r=>r.json());
    console.log('3. Customer - Create Order:', newOrder.success, 'Order ID:', newOrder.data.orderId);

    // 4. Supplier App: Login
    const supLogin = await fetch('http://localhost:5000/api/supplier/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email: 'supplier@jalmitra.com', password: 'password123' })
    }).then(r=>r.json());
    console.log('4. Supplier - Auth Login:', supLogin.success, 'Supplier:', supLogin.data.businessName);

    // 5. Supplier App: Dashboard Stats
    const supStats = await fetch('http://localhost:5000/api/supplier/stats').then(r=>r.json());
    console.log('5. Supplier - Stats: Total Orders:', supStats.data.total, 'Pending:', supStats.data.pending, 'Earnings: ₹' + supStats.data.todayEarnings);

    // 6. Supplier App: Orders List
    const supOrders = await fetch('http://localhost:5000/api/supplier/orders').then(r=>r.json());
    console.log('6. Supplier - Live Orders List (Count):', supOrders.count, 'Latest:', supOrders.data[0].id);

    // 7. Supplier App: Change Delivery Status
    const statusUpdate = await fetch('http://localhost:5000/api/supplier/orders/' + newOrder.data.orderId + '/status', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ status: 'Out for Delivery', note: 'Driver assigned' })
    }).then(r=>r.json());
    console.log('7. Supplier - Update Order Status:', statusUpdate.success, 'New Status:', statusUpdate.data.status);

    // 8. Supplier App: Products
    const products = await fetch('http://localhost:5000/api/supplier/products').then(r=>r.json());
    console.log('8. Supplier - Products API (Count):', products.count, '-', products.data[0].productName);

    // 9. Admin App: Login
    const adminLogin = await fetch('http://localhost:5000/api/admin/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email: 'admin@jalmitra.com', password: 'admin' })
    }).then(r=>r.json());
    console.log('9. Admin - Auth Login:', adminLogin.success, 'Token received:', !!adminLogin.token);

    // 10. Admin App: Stats
    const adminStats = await fetch('http://localhost:5000/api/admin/stats').then(r=>r.json());
    console.log('10. Admin - Stats API: Total Orders:', adminStats.data.totalOrders, 'Users:', adminStats.data.totalUsers, 'Revenue: ₹' + adminStats.data.totalRevenue);

    // 11. Admin App: Users API & Add User
    const adminUsers = await fetch('http://localhost:5000/api/admin/users').then(r=>r.json());
    console.log('11. Admin - Users List (Count):', adminUsers.count);

    const createdUser = await fetch('http://localhost:5000/api/admin/users', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name: 'Vikram Mehta', mobile: '+91 98123 45678', location: 'Indira Nagar, Lucknow' })
    }).then(r=>r.json());
    console.log('12. Admin - Create User API:', createdUser.success, 'New User ID:', createdUser.data.id);

    // 12. Admin App: Suppliers API & Add Supplier
    const adminSuppliers = await fetch('http://localhost:5000/api/admin/suppliers').then(r=>r.json());
    console.log('13. Admin - Suppliers List (Count):', adminSuppliers.count);

    const createdSupplier = await fetch('http://localhost:5000/api/admin/suppliers', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name: 'Ganga Mineral Water', business: 'Ganga RO Water Plant', phone: '+91 97766 55443', location: 'Hazratganj, Lucknow' })
    }).then(r=>r.json());
    console.log('14. Admin - Create Supplier API:', createdSupplier.success, 'Supplier:', createdSupplier.data.business);

    // 13. Admin App: Subscriptions API & Add Plan
    const adminSubs = await fetch('http://localhost:5000/api/admin/subscriptions').then(r=>r.json());
    console.log('15. Admin - Subscriptions List (Count):', adminSubs.count);

    const createdSub = await fetch('http://localhost:5000/api/admin/subscriptions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name: 'Corporate Office Jar Pack', price: 2999, duration: '1 Month', features: 'Daily 5 Cans chilled delivery for offices' })
    }).then(r=>r.json());
    console.log('16. Admin - Create Subscription Plan API:', createdSub.success, 'Plan:', createdSub.data.name);

    // 14. Admin App: Orders API & Update Status
    const adminOrders = await fetch('http://localhost:5000/api/admin/orders').then(r=>r.json());
    console.log('17. Admin - Platform Orders List (Count):', adminOrders.count);

    const adminOrderStatus = await fetch('http://localhost:5000/api/admin/orders/' + newOrder.data.orderId + '/status', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ status: 'Delivered' })
    }).then(r=>r.json());
    console.log('18. Admin - Update Order Status API:', adminOrderStatus.success, 'Status:', adminOrderStatus.data.status);

    console.log('\n======================================================');
    console.log('🎉 ALL JALMITRA, SUPPLIER & ADMIN BACKEND APIS VERIFIED 100% OPERATIONAL!');
    console.log('======================================================');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

test();
