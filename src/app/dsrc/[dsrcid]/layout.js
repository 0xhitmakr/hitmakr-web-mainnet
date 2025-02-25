import React from "react";
import DSRCView from "@/app/profile/components/releases/components/DSRCView";
import styles from "../styles/DSRCStyles.module.css";
import { getDSRCAddressServer } from "@/app/config/hitmakrdsrcfactory/hitmakrDSRCFactoryRPCServer";
import { getDSRCDetailsServer } from "@/app/config/hitmakrdsrc/hitmakrDSRCRPCServer";
import axios from "axios";
import DSRCAnalytics from "./page";
import DSRCComments from "./comments/page";

export async function generateMetadata({ params }) {
  const { dsrcid } = params;

  try {
    const dsrcAddress = await getDSRCAddressServer(dsrcid);

    const { details, metadata } = await getDSRCDetailsServer(dsrcAddress);

    if (!details || !metadata) {
      return {
        title: "DSRC Not Found | Hitmakr",
        description: "The requested DSRC could not be found on Hitmakr.",
      };
    }

    const getDuration = () =>
      metadata.attributes?.find((attr) => attr.trait_type === "Duration")
        ?.value || "N/A";
    const getGenre = () =>
      metadata.attributes?.find((attr) => attr.trait_type === "Genre")?.value ||
      "";
    const getCategory = () =>
      metadata.attributes?.find((attr) => attr.trait_type === "Category")
        ?.value || "";

    return {
      title: `${metadata.name || "DSRC"} | Hitmakr`,
      description:
        metadata.description ||
        "Listen to this track on Hitmakr - Web3's Revolutionary Music Platform",
      openGraph: {
        title: metadata.name,
        description: `${
          metadata.description
        }\nDuration: ${getDuration()}\nGenre: ${getGenre()}`,
        url: `https://app.hitmakr.io/dsrc/${dsrcid}`,
        siteName: "Hitmakr",
        images: [
          {
            url: metadata.image.includes("undefined")
              ? `https://api.dicebear.com/9.x/shapes/svg?seed=${dsrcid}`
              : metadata.image,
            width: 1200,
            height: 1200,
            alt: `${metadata.name} on Hitmakr`,
          },
        ],
        locale: "en_US",
        type: "music.song",
        music: {
          duration: getDuration(),
          musician: details.creator,
          album: "Single",
          genre: getGenre(),
        },
      },
      twitter: {
        card: "summary_large_image",
        title: metadata.name,
        description: metadata.description,
        site: "@hitmakrr",
        images: [
          metadata.image.includes("undefined")
            ? `https://api.dicebear.com/9.x/shapes/svg?seed=${dsrcid}`
            : metadata.image,
        ], // Updated this line
        creator: "@hitmakrr",
      },
      keywords: [
        "Hitmakr",
        "Web3 Music",
        "Music NFT",
        getGenre(),
        getCategory(),
        "Blockchain Music",
        "Digital Music",
        metadata.name,
      ].filter(Boolean),
      alternates: {
        canonical: `https://app.hitmakr.io/dsrc/${dsrcid}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "DSRC | Hitmakr",
      description:
        "Explore music on Hitmakr - Web3's Revolutionary Music Platform",
    };
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_HITMAKR_SERVER;

export default async function DSRCIdLayout({ params }) {
  const { dsrcid } = params;
  const res = await axios.get(`${API_BASE_URL}/song/dsrc/${dsrcid}`);

  return (
    <>
      <div className={styles.dsrcHeader}>
        <div className={styles.dsrcHeading}>
          <p>{dsrcid}</p>
        </div>
      </div>
      <div className={styles.dsrcItem}>
        <DSRCView
          dsrcid={dsrcid}
          songId={res?.data?._id || ""}
          hashTags={res?.data?.hashTags}
        />
      </div>
      <DSRCAnalytics
        data={{
          id: res.data?._id,
          image: res.data.metadata?.image,
          name: res.data.metadata?.name,
          creator: res.data.metadata?.creator,
          dsrcid,
        }}
        params={params}
      />  
      <DSRCComments />
    </>
  );
}
