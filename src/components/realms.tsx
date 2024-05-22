"use client";

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from "@/constants/programs";
import { useQuery } from "@tanstack/react-query";
import { fetchRealms } from "@/app/api/realm/queries";
import { realmsJson, splRepo } from "@/constants/other";
import { PublicKey } from "@solana/web3.js";
import { RealmInfo } from "@/types/realm";
import { ProgramAccount, Realm } from "@solana/spl-governance";
import React, { useMemo } from "react";

export function Realms() {
  const { data, isLoading } = useQuery({
    queryKey: ["realms", DEFAULT_GOVERNANCE_PROGRAM_ID],
    queryFn: async () => await fetchRealms(DEFAULT_GOVERNANCE_PROGRAM_ID),
    staleTime: 3600000, // 1 hour
  });

  // fetch a json file from a public github repo
  const { data: repoData, isLoading: isRepoLoading } = useQuery({
    queryKey: ["githubRepoData"],
    queryFn: async () => {
      const response = await fetch(splRepo + realmsJson);
      if (!response.ok) {
        throw new Error("Could not fetch realms from repo");
      }
      return response.json();
    },
    staleTime: 3600000, // 1 hour
  });

  const combinedData = useMemo(() => {
    if (!data || !repoData) return [];

    return repoData
      .map((realmInfo: RealmInfo) => {
        const onChainMatch: ProgramAccount<Realm> | undefined = JSON.parse(
          data
        ).find((onChain: ProgramAccount<Realm>) =>
          new PublicKey(onChain.pubkey).equals(new PublicKey(realmInfo.realmId))
        ); // Corrected PublicKey comparison using .equals method

        if (!onChainMatch) {
          console.error(
            `No on-chain match found for realm ID: ${realmInfo.realmId}`
          );
          return null;
        }

        console.log(onChainMatch);
        return {
          name: onChainMatch.account.name || realmInfo.displayName,
          image: realmInfo.bannerImage
            ? `${splRepo}${realmInfo.bannerImage}`
            : realmInfo.ogImage,
        };
      })
      .filter(Boolean); // Filter out null entries
  }, [data, repoData]);

  return (
    <main>
      {combinedData.length}
      {/* {JSON.stringify(combinedData)} */}
      {/* {JSON.stringify(repoData)} */}{" "}
      {isLoading || isRepoLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {combinedData
            .filter((realm) => realm.image)
            .map((realm) => (
              <li key={realm.pubkey}>
                <img
                  src={realm.image}
                  alt={realm.name}
                  width={100}
                  height={100}
                />
                <span>{realm.name}</span>
              </li>
            ))}
        </ul>
      )}
    </main>
  );
}
