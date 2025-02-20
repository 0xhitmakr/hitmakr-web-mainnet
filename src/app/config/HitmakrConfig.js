"use client"

import React from "react";
import { RecoilRoot } from "recoil";
import AppKitProvider from "./appkit/AppkitProvider";
import CampAuthProvider from "./camp/CampAuthProvider";
import { CampProvider } from "@campnetwork/sdk/react";
import MusicPlayerProvider from "./audio/MusicPlayerProvider";

export default function HitmakrConfig({ children }) {
    return (
        <>
            <AppKitProvider>
                <RecoilRoot>
                    <CampProvider clientId="47153d72-6161-493f-89c2-6d63f4452656">
                        <CampAuthProvider>
                            <MusicPlayerProvider>
                                { children }
                            </MusicPlayerProvider>
                        </CampAuthProvider>
                    </CampProvider>
                </RecoilRoot>
            </AppKitProvider>
        </>
    );
}
