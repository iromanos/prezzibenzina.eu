import {useEffect} from "react";


export default function Display6977770298() {


    if (process.env.NODE_ENV === 'development') return <div className={'p-4'}>Display6977770298</div>;

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return <>
        <ins className="adsbygoogle"
             style={{display: 'inline-block', height: '82px', width: '100%'}}
             data-ad-client="ca-pub-7775238513283854"
             data-ad-slot="6977770298"
        ></ins>
    </>;
}