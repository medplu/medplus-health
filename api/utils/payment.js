const axios = require('axios');

const paystack = () => {
    const MySecretKey = 'Bearer sk_test_e4027d1a804639d19d2c24abf9389f22637d9a19';  // Replace 'YOUR_PAYSTACK_SECRET_KEY' with your actual Paystack secret key

    // Log the secret key to ensure it is set correctly (remove this in production)
    console.log('Using Paystack Key:', MySecretKey);
    
    const initializePayment = async (form, mycallback) => {
        // Ensure the metadata is stringified separately
        if (form.metadata && typeof form.metadata === 'object') {
            form.metadata = JSON.stringify(form.metadata);
        }
    
        const options = {
            url: 'https://api.paystack.co/transaction/initialize',
            headers: {
                authorization: MySecretKey,  // Use the modified secret key with 'Bearer' prefix
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },
            data: JSON.stringify(form)  // Ensure the form data itself is stringified
        };
    
        try {
            const response = await axios.post(options.url, options.data, { headers: options.headers });
            return mycallback(null, response.data);
        } catch (error) {
            console.error('Error initializing payment:', error.response ? error.response.data : error.message);
            return mycallback(error, null);
        }
    };
    


    const verifyPayment = async (ref, mycallback) => {
        const options = {
            url: `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
            headers: {
                authorization: MySecretKey,  // Use the modified secret key with 'Bearer' prefix
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            }
        };

        try {
            const response = await axios.get(options.url, { headers: options.headers });
            return mycallback(null, response.data);
        } catch (error) {
            console.error('Error verifying payment:', error.response ? error.response.data : error.message);
            return mycallback(error, null);
        }
    };

    return { initializePayment, verifyPayment };
};

module.exports = paystack;