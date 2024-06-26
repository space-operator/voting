"use client";

import { BigNumber } from "bignumber.js";
import { useMemo } from "react";

import { useConnection } from "@solana/wallet-adapter-react";

import { useAsync } from "react-async-hook";
import BN from "bn.js";
// import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore';

import { GoverningTokenType } from "@solana/spl-governance";

import { useRealmFromParams } from "@/app/api/realm/hooks";
import { useRealmConfig } from "@/app/api/realmConfig/hooks";
import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
  useVanillaGovpower,
} from "@/app/api/tokenOwnerRecord/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  ExclamationTriangleIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { useTokenOwnerRecordsDelegatedToUser } from "@/app/api/tokenOwnerRecord/hooks";
import { abbreviateAddress, getPct } from "@/utils/formatting";
import { useMintInfo, useTokenMetadata } from "@/app/api/token/hooks";
import { cn } from "@/lib/utils";
import { getVanillaGovpower } from "@/app/api/tokenOwnerRecord/queries";
import { useAtomValue } from "jotai";
import {
  communityDelegatorAtom,
  councilDelegatorAtom,
} from "../SelectPrimaryDelegators";
import { PublicKey } from "@solana/web3.js";

interface Props {
  className?: string;
  role: "community" | "council";
  hideIfZero?: boolean;
  unrecognizedPlugin?: boolean;
  children?: React.ReactNode;
}

export default function VanillaVotingPower({
  role,
  hideIfZero,
  children,
  unrecognizedPlugin = false,
  ...props
}: Props) {
  const realm = useRealmFromParams().data;
  const realmConfig = useRealmConfig().data;

  const { data: communityTOR } = useAddressQuery_CommunityTokenOwner();
  const { data: councilTOR } = useAddressQuery_CouncilTokenOwner();
  const { connection } = useConnection();

  const relevantTOR = role === "community" ? communityTOR : councilTOR;
  const relevantMint =
    role === "community"
      ? realm?.account.communityMint
      : realm?.account.config.councilMint;

  const mintInfo = useMintInfo(relevantMint).data;

  const personalAmount = useVanillaGovpower(relevantTOR);

  // If the user is using a delegator, we want to show that and not count the other delegators
  const selectedDelegator = useAtomValue(
    role === "community" ? communityDelegatorAtom : councilDelegatorAtom
  );

  const { data: torsDelegatedToUser } = useTokenOwnerRecordsDelegatedToUser();

  const { result: delegatorsAmount } = useAsync(
    async () =>
      selectedDelegator !== PublicKey.default
        ? new BN(0)
        : torsDelegatedToUser === undefined || relevantMint === undefined
        ? undefined
        : (
            await Promise.all(
              torsDelegatedToUser
                .filter((x) =>
                  x.account.governingTokenMint.equals(relevantMint)
                )
                .map((x) => getVanillaGovpower(connection, x.pubkey))
            )
          ).reduce((partialSum, a) => partialSum.add(a), new BN(0)),
    [connection, relevantMint, selectedDelegator, torsDelegatedToUser]
  );

  const totalAmount = (delegatorsAmount ?? new BN(0)).add(
    personalAmount ?? new BN(0)
  );

  const formattedTotal = useMemo(
    () =>
      mintInfo && totalAmount !== undefined
        ? new BigNumber(totalAmount.toString())
            .shiftedBy(-mintInfo.decimals)
            .toString()
        : undefined,
    [totalAmount, mintInfo]
  );

  const formattedDelegatorsAmount = useMemo(
    () =>
      mintInfo && delegatorsAmount !== undefined
        ? new BigNumber(delegatorsAmount.toString())
            .shiftedBy(-mintInfo.decimals)
            .toString()
        : undefined,
    [delegatorsAmount, mintInfo]
  );

  // TODO check, using Jupiter token list on Realm
  // const tokenMetadata =
  const tokenName = realm?.account.name ?? "";

  const disabled =
    role === "community"
      ? realmConfig?.account.communityTokenConfig.tokenType ===
        GoverningTokenType.Dormant
      : realmConfig?.account.councilTokenConfig.tokenType ===
        GoverningTokenType.Dormant;

  return (
    <div
      className={cn(
        props.className,
        hideIfZero && totalAmount.isZero() && "hidden",
        disabled && "hidden"
      )}
    >
      {unrecognizedPlugin && (
        <div className="flex text-sm  text-orange mb-1">
          <ExclamationTriangleIcon className="flex-shrink-0 h-5 w-5 mr-2" />
          Unrecognized plugin
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <QuestionMarkCircledIcon className="cursor-help h-5 ml-1 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                This DAO uses an unrecognised vote weight plugin - your vote
                weight may be shown incorrectly in the UI
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <div className={"p-3 rounded-md bg-bkg-1"}>
        <div className="text-fgd-3 text-xs">
          {tokenName}
          {role === "council" ? " Council" : ""} votes
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className=" flex flex-row gap-x-2">
            <div className="text-xl font-bold text-fgd-1 hero-text">
              {formattedTotal ?? 0}
            </div>
            <div className="text-xs text-fgd-3">
              {selectedDelegator !== PublicKey.default ? (
                // if we're acting as a specific delegator, show that instead of the delegator aggregation
                <>(as {abbreviateAddress(selectedDelegator)})</>
              ) : formattedDelegatorsAmount !== undefined &&
                formattedDelegatorsAmount !== "0" ? (
                <>({formattedDelegatorsAmount} from delegators)</>
              ) : null}
            </div>
          </div>

          {mintInfo && (
            <VotingPowerPct
              amount={new BigNumber(totalAmount.toString())}
              total={new BigNumber(mintInfo.supply.toString())}
            />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

interface VotingPowerPctProps {
  className?: string;
  amount: BigNumber;
  total: BigNumber;
}

export function VotingPowerPct(props: VotingPowerPctProps) {
  return (
    <div
      className={cn(
        props.className,
        "leading-[15px]",
        "text-xs",
        "text-right",
        "text-fgd-2"
      )}
    >
      {getPct(props.amount, props.total)}% of total
    </div>
  );
}
