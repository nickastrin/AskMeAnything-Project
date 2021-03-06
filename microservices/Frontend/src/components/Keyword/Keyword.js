import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import ListQuestions from "../Functions/ListQuestions.js";
import Pagination from "../Functions/Pagination.js";

require("dotenv").config();

const Keyword = () => {
  const { page, tag } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(page);
  const [questionsPerPage] = useState(10);

  const queryURL = useRef(process.env.REACT_APP_QueryService);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await axios.get(queryURL.current + `/query/keyword/${tag}`);
      console.log(res.data);
      setQuestions(res.data);
      setLoading(false);
    };

    fetchData();
  }, [tag]);

  const indexOfLastQ = currentPage * questionsPerPage;
  const indexOfFirstQ = indexOfLastQ - questionsPerPage;
  const currentQ = questions.slice(indexOfFirstQ, indexOfLastQ);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <h1 className="form-font-2">
        <span className="normal-font">{"Questions with tag " + tag} </span>
        <span className="colored-font"> !</span>
      </h1>
      <ListQuestions questions={currentQ} loading={loading} />
      <Pagination
        questionsPerPage={questionsPerPage}
        totalQuestions={questions.length}
        paginate={paginate}
      />
    </div>
  );
};

export default Keyword;
