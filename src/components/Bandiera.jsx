import "flag-icons/css/flag-icons.min.css";

export default function Bandiera({sigla}) {

    return <span className={`fi fi-${sigla.toLowerCase()}`}></span>;

}