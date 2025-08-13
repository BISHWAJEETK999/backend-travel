import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}

export default function SearchBar({ placeholder, value, onChange, onSearch }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="search-container">
      <div className="relative">
        <Input
          type="text"
          className="search-input text-gray-900 placeholder-gray-500"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid="destination-search-input"
        />
        <Button 
          type="submit"
          className="search-btn"
          data-testid="search-button"
        >
          <i className="bi bi-search"></i>
        </Button>
      </div>
    </form>
  );
}
