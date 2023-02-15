import { IS_CLIENT } from "@/config/env";
import { Magic } from "magic-sdk";
import Web3 from "web3";

const MagicPublicApiKey = 'pk_live_C25C66046040A78A';

export function getMagicInstance () {
    const client = new Magic(MagicPublicApiKey);
    (window as any).magicClient = client;
    return client;
}
