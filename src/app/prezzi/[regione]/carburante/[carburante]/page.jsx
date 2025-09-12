import Header from "@/components/Header";
import RegionePage from "@/app/prezzi/[regione]/page";


export default async function CarburantePage({params}){
    return <>
        <RegionePage params={params} />
    </>
}