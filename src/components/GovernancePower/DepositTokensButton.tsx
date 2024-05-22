import { BigNumber } from "bignumber.js";
import BN from "bn.js";
import { Button, ButtonProps } from "../ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMintInfo, useUserGovTokenAccount } from "@/app/api/token/hooks";
import { useEffect, useState } from "react";
import { useRealmFromParams } from "@/app/api/realm/hooks";
import { useGoverningTokenMint } from "@/app/api/token/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export const DepositTokensButton = ({
  role,
  ...props
}: { role: "community" | "council" } & Omit<
  ButtonProps,
  "onClick" | "tooltipMessage"
>) => {
  const { wallet } = useWallet();
  const connected = !!wallet?.adapter.connected;

  const userAta = useUserGovTokenAccount(role).data;
  const depositAmount = userAta?.amount
    ? new BigNumber(userAta.amount.toString())
    : new BigNumber(0);

  const hasTokensInWallet = depositAmount.isGreaterThan(0);
  const depositTooltipContent = !connected
    ? "Connect your wallet to deposit"
    : !hasTokensInWallet
    ? "You don't have any governance tokens in your wallet to deposit."
    : undefined;

  const [openModal, setOpenModal] = useState(false);
  const mint = useGoverningTokenMint(role);
  const mintInfo = useMintInfo(mint).data;

  const humanReadableMax =
    mintInfo === undefined
      ? undefined
      : depositAmount.shiftedBy(-mintInfo.decimals).toNumber();

  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (humanReadableMax && humanReadableMax > 0)
      setAmount(humanReadableMax ? humanReadableMax.toString() : "");
  }, [humanReadableMax]);

  // const deposit = useDepositCallback(role);

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  {...props}
                  disabled={!connected || !hasTokensInWallet || props.disabled}
                >
                  Deposit
                </Button>
              </TooltipTrigger>
              <TooltipContent>{depositTooltipContent}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogTrigger>
        <DialogContent>
          <div className="flex flex-col gap-y-4">
            <h2>Deposit tokens</h2>
            <label>
              Amount to deposit
              <span>
                &nbsp;-&nbsp;
                <a
                  href="#"
                  onClick={() => {
                    setAmount(
                      humanReadableMax ? humanReadableMax.toString() : ""
                    );
                  }}
                >
                  Max
                </a>
              </span>
            </label>
            <Input
              placeholder={humanReadableMax?.toString() + " (max)"}
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              max={humanReadableMax}
            />
            <Button
              onClick={async () => {
                if (mintInfo === undefined) throw new Error();
                // max is the placeholder, so deposit the maximum amount if no value is input
                const nativeAmount =
                  amount === ""
                    ? new BN(depositAmount.toString())
                    : new BN(
                        new BigNumber(amount)
                          .shiftedBy(mintInfo.decimals)
                          .toString()
                      );
                // TODO add deposit flow
                // await deposit(nativeAmount);
                setOpenModal(false);
              }}
              disabled={
                humanReadableMax !== undefined &&
                (parseFloat(amount) > humanReadableMax ||
                  parseFloat(amount) <= 0)
              }
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
