import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';

import { Image } from 'react-native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginAction } from '../app/(redux)/authSlice';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

const webClientId ='399287117531-tmvmbo06a5l8svihhb7c7smqt7iobbs0.apps.googleusercontent.com';
const iosClientId= '399287117531-853cnp42gtbpm3idp02jcrc0thec4jg4.apps.googleusercontent.com';
const androidClientId = '399287117531-s5ea9q7t3v9auj3tspnvi3j70fd9tdg8.apps.googleusercontent.com';

WebBrowser.maybeCompleteAuthSession();

interface LoginWithGoogleProps {
    onLoginSuccess?: (data: any) => void;
}

const LoginWithGoogle: React.FC<LoginWithGoogleProps> = ({ onLoginSuccess }) => {
    const dispatch = useDispatch();
    const [isAuthenticating, setIsAuthenticating] = React.useState(false);
    const config = {
        iosClientId,
        androidClientId,
        webClientId
    };

    const [request, response, promptAsync] = Google.useAuthRequest(config);

    const sendGoogleUserDataToBackend = async (userData: any) => {
        try {
            const response = await axios.post('https://medplus-health.onrender.com/api/users/google-login', {
                email: userData.email,
                firstname: userData.given_name,
                lastname: userData.family_name,
            });
            console.log('Backend response', response.data);
            if (onLoginSuccess) {
                onLoginSuccess(response.data);
            }
            dispatch(loginAction({
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                userId: response.data.id,
                token: response.data.token,
                username: response.data.username
            }));
        } catch (error) {
            console.log('Error sending Google user data to backend', error);
        }
    };

    const getUserProfile = async (accessToken: string) => {
        if(!accessToken) return;
        try{
            const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            console.log('user profile', data);
            sendGoogleUserDataToBackend(data); // Send user data to backend
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleToken = async (response: any) => {
        if (response?.type === 'success') {
            const { authentication } = response;
            const token = authentication?.accessToken;
            console.log("access token", token);

            getUserProfile(token);
        }
        setIsAuthenticating(false);
    };

    useEffect(() => {
        handleToken(response);
    }, [response]);

    const googleImageUri = 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1734447819/google-svgrepo-com_jdwbco.svg';

    return (
        <View>
            <TouchableOpacity 
                style={styles.googleButton} 
                onPress={() => {
                    setIsAuthenticating(true);
                    promptAsync();
                }}
                disabled={isAuthenticating}
            >
                <Image source={{ uri: googleImageUri }} style={styles.googleImage} />
            </TouchableOpacity>
        </View>
    );
};

export default LoginWithGoogle;

const styles = StyleSheet.create({
    googleButton: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleImage: {
        height: 35,
        width: 35, // Adjusted width to match height
    },
});
