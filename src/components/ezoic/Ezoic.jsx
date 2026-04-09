export function PlaceHolders({ID}) {

    if (process.env.NODE_ENV === 'development') return <div>EZOIC-{ID}</div>;

    return <>
        <div id={"ezoic-pub-ad-placeholder-" + ID}></div>
        {/*<script>*/}
        {/*    ezstandalone.cmd.push(function () {*/}
        {/*        ezstandalone.showAds(ID)*/}
        {/*    });*/}
        {/*</script>*/}
    </>;

}