import Header from "@/components/Header";
import RegionePage from "@/app/prezzi/[regione]/page";


export default async function CarburantePage({params, searchParams}){
    return <>
        <RegionePage params={params} searchParams={searchParams} />
    </>
}