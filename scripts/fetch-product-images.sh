#!/usr/bin/env bash
# Downloads every product photo listed in product-images.tsv into public/products/.
#
# The source URLs are Foodpanda's CDN. We copy rather than hotlink so the site
# keeps working if those paths rotate, and so next/image can optimise them.
# Re-runnable: existing non-empty files are skipped.
set -uo pipefail
cd "$(dirname "$0")/.."
manifest="scripts/product-images.tsv"
out="public/products"
mkdir -p "$out"
fail=0
while IFS=$'\t' read -r slug url; do
  [ -z "${slug:-}" ] && continue
  dest="$out/$slug.jpg"
  if [ -s "$dest" ]; then echo "skip  $slug"; continue; fi
  code=$(curl -sS -L --max-time 45 -o "$dest" -w '%{http_code}' "$url" || echo 000)
  if [ "$code" = "200" ] && [ -s "$dest" ]; then
    echo "ok    $slug  ($(wc -c < "$dest") bytes)"
  else
    echo "FAIL  $slug  http=$code  $url"
    rm -f "$dest"
    fail=$((fail + 1))
  fi
done < "$manifest"
echo "---"
echo "failures: $fail"
exit $fail
