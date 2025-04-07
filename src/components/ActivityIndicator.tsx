import GetScreenSize from "../global/get-screen-size";
import loader from '../assets/loader.gif';

export default function ActivityIndicator() {
    const ScreenSize = GetScreenSize();

    return (
        <div
            style={{
                width: ScreenSize.width,
                height: ScreenSize.height - ScreenSize.navbarHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <img
                alt="loader-gif"
                style={{
                    width: 50
                }}
                src={loader}
            />
        </div>
    );
}