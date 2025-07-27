import fs from "fs";

let storeData = [];
let storeSort = "DESC";

export function getList({ query, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  let data = storeData;
  if (query) {
    data = data
      .filter((i) => String(i.value).includes(query))
      .sort((a, b) =>
        storeSort === "ASC" ? a.value - b.value : b.value - a.value
      );
  }

  return {
    data: data.slice(offset, offset + limit),
    pages: Math.ceil(data.length / limit),
    sort: storeSort,
  };
}

export function updateSort(sort) {
  if (sort && ["ASC", "DESC"].includes(sort.toUpperCase())) {
    storeSort = sort;
    storeData.sort((a, b) =>
      storeSort === "ASC" ? a.value - b.value : b.value - a.value
    );
    return storeSort;
  }
}
function immutableMoveById(array, id, newIndex) {
  const oldIndex = array.findIndex((item) => item.id === id);
  if (oldIndex === -1) return array;

  const item = array[oldIndex];
  const filtered = array.filter((_, i) => i !== oldIndex);

  return [...filtered.slice(0, newIndex), item, ...filtered.slice(newIndex)];
}

export function updateTasks(tasks) {
  tasks.forEach((element) => {
    if (element.index) {
      storeData = immutableMoveById(storeData, element.id, element.index);
    }

    storeData = storeData.map((saved) => {
      if (saved.id === element.id) {
        return { ...saved, ...element };
      }
      return saved;
    });
  });
}

export function newStore(filename) {
  try {
    const rawData = fs.readFileSync(filename);
    storeData = JSON.parse(rawData);
    storeData.sort((a, b) =>
      storeSort === "ASC" ? a.value - b.value : b.value - a.value
    );
  } catch (err) {
    console.error("Error reading file:", err);
  }
}
