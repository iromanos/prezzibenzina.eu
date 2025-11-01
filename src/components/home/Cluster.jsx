import {Marker} from "react-map-gl/maplibre";
import {log} from "@/functions/helpers";
import {useEffect, useMemo, useState} from "react";


import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

export default function Cluster({clusters = [], onClusterClick, fadeOut}) {

    let globalMin = Infinity;
    let globalMax = -Infinity;

    clusters.forEach(c => {
        if (c) {
            globalMin = Math.min(globalMin, c.min);
            globalMax = Math.max(globalMax, c.max);
        }
    });

    const warningLimit = globalMin + (globalMax - globalMin) / 4;
    const errorLimit = globalMin + (globalMax - globalMin) / 1.5;

    log(`min: ${globalMin}`);
    log(`max: ${globalMax}`);
    log(warningLimit);
    log(errorLimit);


    log(clusters[0]);

    return clusters.map((cluster, i) => {


        const isCluster = true; //cluster.properties.cluster;

        const media = cluster.media;


        if (media > warningLimit) {
            cluster.mediaColore = 1; // alto
        }

        if (media > errorLimit) {
            cluster.mediaColore = 2; // alto
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

function MarkerCluster({cluster, fadeOut = false, onClick}) {

    const [lng, lat] = cluster.position;
    const isCluster = true; //cluster.properties.cluster;
    const count = cluster.count;
    const media = cluster.media?.toFixed(3);
    const mediaColore = cluster.mediaColore?.toFixed(3);

    const min = cluster.min?.toFixed(3);
    const max = cluster.max?.toFixed(3);

    const size = Math.min(120, (Math.log2(count) * 24) + 40);

    if (!isCluster) {
        log(c.properties);
    }

    //const [exit, setExit] = useState(fadeOut);

    const [animate, setAnimate] = useState(fadeOut);


    useEffect(() => {
        if (animate === false && fadeOut === true) return;
        requestAnimationFrame(() => setAnimate(!fadeOut));
    }, [fadeOut]);

    function getClusterColor(avgPrice) {
        if (avgPrice > 0) return 'bg-warning-subtle';
        if (avgPrice > 1) return 'bg-danger-subtle';
        return 'bg-success-subtle';
    }

    const color = getClusterColor(mediaColore);
    const textColor = useMemo(() => {
        return 'text-black';
    }, [mediaColore]);

    const borderColor = useMemo(() => {
        if (mediaColore > 0) return 'border-warning';
        return 'border-success';
    }, [mediaColore]);

    return <Marker longitude={lng} latitude={lat}>
        <div

            style={{
                // width: size,
                // height: size,
            }}

            className={`  
                            cluster-marker bg-white 
                            border border-4 ${borderColor}
                            ${animate ? 'animate-in' : 'exit'}
                            bg-opacity-75 rounded rounded-4`}
            onClick={() => {
                onClick?.(cluster);
            }}
        >
            <div className={`p-2 ${textColor} ${color} rounded-4`}>
                <div className={''}><small><LocalGasStationIcon fontSize={'small'}/> {count}</small></div>
                <hr className={'my-1'}/>
                <div><small>medio: €{media}</small> - <small>min: €{min}</small></div>
            </div>
        </div>
    </Marker>;

}