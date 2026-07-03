import React from "react";
import {getMetadata} from "@/functions/helpers";
import DistributoriPage, {getPageParams} from "@/components/DistributoriPage";

export const revalidate = 300;

export async function generateMetadata({params, searchParams}) {
    const record = await getPageParams({params, searchParams});
    return getMetadata({params: Promise.resolve(record)});
}

export default async function ComunePage({params, searchParams}) {
    const record = await getPageParams({params, searchParams});
    return <DistributoriPage params={record}/>
}