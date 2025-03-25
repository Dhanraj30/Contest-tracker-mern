import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ContestContext = createContext();

export const ContestProvider = ({ children }) => {
  const [contests, setContests] = useState([]);
  const [solutionLinks, setSolutionLinks] = useState([]);
  const [filters, setFilters] = useState(['codeforces', 'codechef', 'leetcode']);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    axios.get('http://localhost:5000/api/contests')
      .then(res => {
        setContests(res.data.contests);
        setSolutionLinks(res.data.solutionLinks);
      });
  }, []);

  const toggleBookmark = (id) => {
    axios.post(`http://localhost:5000/api/bookmark/${id}`)
      .then(res => {
        setContests(contests.map(c => c._id === id ? res.data : c));
      });
  };

  return (
    <ContestContext.Provider value={{ contests, solutionLinks, filters, setFilters, theme, setTheme, toggleBookmark }}>
      {children}
    </ContestContext.Provider>
  );
};