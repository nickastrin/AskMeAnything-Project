import React, { useState } from "react";

const UserAnswers = ({ answers }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  let renderedAnswers = answers.map((answer) => {
    return (
      <div
        key={answer.answer_id}
        className="post-list"
        onClick={() => {
          window.location.href = "/question/" + answer.question_id;
        }}
      >
        <div className="question-select" style={{ fontWeight: "500" }}>
          {answer.title}
        </div>
        <div className="list-font">{answer.body}</div>
      </div>
    );
  });

  if (renderedAnswers.length === 0) {
    renderedAnswers = (
      <span className="centered-font">You have no Answers</span>
    );
  }

  return (
    <div>
      <button
        className="show-btn"
        onClick={() => {
          setShowAnswers(!showAnswers);
        }}
        style={{ marginTop: "10px" }}
      >
        Your Answers:{" "}
      </button>
      {showAnswers && renderedAnswers}
    </div>
  );
};

export default UserAnswers;
