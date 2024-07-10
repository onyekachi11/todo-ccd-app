/* eslint-disable react/prop-types */
// import { useState } from "react";
import {
  useConnect,
  useConnection,
  useGrpcClient,
} from "@concordium/react-components";
import {
  BROWSER_WALLET,
  DEFAULT_CONTRACT_INDEX,
  MAX_CONTRACT_EXECUTION_ENERGY,
} from "./config";
import "./App.css";
import { Buffer } from "buffer/";

import { useEffect, useState } from "react";
import {
  AccountAddress,
  AccountTransactionType,
  ContractAddress,
  ContractName,
  Energy,
  EntrypointName,
  InitName,
  ReceiveName,
  ReturnValue,
  deserializeReceiveReturnValue,
} from "@concordium/web-sdk";
import { decodeReturnValue } from "./decodes";
import { userTodoSchema, versionedSchemaBuffer } from "./schemas/user_todo";
function App(props) {
  const {
    // activeConnectorType,
    setActiveConnectorType,
    // activeConnectorError,
    activeConnector,
    connectedAccounts,
    genesisHashes,
    network,
  } = props;

  const [contract, setContract] = useState();
  // const [schemaRpcError, setSchemaRpcError] = useState("");

  const rpc = useGrpcClient(network);

  const { connection, setConnection, account } = useConnection(
    connectedAccounts,
    genesisHashes
  );
  const { connect } = useConnect(activeConnector, setConnection);

  useEffect(() => {
    setActiveConnectorType(BROWSER_WALLET);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeConnector) {
      // When changing connector, select the first of any existing connections.
      const cs = activeConnector.getConnections();
      if (cs.length) {
        setConnection(cs[0]);
      }
    }
    return () => setConnection(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnector]);

  async function initContract(rpc, index) {
    console.debug(`Refreshing info for contract ${index.toString()}`);
    const info = await rpc.getInstanceInfo(ContractAddress.create(index, 0));
    if (!info) {
      throw new Error(`contract ${index} not found`);
    }

    const { version, name, owner, amount, methods } = info;
    const prefix = "init_";
    if (!InitName.toString(name).startsWith(prefix)) {
      throw new Error(`name "${name}" doesn't start with "init_"`);
    }
    return {
      version,
      index,
      name: ContractName.fromInitName(name),
      amount,
      owner,
      methods,
    };
  }

  function contractUpdatePayload(amount, contracts, method) {
    return {
      amount,
      address: ContractAddress.create(DEFAULT_CONTRACT_INDEX, 0),
      receiveName: ReceiveName.create(
        contracts.name,
        EntrypointName.fromString(method)
      ),
      maxContractExecutionEnergy: Energy.create(MAX_CONTRACT_EXECUTION_ENERGY),
    };
  }

  async function updateContracts() {
    try {
      if (!contract) {
        throw new Error("Contract data not available.");
      }

      const contractPayload = contractUpdatePayload(1, contract, "create_task");
      const contractTransaction = await connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        contractPayload
      );

      console.log("Contract transaction:", contractTransaction);
      return contractTransaction;
    } catch (error) {
      console.error("Error updating contract:", error);
      throw error; // Optional: rethrow the error for handling in the UI or caller
    }
  }

  async function fetchContractData() {
    try {
      const data = await initContract(rpc, DEFAULT_CONTRACT_INDEX);
      setContract(data);
      console.log("Contract data:", data.name.value);
      const { name, index } = data;
      const method = ReceiveName.create(
        name,
        EntrypointName.fromString("get_user_todo")
      );

      const result = await rpc.invokeContract({
        contract: ContractAddress.create(index, 0),
        method,
        invoker: AccountAddress.fromJSON(account),
      });

      console.log("Contract result:", result);
      console.log("Contract data:", data);
      console.log(result.returnValue.buffer);
      console.log(
        ReturnValue.fromBuffer(result.returnValue.buffer.buffer.slice)
      );

      const buffer = Buffer.from(
        ReturnValue.toBuffer(result.returnValue.buffer)
      );
      const buffer2 = Buffer.from(result.returnValue.buffer);

      console.log("Contract data:", buffer);

      const buff = buffer2.buffer;
      // const schemas = userTodoSchema();
      const schemas = versionedSchemaBuffer;
      const names = ContractName.fromString("TodoApp2");
      const entry = EntrypointName.fromString("get_user_todo");

      const values = deserializeReceiveReturnValue(
        buff,
        schemas,
        names,
        entry,
        0
      );

      const datas = deserializeReceiveReturnValue(buffer);
      console.log(datas);

      console.log(values);

      const jsonString = Buffer.from(buffer);
      console.log("Contract data:", jsonString);

      const parsedData = JSON.stringify(jsonString);

      console.log(parsedData);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  }

  useEffect(() => {
    if (rpc && account) {
      fetchContractData();
    }

    return () => {
      // cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpc, account]);

  const subTasks = [
    {
      id: "12345467iuyjhgfdsfvedc",
      description: "Study",
      completed: false,
    },
    {
      id: "12345467iuyjhgfsdcds",
      description: "Eat",
      completed: false,
    },
    {
      id: "12345467iuyjhecdcegfds",
      description: "Eat",
      completed: false,
    },
  ];

  const todos = [
    {
      id: "12345467iuyjhgfds",
      description: "Academic list ",
      tasks: subTasks,
    },
    {
      id: "12345467iuyjhgfd3434",
      description: "Exercise list ",
      tasks: subTasks,
    },
  ];

  return (
    <div className="px-10">
      <h1 className=" text-[40px] font-medium text-center p-10">
        To-do app with concordium block chain
      </h1>

      {!account ? (
        <button
          className="w-[30%] rounded-md bg-gray-800 text-white p-3"
          onClick={connect}
          // onClick={connect}
        >
          Connect wallet {account}
        </button>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-[27px] font-bold">
            Address:{" "}
            <span className=" text-sm border font-normal">{account} </span>
          </p>
          <button
            className="w-[20%] rounded-md bg-gray-800 text-white p-3"
            onClick={() => {
              connection?.disconnect();
            }}
          >
            Disconnect
          </button>
        </div>
      )}

      <h2 className="text-[27px] font-medium"> Create a to-do</h2>
      <div className="bordr border-gray-800 mt-5 flex gap-5">
        <input
          type="text"
          placeholder="new todo"
          className="w-ful border border-gray-800 px-2 py-3 rounded-md w-[70%] bg-transparent outline-none"
        />
        <button
          className=" w-[30%] rounded-md bg-gray-800 text-white"
          onClick={() => updateContracts()}
        >
          Create
        </button>
      </div>
      <div className="mt-10">
        <p className="text-[30px] mb-5">My to-dos</p>
        <div className="flex flex-col gap-4">
          {todos.length > 0 ? (
            todos.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between mb-3">
                  <h3 className="text-[25px]">{item.description}</h3>
                  <button className="text-[15px] rounded-md bg-gray-800 p-2 px-3 text-white">
                    create subtask
                  </button>
                </div>
                {item.tasks.length > 0 ? (
                  item?.tasks?.map((task) => (
                    <div
                      key={task.id}
                      className="flex justify-between bg-[#f8f1d5] mb-5 p-2"
                    >
                      <span>{task.description}</span>
                      <input type="checkbox" />
                    </div>
                  ))
                ) : (
                  <p className="">No sub to-dos available</p>
                )}
              </div>
            ))
          ) : (
            <p className="">No to-dos available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
