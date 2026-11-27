const { readDb, writeDb } = require('../data/store');

exports.getReviews = (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    count: db.reviews.length,
    data: db.reviews
  });
};

exports.createReview = (req, res) => {
  const { name, rating, text, supplierName } = req.body;

  if (!name || !text) {
    return res.status(400).json({
      success: false,
      message: 'Name and review text are required'
    });
  }

  const db = readDb();
  const newReview = {
    id: Date.now(),
    name: name.trim(),
    image: `https://i.pravatar.cc/150?u=${Date.now()}`,
    rating: Number(rating) || 5,
    text: text.trim(),
    date: 'Just now',
    supplierName: supplierName || 'General Feedback'
  };

  db.reviews.unshift(newReview);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: newReview
  });
};

