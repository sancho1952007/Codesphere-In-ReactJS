import { useState } from 'react';
import Cookies from 'js-cookie';
import '../assets/css/login.css';

export default function LoginPage() {
    const [apiKey, setApiKey] = useState<string>('');
    return (
        <div
            className="login-page flex align-center justify-center">
            <h2 style={{ textAlign: 'center' }}>Signin using API Key</h2>
            <br />
            <input
                id={'api-key-input'}
                placeholder="Enter Your API Key"
                autoComplete='off'
                autoCapitalize='off'
                onChange={e => {
                    setApiKey(e.currentTarget.value);
                }}
            />

            <div
                id="continue-btn"
                onClick={() => {
                    // Select the api key input element
                    const elem = document.querySelector('#api-key-input');
                    // Due to TS type checking
                    if (elem !== null && 'value' in elem && typeof elem.value === 'string') {
                        // Make sure the API key input is not blank
                        if (elem.value.trim() !== '') {
                            // Make sure the API key is valid
                            fetch(`${import.meta.env.VITE_API_BASE_URL}/metadata/datacenters`, {
                                method: 'GET',
                                headers: {
                                    Authorization: 'Bearer ' + apiKey
                                }
                            })
                                .then(res => {
                                    if (res.status === 200) {
                                        // Once the API key is confirmed valid, store it as a cookie so that it could be used later on
                                        Cookies.set('Codesphere_API_Key',
                                            // Due to TS, again 🫤
                                            (elem.value || '').toString(),
                                            {
                                                // Expire in 5 months
                                                expires: 152
                                            });

                                        window.location.reload();
                                    } else if (res.status === 401) {
                                        alert('Incorrect API Key!');
                                    }
                                });
                        } else {
                            alert('Please enter an API Key to continue!');
                        }
                    } else {
                        alert('Something Went Wrong!');
                    }
                }}
            >Continue</div>
            <br />
            <div>
                Made with ❤️ by&nbsp;<a href='https://sancho1952007.github.io' target='_blank'>Sancho Godinho</a>
            </div>
            <div style={{ textAlign: 'center', marginTop: 20, padding: 10 }}>The API Key will only be stored on your device, it will never be transferred to URLs other than the required Codesphere APIs</div>
            <div style={{ textAlign: 'center', marginTop: 10, padding: 10 }}>This is an Unofficial <a href="http://github.com/sancho1952007/Codesphere-In-ReactJS" target='_blank'>Open Source</a> Codesphere UI Alternative</div>
        </div>
    );
}