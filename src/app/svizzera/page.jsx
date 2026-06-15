import {redirect} from "next/navigation";

export default async function Page({params}) {

    const request = await params;

    request.stato = "svizzera";

    redirect(`/svizzera/benzina`);
}