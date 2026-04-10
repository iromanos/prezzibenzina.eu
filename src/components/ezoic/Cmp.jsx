import Script from "next/script";

export function Cmp() {


    return <>

        {/* Script della CMP di Ezoic */}
        <Script
            src="https://cmp.gatekeeperconsent.com/min.js"
            strategy="beforeInteractive"
            data-cfasync="false"
        />
        <Script
            src="https://the.gatekeeperconsent.com/cmp.min.js"
            strategy="beforeInteractive"
            data-cfasync="false"
        />

        {/* 1. Motore Ezoic principale */}
        <Script
            src="//www.ezojs.com/ezoic/sa.min.js"
            strategy="afterInteractive"
            async
        />

        {/* 2. Setup del comando ezstandalone (Inline Script) */}
        <Script id="ezoic-standalone-setup" strategy="afterInteractive">
            {`
                    window.ezstandalone = window.ezstandalone || {};
                    ezstandalone.cmd = ezstandalone.cmd || [];
                `}
        </Script>

        {/* 3. Ezoic Analytics */}
        <Script
            src="//ezoicanalytics.com/analytics.js"
            strategy="afterInteractive"
        />

    </>

}