// controllers/reviewController.js
const Review = require('../modals/recentReview');
const Product = require('../modals/product');


exports.getRecentlyViewedProducts = async (req, res) => {
  try {
    console.log('req.user:', req.user); 
    if (!req.user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }

    const userId = req.user._id; 
    const recentlyViewed = await Review.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('Product'); 
    const recentlyViewedProducts = recentlyViewed.map(view => view.product);

    res.status(200).json({ recentlyViewedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
