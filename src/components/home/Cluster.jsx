import {Marker} from "react-map-gl/maplibre";
import ImpiantoMarker from "@/components/impianti/ImpiantoMarker";
import {log} from "@/functions/helpers";
import {useEffect, useState} from "react";

export default function Cluster({clusters = [], onClusterClick, fadeOut}) {
    return clusters.map((c, i) => {

        const isCluster = c.properties.cluster;

        return isCluster ?
            <MarkerCluster
                fadeOut={fadeOut}
                key={i} c={c}/>
            : <ImpiantoMarker
                fadeOut={fadeOut}
                key={i} d={c.properties}/>
    });
}

function MarkerCluster({c, fadeOut}) {

    const [lng, lat] = c.geometry.coordinates;
    const isCluster = c.properties.cluster;
    const count = c.properties.point_count;

    const size = Math.min(120, (Math.log2(count) * 24) + 24);

    if (!isCluster) {
        log(c.properties);
    }

    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (fadeOut) return;
        const timeout = setTimeout(() => setAnimate(true), 10); // piccolo delay
        return () => clearTimeout(timeout);
    }, []);


    return <Marker longitude={lng} latitude={lat}>
        <div

            style={{
                width: size,
                height: size,
            }}

            className={`d-flex align-items-center justify-content-center bg-success 
                            cluster-marker
                            ${fadeOut ? 'exit' : ''}  ${animate ? 'animate-in' : ''}
                            text-white bg-opacity-50 rounded-circle border border-2 border-white`}
            //title={isCluster ? `${count} impianti` : c.properties.brand}
            onClick={() => {
                onClusterClick(c);
            }}
        >
            {count}
        </div>
    </Marker>;

}