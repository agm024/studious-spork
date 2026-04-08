const API =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://Gruhaveda-products-fqdz.onrender.com/api" : "http://127.0.0.1:8000/api");

let productsCache = null;
let productsPromise = null;
let productsCacheTs = 0;
let productByIdCache = new Map();
let productByIdPromises = new Map();

const PRODUCT_LIST_CACHE_TTL_MS = 2 * 60 * 1000;
const PRODUCT_DETAIL_CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;

function isRetryableError(error) {
  const msg = String(error?.message || "").toLowerCase();
  return msg.includes("network") || msg.includes("timeout") || msg.includes("failed to fetch");
}

async function fetchJsonWithTimeout(url, { timeoutMs = FETCH_TIMEOUT_MS, retries = 0 } = {}) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        const err = new Error(`Request failed: ${res.status}`);
        err.status = res.status;
        throw err;
      }
      return await res.json();
    } catch (error) {
      if (error?.name === "AbortError") {
        lastError = new Error("Request timeout");
      } else {
        lastError = error;
      }

      const canRetry = attempt < retries && isRetryableError(lastError);
      if (!canRetry) {
        throw lastError;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error("Request failed");
}

function toString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isLocalNetworkHost(hostname) {
  if (!hostname) return false;
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") return true;
  if (host.startsWith("10.")) return true;
  if (host.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

export function normalizeImageUrl(url) {
  const value = toString(url);
  if (!value) return "";

  try {
    const parsed = new URL(value);
    const pageProtocol = typeof window !== "undefined" ? window.location.protocol : "http:";
    const pageHostname = typeof window !== "undefined" ? window.location.hostname : "";

    // Rewrite local-only image hosts to the currently accessed host for LAN/mobile access.
    if (pageHostname && ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname.toLowerCase())) {
      parsed.hostname = pageHostname;
    }

    // Upgrade http images to https when page runs on https.
    if (parsed.protocol === "http:" && pageProtocol === "https:") {
      parsed.protocol = "https:";
    }

    return parsed.toString();
  } catch {
    return value;
  }
}

function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => normalizeImageUrl(v)).filter(Boolean);
  }
  const one = normalizeImageUrl(value);
  return one ? [one] : [];
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeFeatures(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanText(item))
      .filter(Boolean);
  }

  const text = cleanText(value);
  if (!text) return [];

  return text
    .split(/\r?\n|[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeProduct(raw) {
  if (!raw || typeof raw !== "object") return null;

  const gallery = asStringArray(raw.gallery_urls || raw.gallery);
  const imageValues = asStringArray(raw.image_url || raw.image);
  const image = imageValues.length ? imageValues[0] : gallery[0] || "";

  const shortDescription = cleanText(raw.shortDescription) || cleanText(raw.short_description);
  const description = cleanText(raw.description);
  const unitValue = Number(raw.unit_value ?? raw.unitValue ?? 1);
  const unit = cleanText(raw.unit || raw.unitLabel || "pc").toLowerCase() || "pc";
  const rawSizeStock = raw.size_stock || raw.sizeStock;
  const sizeStock = Object.entries(
    rawSizeStock && typeof rawSizeStock === "object" ? rawSizeStock : {}
  ).reduce((acc, [size, qty]) => {
    const sizeKey = String(size || "").trim();
    const quantity = Number(qty);
    if (!sizeKey || !Number.isFinite(quantity) || quantity < 0) return acc;
    acc[sizeKey] = Math.floor(quantity);
    return acc;
  }, {});

  return {
    ...raw,
    id: Number(raw.id),
    image_url: image,
    image,
    gallery_urls: gallery.length ? gallery : (image ? [image] : []),
    gallery: gallery.length ? gallery : (image ? [image] : []),
    short_description: shortDescription,
    shortDescription,
    description,
    unit_value: Number.isFinite(unitValue) && unitValue > 0 ? unitValue : 1,
    unitValue: Number.isFinite(unitValue) && unitValue > 0 ? unitValue : 1,
    unit,
    size_stock: sizeStock,
    sizeStock,
    features: normalizeFeatures(raw.features),
    product_code: raw.product_code || raw.productCode || "",
    productCode: raw.productCode || raw.product_code || "",
  };
}

export async function fetchProducts({ useCache = true } = {}) {
  const listCacheAlive = productsCache && Date.now() - productsCacheTs < PRODUCT_LIST_CACHE_TTL_MS;
  if (useCache && listCacheAlive) return productsCache;
  if (useCache && productsPromise) return productsPromise;

  productsPromise = fetchJsonWithTimeout(`${API}/products/`, { retries: 0 })
    .then((data) => {
      const rows = Array.isArray(data?.products) ? data.products : [];
      const normalized = rows.map(normalizeProduct).filter(Boolean);
      productsCache = normalized;
      productsCacheTs = Date.now();
      return normalized;
    })
    .finally(() => {
      productsPromise = null;
    });

  return productsPromise;
}

export async function fetchProductById(id) {
  const key = String(id);
  const cached = productByIdCache.get(key);
  if (cached && Date.now() - cached.cachedAt < PRODUCT_DETAIL_CACHE_TTL_MS) {
    return cached.value;
  }

  if (productByIdPromises.has(key)) {
    return productByIdPromises.get(key);
  }

  const request = fetchJsonWithTimeout(`${API}/products/${id}/`, { retries: 0 })
    .then((data) => {
      const normalized = normalizeProduct(data?.product);
      productByIdCache.set(key, { value: normalized, cachedAt: Date.now() });
      return normalized;
    })
    .catch((error) => {
      if (Number(error?.status) === 404) {
        productByIdCache.set(key, { value: null, cachedAt: Date.now() });
        return null;
      }
      throw error;
    })
    .finally(() => {
      productByIdPromises.delete(key);
    });

  productByIdPromises.set(key, request);
  return request;
}

export function clearProductsCache() {
  productsCache = null;
  productsPromise = null;
  productsCacheTs = 0;
  productByIdCache = new Map();
  productByIdPromises = new Map();
}
