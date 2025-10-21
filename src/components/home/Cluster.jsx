import {Marker} from "react-map-gl/maplibre";
import {log} from "@/functions/helpers";
import {useEffect, useState} from "react";

export default function Cluster({clusters = [], onClusterClick, fadeOut}) {
    return clusters.map((c, i) => {

        const isCluster = c.properties.cluster;

        return isCluster ?
            <MarkerCluster
                fadeOut={fadeOut}
                key={i} c={c}/>
            : null

        // <ImpiantoMarker
        //     fadeOut={fadeOut}
        //     key={i} d={c.properties}/>
    });
}

function MarkerCluster({c, fadeOut}) {

    const [lng, lat] = c.geometry.coordinates;
    const isCluster = c.properties.cluster;
    const count = c.properties.point_count;
    const media = c.properties.media?.toFixed(3);
    const mediaColore = c.properties.mediaColore?.toFixed(3);

    const size = Math.min(120, (Math.log2(count) * 24) + 40);

    if (!isCluster) {
        log(c.properties);
    }

    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (fadeOut) return;
        const timeout = setTimeout(() => setAnimate(true), 10); // piccolo delay
        return () => clearTimeout(timeout);
    }, []);


    function getClusterColor(avgPrice) {
        if (avgPrice > 0) return 'border-warning-subtle';
        if (avgPrice > 1) return 'border-danger-subtle';
        return 'border-success-subtle';
    }

    const color = getClusterColor(mediaColore);

    return <Marker longitude={lng} latitude={lat}>
        <div

            style={{
                width: size,
                height: size,
            }}

            className={`d-flex align-items-center justify-content-center  
                            cluster-marker bg-white 
                            border border-2 ${color}
                            ${fadeOut ? 'exit' : ''}  ${animate ? 'animate-in' : ''}
                            bg-opacity-75 rounded-circle`}
            //title={isCluster ? `${count} impianti` : c.properties.brand}
            onClick={() => {
                //onClusterClick(c);
            }}
        >
            <div>
                <div className={'text-center small'}>{count}</div>
                <div><strong><small>€{media}</small></strong></div>
            </div>
        </div>
    </Marker>;

}