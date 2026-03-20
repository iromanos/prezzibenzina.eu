import React, {useState} from 'react';
import {motion} from 'framer-motion';

const BottomSheet = () => {
    const [step, setStep] = useState(0);

    // Altezze calcolate per non rompere il layout
    const variants = {
        0: {y: "calc(100% - 80px)"}, // Peek
        1: {y: "50%"},               // Half
        2: {y: "200px"},              // Full
    };

    const nextStep = () => setStep((s) => (s + 1) % 3);

    return (
        // 1. Container fisso che NON intercetta i click (pointer-events-none)
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden font-sans">

            {/* 2. Overlay opzionale per chiudere */}
            {step > 0 && (
                <div
                    className="absolute inset-0 bg-black pointer-events-auto"
                    onClick={() => setStep(0)}
                />
            )}

            {/* 3. Il Foglio: pointer-events-auto per riabilitare i click solo qui */}
            <motion.div
                animate={step}
                variants={variants}
                transition={{type: "spring", damping: 25, stiffness: 250}}
                className="absolute inset-x-0 bottom-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[24px] pointer-events-auto flex flex-col"
                style={{
                    height: '100vh',
                    top: 0,
                    willChange: "transform" // Ottimizza il rendering in Chrome
                }}
            >

                {/* HEADER: Area cliccabile per cambiare step */}
                <div
                    onClick={nextStep}
                    className="w-full pt-3 pb-5 flex flex-col items-center cursor-pointer shrink-0 border-b border-gray-100 bg-white rounded-t-[24px]"
                >
                    <div className="w-10 h-1 bg-gray-300 rounded-full mb-4"/>
                    <div className="w-full px-6 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Distributori (25)</h2>
                        <div
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 font-bold">
                            {step === 2 ? "✕" : "↑"}
                        </div>
                    </div>
                </div>

                {/* CONTENUTO: Il div che DEVE scrollare */}
                <div
                    className="flex-1 overflow-y-scroll" // Usiamo overflow-y-scroll per forzare la scrollbar
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        /* Rimuoviamo ogni possibile interferenza di pointer events */
                        pointerEvents: 'auto',
                        /* Assicuriamoci che il div sia alto abbastanza per scrollare */
//                        height: '100%',
                        paddingBottom: '100px'
                    }}
                >
                    <div className="px-6">
                        {Array.from({length: 40}).map((_, i) => (
                            <div key={i} className="py-5 border-b border-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">Distributore Roma Est</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Benzina
                                            • 1.649€</p>
                                    </div>
                                </div>
                                <div className="text-right text-xs font-mono text-gray-400">
                                    {1.2 + i}km
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default BottomSheet;