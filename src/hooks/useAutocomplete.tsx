import { useQuery } from "@tanstack/react-query";

const API_URL = "https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete";

export interface AutocompleteItem {
  id: string;
  name: string;
  category: string;
  value?: string | number;
  inputs?: string;
}

async function fetchSuggestions(query: string): Promise<AutocompleteItem[]> {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("Failed to fetch suggestions");
  }

  const data: AutocompleteItem[] = await res.json();

  // Фільтрування за назвою
  const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return filtered;
}

export function useAutocomplete(query: string) {
  return useQuery({
    queryKey: ["autocomplete", query],
    queryFn: () => fetchSuggestions(query),
    enabled: Boolean(query), // виконується тільки, якщо query непорожнє
  });
}
