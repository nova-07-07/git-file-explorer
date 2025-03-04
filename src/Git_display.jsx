import { useState } from 'react';
import './App.css';

function GitDisplay() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiUrl, setApiUrl] = useState("");
    const [history, setHistory] = useState([]);

    async function getData(url) {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 403) {
                    setError("GitHub API rate limit exceeded. Try again later.");
                } else if (response.status === 404) {
                    setError("Repository not found. Check the URL.");
                } else {
                    setError("Failed to load repository contents.");
                }
                setData(null);
            } else {
                const jsonData = await response.json();
                setData(jsonData);
            }
        } catch (error) {
            setError("An error occurred while fetching data.");
            setData(null);
        }

        setLoading(false);
    }

    function handleInput(e) {
        let urlInput = e.target.value.trim();
        setError(null);
        setHistory([]);

        const urlParts = urlInput.split("/");
        if (urlParts.length < 5 || urlParts[2] !== "github.com") {
            setError("Invalid GitHub repository URL.");
            setData(null);
            return;
        }

        const owner = urlParts[3];
        const repo = urlParts[4];
        const newApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

        setApiUrl(newApiUrl);
        getData(newApiUrl);
    }

    function handleClick(item) {
        if (item.type === "dir") {
            const newUrl = `${apiUrl}/${item.name}`;
            setHistory((prev) => [...prev, apiUrl]);
            setApiUrl(newUrl);
            getData(newUrl);
        }
    }

    function handleBack() {
        if (history.length > 0) {
            const prevUrl = history.pop(); 
            setHistory([...history]);
            setApiUrl(prevUrl);
            getData(prevUrl);
        }
    }

    return (
        <>
            <div className="navbar" style={{ backgroundColor: loading ? 'blue' : 'lightblue' }}>
                {history.length > 0 && (
                    <button onClick={handleBack} className="back-btn">⬅ Back</button>
                )}
                <input 
                    className="url_input" 
                    onChange={handleInput} 
                    type="text" 
                    placeholder="Enter GitHub repo URL"
                />
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="repo-content">
                {data ? (
                    data.map((item, index) => (
                        <div 
                            key={index} 
                            onClick={() => item.type === "dir" && handleClick(item)} 
                            className={item.type === "dir" ? "folder" : "files"}
                        >
                            <h1>{item.type === "dir" ? "📁" : "📄"}</h1> 
                            <span>{item.name}</span>
                        </div>
                    ))
                ) : (
                    !error && <p>Enter a valid GitHub repository URL to view contents.</p>
                )}
            </div>
        </>
    );
}

export default GitDisplay;
