export default function Filters({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  sortBy,
  setSortBy,
  maxPrice,
  setMaxPrice,
  minRating = 0,
  setMinRating,
  priceMin = 500,
  priceMax = 13000,
  priceStep = 500,
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
      {/* Category */}
      <select
        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="All">All Categories</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Sort */}
      <select
        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="default">Sort: Relevance</option>
        <option value="priceLowHigh">Price: Low → High</option>
        <option value="priceHighLow">Price: High → Low</option>
        <option value="ratingHigh">Rating: High → Low</option>
        <option value="nameAZ">Name: A → Z</option>
      </select>

      {/* Min rating */}
      <select
        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        value={minRating}
        onChange={(e) => setMinRating(Number(e.target.value))}
      >
        <option value={0}>Any Rating</option>
        <option value={3}>★ 3 &amp; above</option>
        <option value={4}>★ 4 &amp; above</option>
        <option value={4.5}>★ 4.5 &amp; above</option>
      </select>

      {/* Price range */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Max Price</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">₹{maxPrice.toLocaleString("en-IN")}</span>
        </div>
        <input
          type="range"
          min={priceMin}
          max={priceMax}
          step={priceStep}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>₹{priceMin.toLocaleString("en-IN")}</span>
          <span>₹{priceMax.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}