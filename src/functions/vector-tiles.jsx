export function getVectorTileLayer() {
    const apiKey = "9441d3ae-fe96-489a-8511-2b1a3a433d29";
    const styleUrlStadia = "https://tiles.stadiamaps.com/styles/outdoors.json?api_key=" + apiKey;
    const styleUrlCartoCdn = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
    return styleUrlCartoCdn;
}
