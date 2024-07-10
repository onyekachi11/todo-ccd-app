import {
  BrowserWalletConnector,
  CONCORDIUM_WALLET_CONNECT_PROJECT_ID,
  persistentConnectorType,
  WalletConnectConnector,
} from "@concordium/react-components";

export const DEFAULT_CONTRACT_INDEX = BigInt(9520);
export const MAX_CONTRACT_EXECUTION_ENERGY = BigInt(30000);
export const PING_INTERVAL_MS = 5000;

const WALLET_CONNECT_OPTS = {
  projectId: CONCORDIUM_WALLET_CONNECT_PROJECT_ID,
  metadata: {
    name: "TodoApp",
    description: "Example dApp",
    url: "#",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
};

export const BROWSER_WALLET = persistentConnectorType(
  BrowserWalletConnector.create
);
export const WALLET_CONNECT = persistentConnectorType(
  WalletConnectConnector.create.bind(this, WALLET_CONNECT_OPTS)
);
