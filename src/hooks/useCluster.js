import Supercluster from 'supercluster';
import {useMemo} from 'react';


function getClusterOptions(count) {
    const radius = Math.min(100, 30 + Math.log10(count) * 20);
    const maxZoom = Math.max(10, 16 - Math.log10(count));
    return {radius: Math.round(radius), maxZoom: Math.round(maxZoom)};
}

export function useCluster(points, zoom, bounds) {


    const clusterIndex = useMemo(() => {

        if (!points || points.length === 0) return null;
        const {radius, maxZoom} = getClusterOptions(points.length);

        const index = new Supercluster({
            radius: radius,
            maxZoom: maxZoom
        });
        index.load(points);
        return index;
    }, [points]);

    const clusters = useMemo(() => {
        if (!clusterIndex || !bounds) return [];
        return clusterIndex.getClusters(bounds, zoom);
    }, [clusterIndex, bounds, zoom]);


    return {clusterIndex, clusters};
}
