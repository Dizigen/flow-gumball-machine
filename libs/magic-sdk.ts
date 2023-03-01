import { Magic } from "magic-sdk";
import { FlowExtension } from '@magic-ext/flow';
import { WebAuthnExtension } from '@magic-ext/webauthn';

const MagicPublicApiKey = 'pk_live_C25C66046040A78A';

export function getMagicInstance () {
    const client = new Magic(MagicPublicApiKey, {
        extensions: [
          new FlowExtension({
            rpcUrl: 'https://rest-testnet.onflow.org',
            network: 'testnet' // testnet or mainnet to connect different network
          }),
          new WebAuthnExtension()
        ],
      });
    (window as any).magicClient = client;
    return client;
}
