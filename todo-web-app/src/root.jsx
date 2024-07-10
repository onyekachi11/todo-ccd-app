import { TESTNET, WithWalletConnector } from "@concordium/react-components";
// import React from "react";
import App from "./App";

const Root = () => {
  return (
    <WithWalletConnector network={TESTNET}>
      {(props) => <App {...props} />}
    </WithWalletConnector>
  );
};

export default Root;
