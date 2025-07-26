const API = "http://localhost:3000";

export async function getList({ pageParam = 1, limit = 20, queryKey }) {
  try {
    let url = `${API}/api/tasks?page=${pageParam}&limit=${limit}`;
    const [_, searchQuery] = queryKey;
    if (searchQuery) {
      url = `${url}&query=${searchQuery}`;
    }

    const resp = await fetch(url);
    if (!resp.ok) {
      throw Error(`error while fetching api todo list: ${resp.statusText}`);
    }

    const body = await resp.json();

    return {
      data: body.data,
      nextPage: pageParam + 1,
      hasMore: pageParam < body.pages,
      sort: body.sort,
    };
  } catch (err) {
    console.log(err);
    return {
      data: [],
      nextPage: pageParam,
      hasMore: true,
      sort: body.sort,
    };
  }
}

export async function updateSort(sort) {
  try {
    const resp = await fetch(`${API}/api/tasks/sort?order=${sort}`, {
      method: "POST",
    });
    if (!resp.ok) {
      throw Error("cannot update sort option");
    }
    return await resp.json();
  } catch (err) {
    console.log(err);
  }
}
