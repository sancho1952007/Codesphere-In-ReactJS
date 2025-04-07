import { useLayoutEffect, useState } from "react";

export default function GetScreenSize() {
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [height, setHeight] = useState<number>(window.innerHeight);
    const navbarHeight = 120;

    // Use layout effect & unregister event listener to prevent memory leak
    useLayoutEffect(() => {
        window.addEventListener('resize', () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
            return () => window.removeEventListener("resize", () => { });
        });
    }, [window]);

    return { width, height, navbarHeight };
}