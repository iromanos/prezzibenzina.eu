import React from "react";
import axios from "axios";

const URI = "http://localhost:8080/pb/";
// ✅ Fetch lato server
export async function getDistributoriRegione(regione, carburante, marchioSelezionato) {

    let fuel = '';
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';

    let request = URI + "prezzi/r/" + regione + "/" + fuel;
    if (marchioSelezionato != null) {
        request += "?marchio=" + marchioSelezionato;
    }

    const res = await axios.get(request);

    console.log(res.data);

    return res.data;
}
export async function getSeoRegione(regione, carburante) {

    let fuel = '';
    if (carburante === 'benzina') fuel = '1-x';
    if (carburante === 'diesel') fuel = '2-x';
    if (carburante === 'metano') fuel = '3-x';
    if (carburante === 'gpl') fuel = '4-x';

    const res = await axios.get(URI + "seo/regione/" + regione + "/" + fuel);

    console.log(res.data);

    return res.data;

}
