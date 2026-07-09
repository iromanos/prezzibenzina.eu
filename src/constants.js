import {BsCreditCard, BsCupHot, BsDroplet, BsPCircle, BsPersonWheelchair, BsTools, BsWater} from 'react-icons/bs';
import {FaBaby, FaCarSide, FaChargingStation, FaWifi} from 'react-icons/fa6';


export const URI_IMAGE = process.env.NEXT_PUBLIC_API_ENDPOINT;


export const SERVIZI_ICON_COMPONENTS = {
    'bi bi-cup-hot': BsCupHot,
    'bi bi-tools': BsTools,
    'bi bi-p-circle': BsPCircle,
    'bi bi-water': BsWater,
    'fa-solid fa-baby': FaBaby,
    'bi bi-credit-card': BsCreditCard,
    'bi-person-wheelchair': BsPersonWheelchair,
    'fa-solid fa-wifi': FaWifi,
    'fa-solid fa-car-side': FaCarSide,
    'bi bi-droplet': BsDroplet,
    'fa-solid fa-charging-station': FaChargingStation,
};
