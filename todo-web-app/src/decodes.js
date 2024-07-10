// Decode the entire return value
export function decodeReturnValue(buffer) {
  const decodedValue = [];

  // Decode the first element
  const [someTag, someOffset] = decodeTag(buffer, 0);
  if (someTag === 0) {
    const [allTasks, allTasksOffset] = decodeAllTasks(buffer, someOffset);
    decodedValue.push({ Some: allTasks });
  }

  // Decode the second element (Account)
  const [accountTag, accountOffset] = decodeTag(buffer, someOffset);
  if (accountTag === 1) {
    const [accountAddress, addressOffset] = decodeAddress(
      buffer,
      accountOffset
    );
    decodedValue.push({ Account: [accountAddress] });
  }

  return decodedValue;
}

// Decode tag and return offset
function decodeTag(buffer, offset) {
  const tag = buffer.readUInt8(offset);
  return [tag, offset + 1];
}

// Decode all_task array
function decodeAllTasks(buffer, offset) {
  const allTasks = [];
  const [tasksLength, tasksOffset] = decodeTag(buffer, offset);
  let currentOffset = tasksOffset;

  for (let i = 0; i < tasksLength; i++) {
    const [mainTask, mainTaskOffset] = decodeMainTask(buffer, currentOffset);
    allTasks.push(mainTask);
    currentOffset = mainTaskOffset;
  }

  return [allTasks, currentOffset];
}

// Decode a single MainTask
function decodeMainTask(buffer, offset) {
  const [id, idOffset] = decodeId(buffer, offset);
  const [description, descriptionOffset] = decodeString(buffer, idOffset);
  const [tasks, tasksOffset] = decodeTasks(buffer, descriptionOffset);

  const mainTask = {
    id,
    description,
    tasks,
  };

  return [mainTask, tasksOffset];
}

// Decode id object
function decodeId(buffer, offset) {
  const idObject = {};
  const [account, accountOffset] = decodeAccount(buffer, offset);
  idObject["Account"] = [account];
  return [idObject, accountOffset];
}

// Decode Account string
function decodeAccount(buffer, offset) {
  const accountLength = 42; // Length of Account string (including prefix)
  const accountBuffer = buffer.slice(offset, offset + accountLength);
  const account = accountBuffer.toString("utf8");
  return [account, offset + accountLength];
}

// Decode tasks array
function decodeTasks(buffer, offset) {
  const tasks = [];
  const [tasksLength, tasksOffset] = decodeTag(buffer, offset);
  let currentOffset = tasksOffset;

  for (let i = 0; i < tasksLength; i++) {
    const [task, taskOffset] = decodeTask(buffer, currentOffset);
    tasks.push(task);
    currentOffset = taskOffset;
  }

  return [tasks, currentOffset];
}

// Decode a single task
function decodeTask(buffer, offset) {
  const task = {};
  const [completed, completedOffset] = decodeBool(buffer, offset);
  const [description, descriptionOffset] = decodeString(
    buffer,
    completedOffset
  );
  const [id, idOffset] = decodeTag(buffer, descriptionOffset);

  task.completed = completed;
  task.description = description;
  task.id = id;

  return [task, idOffset];
}

// Decode boolean value
function decodeBool(buffer, offset) {
  const boolValue = buffer.readUInt8(offset) === 1;
  return [boolValue, offset + 1];
}

// Decode string value
function decodeString(buffer, offset) {
  const [stringLength, stringOffset] = decodeTag(buffer, offset);
  const stringBuffer = buffer.slice(stringOffset, stringOffset + stringLength);
  const stringValue = stringBuffer.toString("utf8");
  return [stringValue, stringOffset + stringLength];
}
