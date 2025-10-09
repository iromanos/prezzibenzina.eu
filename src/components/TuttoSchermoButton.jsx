import FullscreenIcon from '@mui/icons-material/Fullscreen';

export default function TuttoSchermoButton({onClick}) {


    return <div

        className={'d-flex align-items-end justify-content-between position-absolute m-3 z-3 end-0 bottom-0'}>
        <button
            onClick={onClick}
            title={'Visualizza a tutto schermo'}
            type={'button'}
            style={{
                width: 56,
                height: 56
            }}
            className="btn btn-light shadow-sm
                    border border-dark-subtle
                    d-flex align-items-center justify-content-center
                    rounded-circle "
        ><FullscreenIcon/></button>

    </div>
}