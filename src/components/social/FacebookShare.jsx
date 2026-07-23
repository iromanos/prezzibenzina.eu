'use client'
export default function FacebookShare({url, layout = 'button', size = 'large'}) {


    return <div className="fb-share-button"
                data-href={url}
                data-size={size}
                data-layout={layout}/>

}