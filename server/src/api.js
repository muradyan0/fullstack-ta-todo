import { Router } from "express";

import { getList, updateSort, updateTasks } from "./store.js";

export const router = Router();

router.get("/", (req, res) => {
  try {
    res.send(
      getList({
        page: req.query.page,
        query: req.query.query,
      })
    );
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post("/sort", (req, res) => {
  if (!req.query.order) {
    res.sendStatus(400);
    return;
  }

  try {
    const newSort = updateSort(req.query.order);
    res.send({ sort: newSort });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.post("/", (req, res) => {
  try {
    updateTasks(req.body);
    res.sendStatus(200)
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});
