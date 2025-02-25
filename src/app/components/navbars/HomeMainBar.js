"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./styles/HomeMainBar.module.css";
import HitmakrLogoBW from "@/../public/svgs/creatives/HitmakrLogoBW.svg";
import "@flaticon/flaticon-uicons/css/all/all.css";
import { usePathname } from "next/navigation";
import RouterPushLink from "@/app/helpers/RouterPushLink";
import { useAccount } from "wagmi";
import ProfileBar from "./subcomponents/ProfileBar";
import GenerateDp from "@/app/helpers/profile/GenerateDP";
import {
  useHasProfile,
  useNameByAddress,
} from "@/app/config/hitmakrprofiles/hitmakrProfilesRPC";
import LayoutStore from "@/app/config/store/LayoutStore";
import { useRecoilState } from "recoil";
import LoaderWhiteSmall from "../animations/loaders/loaderWhiteSmall";
import HitmakrMiniModal from "../modals/HitmakrMiniModal";
import Link from "next/link";
import GlobalSearch from "../search/search";
import ThirdPartyLinkFunction from "@/app/helpers/ThirdPartyLinkFunction";

export default function HomeMainBar() {
  const [isProfileBarOpen, setProfileBarOpen] = useState(false);
  const profileBarRef = useRef(null);
  const pathname = usePathname();
  const {
    address,
    isConnected,
    status: accountStatus,
    isDisconnected,
  } = useAccount();
  const { hasProfile, loading: profileLoading } = useHasProfile(address);
  const { name: username, loading: nameLoading } = useNameByAddress(address);
  const isActive = (path) => pathname.startsWith(path);
  const isActiveHome = (path) => pathname === path;
  const { routeTo, isRouterLinkOpening } = RouterPushLink();
  const [layoutMetadata, setLayoutMetadata] = useRecoilState(
    LayoutStore.LayoutMetadata
  );
  const [modalState, setModalState] = useState({
    show: false,
    title: "",
    description: "",
  });
  const {handleThirdPartyLink} = ThirdPartyLinkFunction();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileBarRef.current &&
        !profileBarRef.current.contains(event.target) &&
        isProfileBarOpen
      ) {
        setProfileBarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileBarOpen]);

  const handleSideBarMobileProfile = () => {
    if (isActive("/profile")) {
      setLayoutMetadata({
        ...layoutMetadata,
        isProfileBarActive: !layoutMetadata.isProfileBarActive,
      });
    } else {
      routeTo("/profile");
      setLayoutMetadata({
        ...layoutMetadata,
        isProfileBarActive: !layoutMetadata.isProfileBarActive,
      });
    }
  };

  const handleSideBarMobileLibrary = () => {
    if (isActive("/playlist")) {
      setLayoutMetadata({
        ...layoutMetadata,
        isLibraryBarActive: !layoutMetadata.isLibraryBarActive,
      });
    } else {
      routeTo("/playlist");
      setLayoutMetadata({
        ...layoutMetadata,
        isLibraryBarActive: !layoutMetadata.isLibraryBarActive,
      });
    }
  };

  const renderUserOptions = () => {
    if (isConnected &&  hasProfile && username) {
      return (
        <div className={styles.mainbarRightOption}>
          <span
            onClick={() => handleThirdPartyLink("https://portal.skale.space/bridge?from=mainnet&to=elated-tan-skat&token=usdc&type=erc20")}
            className={styles.mainbarRightOptionCreate}
          >
            <i
              className={`fi ${
                isActive("")
                  ? `fi-br-dollar`
                  : `fi-rr-dollar`
              }`}
            ></i>
          </span>

          <span onClick={() => setProfileBarOpen(!isProfileBarOpen)}>
            <GenerateDp seed={address} width={100} height={100} />
          </span>
        </div>
      );
    }
    return (
      <div className={styles.mainbarRightOptionPill}>
        <span onClick={() => routeTo("/auth")} className={styles.signInButton}>
          Join
        </span>
      </div>
    );
  };

  if (!isActiveHome("/auth")) {
    return (
      <>
        <div className={styles.mainbar}>
          <div className={styles.mainbarLeft}>
            <Link href={"/"}>
              <HitmakrLogoBW />
            </Link>
          </div>
          <div className={styles.mainbarCenter}>
            <div className={styles.mainbarCenterOption}>
              <span onClick={() => routeTo("/")}>
                <i
                  className={`fi ${
                    isActiveHome("/") ? `fi-sr-home` : `fi-rr-home`
                  }`}
                ></i>
              </span>
            </div>
            <GlobalSearch />
            <div
              className={styles.mainbarCenterOption}
              style={{
                marginLeft: "8px",
              }}
            >
              <span onClick={() => routeTo("/explore")}>
                <i
                  className={`fi ${
                    isActiveHome("/explore") ? `fi-br-globe` : `fi-rr-globe`
                  }`}
                ></i>
              </span>
            </div>
          </div>
          <div className={styles.mainbarRight}>{renderUserOptions()}</div>
        </div>
        {isProfileBarOpen &&
          isConnected &&
          hasProfile &&
          username && (
            <ProfileBar
              isOpen={isProfileBarOpen}
              profileBarRef={profileBarRef}
              nameData={username}
            />
          )}
        <div className={styles.mainMobileBar}>
          <div className={styles.mainMobileBarOptions}>
            <div
              className={styles.mainMobileBarOption}
              onClick={() => routeTo("/")}
            >
              <span>
                <i
                  className={`fi ${
                    isActiveHome("/") ? `fi-sr-home` : `fi-rr-home`
                  }`}
                ></i>
              </span>
              <span>
                <p>Home</p>
              </span>
            </div>

            {isConnected &&  hasProfile && username && (
              <>
                <div
                  className={styles.mainMobileBarOption}
                  onClick={() => handleSideBarMobileLibrary()}
                >
                  <span>
                    <i
                      className={`fi ${
                        isActive("/playlist")
                          ? `fi-sr-followcollection`
                          : `fi-rr-followcollection`
                      }`}
                    ></i>
                  </span>
                  <span>
                    <p>Library</p>
                  </span>
                </div>
              </>
            )}

            <div
              className={styles.mainMobileBarOption}
              onClick={() => routeTo("/profile/create")}
            >
              <span>
                <i
                  className={`fi ${
                    isActive("/profile/create") ? `fi-sr-add` : `fi-rr-add`
                  }`}
                ></i>
              </span>
              <span>
                <p>Create</p>
              </span>
            </div>

            {isConnected &&  hasProfile && username && (
              <div
                className={styles.mainMobileBarOption}
                onClick={() => handleSideBarMobileProfile()}
              >
                <span>
                  <i
                    className={`fi ${
                      isActive("/profile") && !isActive("/profile/create")
                        ? `fi-sr-user`
                        : `fi-rr-user`
                    }`}
                  ></i>
                </span>
                <span>
                  <p>Profile</p>
                </span>
              </div>
            )}

            <div
              className={styles.mainMobileBarOption}
              onClick={() => routeTo("/explore")}
            >
              <span>
                <i
                  className={`fi ${
                    isActive("/explore") ? `fi-br-globe` : `fi-rr-globe`
                  }`}
                ></i>
              </span>
              <span>
                <p>Explore</p>
              </span>
            </div>
          </div>
        </div>

        <>
          {modalState.show && (
            <HitmakrMiniModal
              title={modalState.title}
              description={modalState.description}
              closeButton={<i className="fi fi-br-cross-small"></i>}
              closeFunction={() =>
                setModalState({
                  show: false,
                  title: "",
                  description: "",
                })
              }
              isAction={true}
            />
          )}
        </>
      </>
    );
  }

  return null;
}
