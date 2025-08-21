import React, { useState, useEffect } from "react";
import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import axios from "axios";

interface SearchResult {
  id: number | string;
  type: string;
  label: string;
}

export function Header() {
  const { signOut, user } = useAuth();
  const { dispatch } = useApp();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:3001/api/search`,
          { params: { q } }
        );

        // Accept either `{ results: [...] }` or `[...]`
        const payload = res?.data;
        const incoming = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
          ? payload.results
          : [];

        // Ensure it's valid objects
        const safe = incoming.filter(
          (r: any) =>
            r &&
            (typeof r.id === "number" || typeof r.id === "string") &&
            typeof r.type === "string" &&
            typeof r.label === "string"
        );

        setResults(safe);
      } catch (e) {
        console.error("Search API failed:", e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [query]);

  const handleNavigate = (item: SearchResult) => {
    // Navigate based on search result type
    switch (item.type.toLowerCase()) {
      case 'user':
      case 'team member':
        dispatch({ type: 'SET_SELECTED_VIEW', payload: 'teams' });
        break;
      case 'project':
        dispatch({ type: 'SET_SELECTED_VIEW', payload: 'projects' });
        dispatch({ type: 'SET_SELECTED_PROJECT', payload: String(item.id) });
        break;
      case 'task':
        dispatch({ type: 'SET_SELECTED_VIEW', payload: 'tasks' });
        break;
      case 'team':
        dispatch({ type: 'SET_SELECTED_VIEW', payload: 'teams' });
        break;
      case 'category':
        dispatch({ type: 'SET_SELECTED_VIEW', payload: 'projects' });
        break;
      case 'analytics':
        dispatch({ type: 'SET_SELECTED_VIEW', payload: 'analytics' });
        break;
      default:
        dispatch({ type: 'SET_SELECTED_VIEW', payload: 'dashboard' });
        break;
    }
    
    // Clear search after navigation
    setQuery("");
    setResults([]);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex items-center flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects, tasks, or team members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {/* Loading Indicator */}
            {loading && (
              <span className="absolute right-3 top-2 text-xs text-gray-400">
                ...
              </span>
            )}

            {/* Suggestions Dropdown */}
            {results.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-60 overflow-auto z-50">
                {results.map((item) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleNavigate(item)}
                  >
                    <span className="font-semibold text-gray-700">
                      {item.type}:
                    </span>{" "}
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
