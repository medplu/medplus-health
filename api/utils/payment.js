const axios = require('axios');

const paystack = () => {
    const MySecretKey = 'Bearer sk_test_bd491bc07f705e9724f50d3d7b059de890e06716';

    console.log('Using Paystack Key:', MySecretKey);

    const initializePayment = async (form, mycallback) => {
        if (form.metadata && typeof form.metadata === 'object') {
            form.metadata = JSON.stringify(form.metadata);
        }

        console.log('Form data being sent to Paystack:', form);

        const options = {
            url: 'https://api.paystack.co/transaction/initialize',
            headers: {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache',
            },
            data: JSON.stringify(form),
        };

        try {
            const response = await axios.post(options.url, options.data, { headers: options.headers });
            console.log('Response from Paystack:', response.data);
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
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache',
            },
        };

        try {
            const response = await axios.get(options.url, { headers: options.headers });
            return mycallback(null, response.data);
        } catch (error) {
            console.error('Error verifying payment:', error.response ? error.response.data : error.message);
            return mycallback(error, null);
        }
    };

    const createSubaccount = async (form, mycallback) => {
        const options = {
            url: 'https://api.paystack.co/subaccount',
            headers: {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache',
            },
            data: JSON.stringify(form),
        };

        try {
            const response = await axios.post(options.url, options.data, { headers: options.headers });
            console.log('Response from Paystack (Subaccount):', response.data);
            return mycallback(null, response.data);
        } catch (error) {
            console.error('Error creating subaccount:', error.response ? error.response.data : error.message);
            return mycallback(error, null);
        }
    };

    return { initializePayment, verifyPayment, createSubaccount };
};

module.exports = paystack;
