"use client"

import Link from "next/link"
import Image from "next/image";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export const AuthLayout = ({ children } : { children: React.ReactNode }) => {
    const vantaRef = useRef<HTMLDivElement>(null);
    const vantaEffect = useRef<any>(null);
    const [threeLoaded, setThreeLoaded] = useState(false);
    const [vantaLoaded, setVantaLoaded] = useState(false);

    useEffect(() => {
        if (!vantaRef.current || !threeLoaded || !vantaLoaded) return;

        // Initialize Vanta effect
        if (!(window as any).VANTA) return;

        vantaEffect.current = (window as any).VANTA.DOTS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0xe05d38,
            color2: 0xe05d38,
            size: 6.60,
            spacing: 48.00
        });

        // Cleanup function
        return () => {
            if (vantaEffect.current) {
                vantaEffect.current.destroy();
            }
        };
    }, [threeLoaded, vantaLoaded]);

    return (
        <>
            <Script 
                src="/three.r134.min.js" 
                strategy="afterInteractive"
                onLoad={() => setThreeLoaded(true)}
            />
            <Script 
                src="/vanta.dots.min.js" 
                strategy="afterInteractive"
                onLoad={() => setVantaLoaded(true)}
            />
            <div className="flex flex-row min-h-screen">
                <div ref={vantaRef} className="flex-1 relative min-h-screen bg-muted" />
                <div className="bg-muted flex-1 flex min-h-screen flex-col justify-center items-center gap-6 p-6 md:p-10">
                    <div className="flex w-full max-w-sm flex-col gap-6">
                        <Link href="/" className="flex items-center gap-2 self-center font-medium">
                            <Image alt="AutoFlow" src="logos/logo.svg" width={30} height={30} />
                            AutoFlow
                        </Link>
                        {children}
                    </div>
                </div>  
            </div>
        </>
    )
}