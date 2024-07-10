// Example module schema JSON object

const contractInterface = {
  version: 1,
  schema: {
    get_user_todo: [
      {
        Enum: [
          {
            None: [],
          },
          {
            Some: [
              {
                all_task: [
                  {
                    description: "string",
                    id: {
                      Enum: [
                        {
                          Account: ["string"],
                        },
                        {
                          Contract: [
                            {
                              index: "number",
                              subindex: "number",
                            },
                          ],
                        },
                      ],
                    },
                    tasks: [
                      {
                        completed: "boolean",
                        description: "string",
                        id: "number",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        Enum: [
          {
            Account: ["string"],
          },
          {
            Contract: [
              {
                index: "number",
                subindex: "number",
              },
            ],
          },
        ],
      },
    ],
  },
};

function convertToVersionedSchemaBuffer(schemaObject) {
  const jsonString = JSON.stringify(schemaObject);
  const encoder = new TextEncoder();
  return encoder.encode(jsonString).buffer;
}

// Example usage
const versionedSchemaObject = {
  version: 1,
  schema: {
    // Your contract schema details here
  },
};
export const versionedSchemaBuffer = convertToVersionedSchemaBuffer(
  versionedSchemaObject
);

export function userTodoSchema() {
  // Step 1: Serialize JSON to string
  const jsonString = JSON.stringify(contractInterface);

  // Step 2: Convert string to ArrayBuffer
  const encoder = new TextEncoder();
  const moduleSchemaArrayBuffer = encoder.encode(jsonString).buffer;

  // Now `moduleSchemaArrayBuffer` can be used as `ArrayBuffer` in your function calls.
  console.log(moduleSchemaArrayBuffer);
  return moduleSchemaArrayBuffer;
}
