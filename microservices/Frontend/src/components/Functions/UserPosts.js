import React, { useState } from "react";

const UserPosts = ({ posts }) => {
  const [showPosts, setShowPosts] = useState(false);

  let renderedPosts = posts.map((post) => {
    return (
      <div
        className="post-list"
        key={post.question_id}
        onClick={() => {
          window.location.href = "/question/" + post.question_id;
        }}
      >
        <div className="list-font">{post.title}</div>
      </div>
    );
  });

  if (renderedPosts.length === 0) {
    renderedPosts = <span className="centered-font">You have no Posts</span>;
  }

  return (
    <div style={{ marginTop: "40px" }}>
      <button
        className="show-btn"
        onClick={() => {
          setShowPosts(!showPosts);
        }}
      >
        Your Posts:{" "}
      </button>
      {showPosts && renderedPosts}
    </div>
  );
};

export default UserPosts;
