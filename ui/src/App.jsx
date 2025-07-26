import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from "@tanstack/react-query";
import React from "react";

import { getList, updateSort } from "./api";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  );
}

function SearchBar({
  searchQuery,
  setSearchQuery,
  sort,
  setSort,
  sortMutation,
  topRef,
}) {
  const handleSort = (e) => {
    if (topRef.current) {
      topRef.current.scrollIntoView();
    }
    setSort(e.target.value);
    sortMutation.mutate(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="search">
      <input
        className="search-input"
        placeholder="Search"
        onChange={handleSearch}
        value={searchQuery}
      />
      <div className="search-sort_flexbox">
        <p>Sort value</p>
        <select
          className="search-sort"
          name="sorting"
          onChange={handleSort}
          value={sort}
        >
          <option value="ASC">ASC</option>
          <option value="DESC">DESC</option>
        </select>
      </div>
    </header>
  );
}

const combineArrays = (first, second) => {
  // Create a Set of IDs from the first array for quick lookup
  const firstIds = new Set(first.map((item) => item.id));

  // Filter second array to get items not in first array
  const uniqueFromSecond = second.filter((item) => !firstIds.has(item.id));

  // Concatenate while preserving order
  return [...first, ...uniqueFromSecond];
};

function Todos() {
  const queryClient = useQueryClient();

  const loaderRef = React.useRef(null);

  const [searchQuery, setSearchQuery] = React.useState("");

  const [sort, setSort] = React.useState("");

  const [orderedTodos, setOrderedTodos] = React.useState([]);
  const [draggedItem, setDraggedItem] = React.useState(null);

  const topRef = React.useRef(null);

  const orderMutation = useMutation({
    mutationFn: updateSort,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["todos"] });
    },
  });

  const sortMutation = useMutation({
    mutationFn: updateSort,
    onSuccess: () => {
      setOrderedTodos([]);
      // queryClient.invalidateQueries({ queryKey: ["todos"] });
       queryClient.resetQueries({ queryKey: ['todos']});
    },
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["todos", searchQuery],
      queryFn: getList,
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextPage : undefined,
    });

  React.useEffect(() => {
    if (data?.pages.at(0)) {
      setSort(data?.pages.at(0).sort);
    }

    if (searchQuery === "") {
      setOrderedTodos((prev) =>
        combineArrays(prev, data?.pages.flatMap((page) => page.data) || [])
      );
    } else {
      setOrderedTodos(data?.pages.flatMap((page) => page.data) || []);
    }
  }, [data]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [selected, setSelected] = React.useState(new Set());
  const [lastSelected, setLastSelected] = React.useState(null);

  const handleSelect = (e, id) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (!e.shiftKey) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }

        return newSet;
      }

      const from = Math.min(lastSelected, id, ...selected);
      const to = id;
      const rangeSet = new Set();
      for (let i = from; i <= to; i++) {
        rangeSet.add(i);
      }

      return rangeSet;
    });

    setLastSelected(id);
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedItem(id);
    e.currentTarget.style.opacity = "0.4";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedItem(null);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "white";

    if (draggedItem === targetId) return;

    const sourceId = draggedItem;
    const sourceIndex = orderedTodos.findIndex((todo) => todo.id === sourceId);
    const targetIndex = orderedTodos.findIndex((todo) => todo.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Reorder the todos
    const newTodos = [...orderedTodos];
    const [movedItem] = newTodos.splice(sourceIndex, 1);
    newTodos.splice(targetIndex, 0, movedItem);

    setOrderedTodos(newTodos);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "#f0f9ff";
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "white";
  };

  return (
    <>
      <div ref={topRef} className="absolute top-0"></div>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sort={sort}
        setSort={setSort}
        sortMutation={sortMutation}
        topRef={topRef}
      />

      <main>
        {status === "pending" ? (
          <p>Is loading...</p>
        ) : status === "error" ? (
          <p>Opps... something went wrong.</p>
        ) : (
          <ul className="list">
            {orderedTodos.map((todo, id) => (
              <li
                className="card"
                key={id}
                style={{
                  cursor: "pointer",
                  backgroundColor: selected.has(todo.id)
                    ? "gainsboro"
                    : "white",
                }}
                onClick={(e) => handleSelect(e, todo.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, todo.id)}
              >
                <div className="card-text">
                  <p>{todo.value}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div ref={loaderRef} className="loader">
          {isFetchingNextPage ? (
            <div className="loading-indicator">Loading more posts...</div>
          ) : hasNextPage ? (
            <div className="load-more">Scroll down to load more</div>
          ) : (
            <></>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
