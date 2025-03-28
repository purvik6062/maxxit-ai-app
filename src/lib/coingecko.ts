export async function fetchPriceData(coinId: string): Promise<[number, number][] | null> {
  const url = `https://www.coingecko.com/price_charts/${coinId}/usd/365_days.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.stats; // Array of [timestamp, price]
  } catch (error) {
    console.error(`Error fetching price data for ${coinId}:`, error);
    return null;
  }
}