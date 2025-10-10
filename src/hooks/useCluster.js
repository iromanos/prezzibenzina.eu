import Supercluster from 'supercluster';
import {useMemo, useRef} from 'react';
import {log} from "@/functions/helpers";


function getClusterOptions(count, zoom) {

    const radius = 60;//80 * (512 / (256 * Math.pow(2, zoom)));



    const maxZoom = Math.max(10, 16 - Math.log10(count));
    return {radius: Math.round(radius), maxZoom: Math.round(maxZoom)};
}

export function useCluster(points, zoom, bounds) {


    const previousPointsRef = useRef(null);

    const clusterIndex = useMemo(() => {


        if (!points || points.length === 0) return null;
        const {radius, maxZoom} = getClusterOptions(points.length, zoom);
        log("points: " + points.length);
        log("Radius: " + radius);
        log("maxzoom: " + maxZoom);
        log("zoom: " + zoom);

        log(points === previousPointsRef.current);

        previousPointsRef.current = points;

        console.trace();
        const index = new Supercluster({
            radius: radius,
            minPoints: 2,
            maxZoom: maxZoom,
        });
        index.load(points);
        return index;
    }, [points]);

    const clusters = useMemo(() => {

        log("CLUSTERINDEX: " + clusterIndex);
        log("BOUNDS: " + bounds);

        if (!clusterIndex || !bounds) return [];
        return clusterIndex.getClusters(bounds, zoom);
    }, [clusterIndex, bounds, zoom]);


    return {clusterIndex, clusters};
}
