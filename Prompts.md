# Demo Prompts (Copy/Paste Ready)

Replace placeholders before sending: {ORG}, {SITE}, {BRANCH}, {PATH}, {DOMAINKEY}.
Keep outputs brief and structured for on-screen clarity.

## Section 2: Create a Complex Block (Testimonials Carousel)

### 2.1 Discover patterns and references
```text
Use the AEM docs tool to find 3-5 relevant references for implementing a rotating/auto-advancing testimonials carousel block for Edge Delivery Services. Query ideas: "block carousel", "autoplay", "testimonial", "interactive block". Return a bullet list with: title, 1-line summary, URL.
```

### 2.2 Explore block collection for adjacent patterns
```text
Use the block collection tools: list blocks, then suggest the 2-3 closest blocks to a testimonials carousel (e.g., hero, cards, tabs, slider-like). For each suggestion, provide: block name, why it’s relevant, and whether code patterns are reusable. If none are exact, suggest composition strategies.
```

### 2.3 Plan and scaffold
```text
Propose a minimal plan to implement a testimonials-carousel block. Output:
- File tree under /blocks/testimonials-carousel/
- Data model (fields for image, quote, author, role, link)
- Interaction behaviors (auto-rotate, pause on hover, keyboard focus)
- Accessibility notes (ARIA roles, focus management)
Keep it to ~8 bullets.
```

### 2.4 Generate initial files
```text
Create the following files with minimal working code and clear TODO markers:
- /blocks/testimonials-carousel/testimonials-carousel.css
- /blocks/testimonials-carousel/testimonials-carousel.js
- /blocks/testimonials-carousel/README.md
Assume markup as a table-like block with rows of testimonials. Include:
- Auto-rotate with configurable interval via data attribute
- Pause on hover and when window/tab not visible
- Basic responsive styles
Output only the file contents, one file per code fence, no extra commentary.
```

### 2.5 Iterate: refine behavior
```text
Add: swipe/drag on touch, keyboard left/right navigation, and reduced-motion preference support. Provide only the updated snippets (not full files). Keep changes focused.
```

---

## Section 3: Index Definition + Block Update

### 3.1 Learn the index model
```text
Use the AEM docs tool to find how to define and extend an index in Edge Delivery Services. Return the 3 most relevant links with 1-line summaries. Focus on: index file location/format, schema/fields, re-indexing.
```

### 3.2 Propose the change
```text
I want a blog index with a boolean field `featured` to highlight posts. Propose the exact index change (show the JSON/CSV/schema as applicable) and where it lives in the repo. Include validation rules and a short test plan.
```

### 3.3 Admin API: update + re-index
```text
Help me perform this via Admin API. Derive from docs and produce concrete, copyable curl commands using placeholders:
- Update index definition: {ORG}, {SITE}, {BRANCH}
- Trigger re-index
- Check re-index status
Do not invent endpoints—cite the docs you rely on and show the request/response shape.
```

### 3.4 Update a block to use the new field
```text
Update (or create) a /blocks/featured-posts/ block that reads the index and renders posts where featured=true. Provide:
- Data access strategy (client-side fetch vs. build-time)
- Minimal CSS/JS (only new/changed parts)
- Fallback behavior when `featured` missing
Keep output tight and focused.
```

---

## Section 4: Page Status + Publishing Workflow

### 4.1 Site-wide unpublished changes
```text
Use start-bulk-status with: org={ORG}, site={SITE}, branch={BRANCH}. Then use check-bulk-status with the returned jobId. Output a compact table (path | status | previewLastModified | publishLastModified). Filter to: status in ["Not published", "Pending changes"]. Sort by most recent preview.
```

### 4.2 Stale pages
```text
Using bulk status results, list pages last published > 7 days ago. Output top 10 by oldest publish date. Include publishLink.
```

### 4.3 Single page check (ad hoc)
```text
Use page-status for: org={ORG}, site={SITE}, branch={BRANCH}, path={PATH}. Return a single-line summary: status; last preview/publish; who did the last action if available; previewLink/publishLink.
```

---

## Extras (Use selectively if time allows)

### Audit log quick scan
```text
Use audit-log with: org={ORG}, site={SITE}, branch={BRANCH}, since=24h. Return 5 notable entries (errors, slow ops >3s, publish events). Show: timestamp (UTC), route, path, status, duration, user.
```

### Performance spot check (RUM)
```text
Use rum-data with: url=https://{SITE}--{ORG}.aem.live/, domainkey={DOMAINKEY}, aggregation=lcp. Return just the p75 value and the dateRange.
```
