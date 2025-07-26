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

export function updateSelected(page, items) {}

export function newStore(filename) {
  try {
    const rawData = fs.readFileSync(filename);
    storeData = JSON.parse(rawData);
    storeData.sort;
  } catch (err) {
    console.error("Error reading file:", err);
  }
}
