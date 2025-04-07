import Cookies from 'js-cookie';

export default function GetSession() {
    // Try retriving the current session cookie
    const session_cookie = Cookies.get('Codesphere_API_Key');
    // Make sure it exists, if not, return ""
    // The reason of not returning `null` instead of '' is that it causes a TS error in multiple pages where it is imported.
    // When this is '' (i.e., user is not logged in) it would render the not logged in page in the App.tsx
    if (session_cookie) {
        return 'Bearer ' + session_cookie;
    } else {
        return '';
    }

}