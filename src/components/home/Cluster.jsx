import {Marker} from "react-map-gl/maplibre";
import {log} from "@/functions/helpers";
import {useEffect, useState} from "react";

export default function Cluster({clusters = [], onClusterClick, fadeOut}) {


    let globalMin = Infinity;
    let globalMax = -Infinity;

    clusters.forEach(c => {
        if (c.properties.cluster) {
            globalMin = Math.min(globalMin, c.properties.min);
            globalMax = Math.max(globalMax, c.properties.max);
        }
    });

    const warningLimit = globalMin + (globalMax - globalMin) / 15;
    const errorLimit = globalMin + (globalMax - globalMin) / 10;

    log(globalMin);
    log(globalMax);
    log(warningLimit);
    log(errorLimit);

    return clusters.map((cluster, i) => {

        const isCluster = cluster.properties.cluster;

        const media = cluster.properties.media;


        if (media > warningLimit) {
            cluster.properties.mediaColore = 1; // alto
        }

        if (media > errorLimit) {
            cluster.properties.mediaColore = 2; // alto
        }

        return isCluster ?
            <MarkerCluster
                onClick={onClusterClick}
                fadeOut={fadeOut}
                key={i} cluster={cluster}
            />
            : null
    });
}

function MarkerCluster({cluster, fadeOut, onClick}) {

    const [lng, lat] = cluster.geometry.coordinates;
    const isCluster = cluster.properties.cluster;
    const count = cluster.properties.point_count;
    const media = cluster.properties.media?.toFixed(3);
    const mediaColore = cluster.properties.mediaColore?.toFixed(3);

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
                            border border-4 ${color}
                            ${fadeOut ? 'exit' : ''}  ${animate ? 'animate-in' : ''}
                            bg-opacity-75 rounded rounded-4`}
            onClick={() => {
                onClick?.(cluster);
            }}
        >
            <div>
                <div className={'text-center small'}>{count}</div>
                <div><strong><small>€{media}</small></strong></div>
            </div>
        </div>
    </Marker>;

}