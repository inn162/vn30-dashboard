export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const { ticker } = req.query;
    const today = new Date().toISOString().split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    try {
      const response = await fetch(
        `https://api.vndirect.com.vn/v4/stock_prices?code=${ticker}&sort=date&size=30&page=1`
      );
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: "fetch failed" });
    }
  }