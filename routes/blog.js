const express = require("express");

const db = require("../data/database");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.redirect("/posts");
});

router.get("/posts", async (req, res, next) => {
  const [posts] = await db.query(
    "SELECT posts.*, authors.name AS author_name FROM posts INNER JOIN authors ON (posts.author_id = authors.id)"
  );
  //   console.log(posts);
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async (req, res, next) => {
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async (req, res, next) => {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    "INSERT INTO posts (title, summary, body, author_id) VALUES (?)",
    [data]
  );
  res.redirect("/posts");
});

router.get("/post-detail/:id", async (req, res, next) => {
  const postId = req.params.id;
  const [post] = await db.query(
    `SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts INNER JOIN authors ON (posts.author_id = authors.id) WHERE posts.id = ${postId} `,
    [postId]
  );

  const postData = {
    ...post[0],
    date: post[0].date.toISOString(),
    humanReadableDate: post[0].date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  };

  res.render("post-detail", { post: postData });
});

router.get("/post-edit/:id", async (req, res, next) => {
  const postId = req.params.id;
  const [post] = await db.query(
    `SELECT * FROM posts WHERE posts.id = ${postId} `,
    [postId]
  );

  res.render("update-post", { post: post[0] });
});

router.post("/post-update", async (req, res, next) => {
  const updateData = req.body;
  // console.log(updateData.postId);
  await db.query(
    "UPDATE posts SET title = ?, summary = ?, body = ? WHERE id = ?",
    [req.body.title, req.body.summary, req.body.content, req.body.postId]
  );
  res.redirect("/posts");
});

router.post("/post-delete", async (req, res, next) => {
    const postId = req.body.postId

    await db.query("DELETE FROM posts WHERE id = ?", [postId])

    res.redirect("/posts")
})

module.exports = router;
