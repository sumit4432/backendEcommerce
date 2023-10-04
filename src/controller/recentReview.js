
const Review = require('../modals/recentReview'); 
const Product = require('../modals/product');


exports.getRecentlyViewedProducts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }
    const userId = req.user._id;
    const recentReviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('product'); 
    const productIds = recentReviews.map(review => review.product);
    const recentlyViewedProducts = await Product.find({ _id: { $in: productIds } });

    res.status(200).json({ recentlyViewedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
