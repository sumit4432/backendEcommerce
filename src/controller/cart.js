const Cart = require("../modals/cart");


exports.addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cartItems = req.body.cartItems;

        // Check if the user already has a cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // If the user doesn't have a cart yet, create a new one with the provided cart items
            cart = new Cart({
                user: userId,
                cartItems: cartItems.map(cartItem => ({
                    ...cartItem
                }))
            });
        } else {
            // If the user has a cart, iterate through the cart items in the request
            for (const cartItem of cartItems) {
                const existingCartItemIndex = cart.cartItems.findIndex(item => item.product.equals(cartItem.product));

                if (existingCartItemIndex !== -1) {
                    // If the product exists, update its quantity
                    cart.cartItems[existingCartItemIndex].quantity += cartItem.quantity;
                    // Increase the price of the product
                    cart.cartItems[existingCartItemIndex].price += cartItem.price;
                } else {
                    // If the product doesn't exist, add it to the cart items
                    cart.cartItems.push({
                        ...cartItem
                    });
                }
            }
        }
        const totalPrice = cart.cartItems.reduce((total, item) => total + (item.price), 0);

        const savedCart = await cart.save();
        if (savedCart) {
            return res.status(201).json({ cart: savedCart, totalPrice });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


exports.deleteCartById = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ error: 'Invalid cart ID' });
        }
        const deletedCart = await Cart.findByIdAndRemove(cartId);

        if (!deletedCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        res.status(204).send("delet successfully"); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCartById = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ error: 'Invalid cart ID' });
        }
        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteQuantityCart = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const quantityToDelete = parseInt(req.query.quantityToDelete || 1); // Default to deleting one 
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ error: 'Invalid cart ID' });
        }
        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        for (const cartItem of cart.cartItems) {
            if (cartItem.quantity > 0) {
                if (cartItem.quantity <= quantityToDelete) {
                    // Remove the entire product from the cart
                    quantityToDelete -= cartItem.quantity;
                    cartItem.quantity = 0;
                } else {
                    // Reduce the quantity of the product
                    cartItem.quantity -= quantityToDelete;
                    quantityToDelete = 0;
                }
            }

            if (quantityToDelete === 0) {
                break; // No more quantity to delete
            }
        }

        // Save the updated cart
        const updatedCart = await cart.save();

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};